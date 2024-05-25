import express from 'express';
import dotenv from "dotenv";
import path from "path";
import { connect, Actors, ActorsCollection, getActorById, seed } from "./database";
import { Actor } from "./types";
import { Collection, MongoClient, ObjectId } from "mongodb";
import session from "express-session";
import authRoutes from "./routes/auth";
import { ensureAuthenticated, ensureNotAuthenticated } from './middlewares/authMiddleware';

dotenv.config();
var MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/lego",
    collection: 'sessions'
});

store.on('error', function(error : any) {
    console.error(error);
});

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.set("port", process.env.PORT || 10000);

async function sortActors(sortField: any, sortOrder: any, projection: any): Promise<Actor[]> {
    return await ActorsCollection.find<Actor>({}, { projection }).sort({ [sortField]: sortOrder }).toArray();
}

function sortOrder(sortParam: string): "asc" | "desc" {
    return sortParam.toLowerCase() === "asc" ? "asc" : "desc";
}

app.get("/", ensureNotAuthenticated, async (req, res) => {
    let wrongCredentials = false;

    res.render("login", {wrongCredentials});
})

app.use(authRoutes);

app.get("/signup", ensureNotAuthenticated, async(req, res) =>{
    let userAlreadyExists = false;

    res.render("signup",{userAlreadyExists});
})

app.get("/home", ensureAuthenticated, async (req, res) => {
    let detailId: any = req.query.id ?? "";
    let sortName: any = req.query.sortName ?? "";
    let sortAge: any = req.query.sortAge ?? "";
    let sortBirthdate: any = req.query.sortBirthdate ?? "";
    let sortNationality: any = req.query.sortNationality ?? "";
    let sortIsActive: any = req.query.sortIsActive ?? "";
    let sortRelationshipStatus: any = req.query.sortRelationshipStatus ?? "";
    let name: any = req.query.name ?? "";
    const selectedFieldsParam = req.query.fields;
    
    let selectedFields: string[] = [];

    if (selectedFieldsParam) {
        if (Array.isArray(selectedFieldsParam)) {
            selectedFields = selectedFieldsParam as string[];
        } else if (typeof selectedFieldsParam === 'string') {
            selectedFields = [selectedFieldsParam];
        }
    } else {
        selectedFields = [
            "profileImageUrl",
            "name",
            "age",
            "birthdate",
            "nationality",
            "isActive",
            "relationshipStatus"
        ];
    }

    const projection: any = {};
    selectedFields.forEach(field => {
        projection[field] = 1;
    });

    let sortedActors: Actor[] = [];
    let actorDetails;

    if (sortName) {
        sortedActors = await sortActors("name", sortOrder(sortName), projection);
    } else if (sortAge) {
        sortedActors = await sortActors("age", sortOrder(sortAge), projection);
    } else if (sortBirthdate) {
        sortedActors = await sortActors("birthdate", sortOrder(sortBirthdate), projection);
    } else if (sortNationality) {
        sortedActors = await sortActors("nationality", sortOrder(sortNationality), projection);
    } else if (sortIsActive) {
        sortedActors = await sortActors("isActive", sortOrder(sortIsActive), projection);
    } else if (sortRelationshipStatus) {
        sortedActors = await sortActors("relationshipStatus", sortOrder(sortRelationshipStatus), projection);
    } else if (detailId) {
        actorDetails = await ActorsCollection.findOne(
            { _id: new ObjectId(detailId) },
            { projection }
        );
    } else {
        sortedActors = await ActorsCollection.find<Actor>({}, { projection }).toArray();
    }

    let user = req.session.user;

    res.render("home", {
        actors: sortedActors,
        actorDetails,
        user,
        selectedFields,
        sortName,
        sortAge,
        sortBirthdate,
        sortNationality,
        sortIsActive,
        sortRelationshipStatus,
        name
    });
});

app.get('/actor/:id', async (req, res) => {
    try {
        const actor = await getActorById(req.params.id);
        if (actor) {
            res.render('actorDetail', { actor });
        } else {
            res.status(404).send('Actor not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/editActor/:id', async (req, res) => {
    try {
        const actor = await getActorById(req.params.id);
        if (actor) {
            res.render('editActorInfo', { actor });
        } else {
            res.status(404).send('Actor not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/saveEditActor', async (req, res) => {
    try {
        const { id, name, description, age, nationality, isActive, birthdate, relationshipStatus, hobbies, extraInfo } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid actor ID.');
        }

        const parsedAge = Number(age);
        if (isNaN(parsedAge)) {
            return res.status(400).send('Invalid age type.');
        }

        const parsedIsActive = (isActive === 'true');

        if (typeof name !== 'string' || typeof description !== 'string' || typeof nationality !== 'string' || typeof relationshipStatus !== 'string' || typeof birthdate !== 'string') {
            return res.status(400).send('Invalid input types for basic fields.');
        }

        const { pets, children, favoriteDish, awards, netWorth, hasOscar, id: extraInfoId } = extraInfo;

        if (isNaN(Number(extraInfoId))) {
            return res.status(400).send('Invalid extraInfo ID.');
        }

        if (typeof pets !== 'string' || typeof children !== 'string' || typeof awards !== 'string') {
            return res.status(400).send('Invalid extraInfo types.');
        }

        if (typeof favoriteDish !== 'string' || typeof netWorth !== 'string' || (hasOscar !== 'true' && hasOscar !== 'false')) {
            return res.status(400).send('Invalid extraInfo properties.');
        }

        const parsedHobbies = hobbies.split(',').map((hobby: string) => hobby.trim());
        const parsedPets = pets.split(',').map((pet: string) => pet.trim());
        const parsedChildren = children.split(',').map((child: string) => child.trim());
        const parsedAwards = awards.split(',').map((award: string) => award.trim());

        const parsedHasOscar = (hasOscar === 'true');

        const result = await ActorsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name,
                    description,
                    age: parsedAge,
                    nationality,
                    isActive: parsedIsActive,
                    birthdate,
                    relationshipStatus,
                    hobbies: parsedHobbies,
                    extraInfo: {
                        id: Number(extraInfoId),
                        pets: parsedPets,
                        children: parsedChildren,
                        favoriteDish,
                        awards: parsedAwards,
                        netWorth,
                        hasOscar: parsedHasOscar
                    }
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Actor not found or no changes made.');
        }

        res.redirect('/?message=Actor%20information%20updated%20successfully.&status=success');
    } catch (error) {
        console.error('Error updating actor information:', error);
        res.status(500).send('Internal server error.');
    }
});

app.delete('/deleteActor/:id', async (req, res) => {
    try {
        const actorId = req.params.id;
        if (!ObjectId.isValid(actorId)) {
            return res.status(400).json({ success: false, message: 'Invalid actor ID.' });
        }

        const result = await ActorsCollection.deleteOne({ _id: new ObjectId(actorId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Actor not found.' });
        }

        res.json({ success: true, message: 'Actor deleted successfully.' });
    } catch (error) {
        console.error('Error deleting actor:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

app.post('/seedDatabase', async (req, res) => {
    try {
        await ActorsCollection.deleteMany();
        await seed();
    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
    res.json({ success: true, message: 'Database seeded successfully.' });
});

app.get('/search', ensureAuthenticated, async (req, res) => {
    const searchName = req.query.name as string;
    let sortName: any = req.query.sortName ?? "";
    let sortAge: any = req.query.sortAge ?? "";
    let sortBirthdate: any = req.query.sortBirthdate ?? "";
    let sortNationality: any = req.query.sortNationality ?? "";
    let sortIsActive: any = req.query.sortIsActive ?? "";
    let sortRelationshipStatus: any = req.query.sortRelationshipStatus ?? "";
    const selectedFieldsParam = req.query.fields;

    let selectedFields: string[] = [];

    if (selectedFieldsParam) {
        if (Array.isArray(selectedFieldsParam)) {
            selectedFields = selectedFieldsParam as string[];
        } else if (typeof selectedFieldsParam === 'string') {
            selectedFields = [selectedFieldsParam];
        }
    } else {
        selectedFields = [
            "profileImageUrl",
            "name",
            "age",
            "birthdate",
            "nationality",
            "isActive",
            "relationshipStatus"
        ];
    }

    const projection: any = {};
    selectedFields.forEach(field => {
        projection[field] = 1;
    });

    let sortedActors: Actor[] = [];
    const searchQuery = { name: new RegExp(searchName, 'i') };

    try {
        if (sortName) {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).sort({ name: sortOrder(sortName) }).toArray();
        } else if (sortAge) {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).sort({ age: sortOrder(sortAge) }).toArray();
        } else if (sortBirthdate) {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).sort({ birthdate: sortOrder(sortBirthdate) }).toArray();
        } else if (sortNationality) {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).sort({ nationality: sortOrder(sortNationality) }).toArray();
        } else if (sortIsActive) {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).sort({ isActive: sortOrder(sortIsActive) }).toArray();
        } else if (sortRelationshipStatus) {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).sort({ relationshipStatus: sortOrder(sortRelationshipStatus) }).toArray();
        } else {
            sortedActors = await ActorsCollection.find<Actor>(searchQuery, { projection }).toArray();
        }

        let user = req.session.user;

        res.render('home', {
            actors: sortedActors,
            user,
            selectedFields,
            sortName,
            sortAge,
            sortBirthdate,
            sortNationality,
            sortIsActive,
            sortRelationshipStatus,
            name: searchName
        });
    } catch (error) {
        console.error('Error fetching actors:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(app.get("port"), async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
});