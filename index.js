"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.set('views', path_1.default.join(__dirname, "views"));
app.set("port", process.env.PORT || 10000);
function sortActors(sortField, sortOrder) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.ActorsCollection.find({}).sort({ [sortField]: sortOrder }).toArray();
    });
}
function sortOrder(sortParam) {
    return sortParam.toLowerCase() === "asc" ? 1 : -1;
}
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    let detailId = (_a = req.query.id) !== null && _a !== void 0 ? _a : "";
    let sortName = (_b = req.query.sortName) !== null && _b !== void 0 ? _b : "";
    let sortAge = (_c = req.query.sortAge) !== null && _c !== void 0 ? _c : "";
    let sortBirthdate = (_d = req.query.sortBirthdate) !== null && _d !== void 0 ? _d : "";
    let sortNationality = (_e = req.query.sortNationality) !== null && _e !== void 0 ? _e : "";
    let sortIsActive = (_f = req.query.sortIsActive) !== null && _f !== void 0 ? _f : "";
    let sortRelationshipStatus = (_g = req.query.sortRelationshipStatus) !== null && _g !== void 0 ? _g : "";
    var sortedActors = yield (0, database_1.Actors)();
    var actorDetails;
    if (sortName) {
        sortedActors = yield sortActors("name", sortOrder(sortName));
    }
    else if (sortAge) {
        sortedActors = yield sortActors("age", sortOrder(sortAge));
    }
    else if (sortBirthdate) {
        sortedActors = yield sortActors("birthdate", sortOrder(sortBirthdate));
    }
    else if (sortNationality) {
        sortedActors = yield sortActors("nationality", sortOrder(sortName));
    }
    else if (sortIsActive) {
        sortedActors = yield sortActors("isActive", sortOrder(sortIsActive));
    }
    else if (sortRelationshipStatus) {
        sortedActors = yield sortActors("relationshipStatus", sortOrder(sortRelationshipStatus));
    }
    else if (detailId) {
        actorDetails = yield database_1.ActorsCollection.findOne({ _id: new mongodb_1.ObjectId(detailId) });
    }
    res.render("index", {
        actors: sortedActors,
        actorDetails
    });
}));
app.get('/actor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = yield (0, database_1.getActorById)(req.params.id);
        if (actor) {
            res.render('actorDetail', { actor });
        }
        else {
            res.status(404).send('Actor not found');
        }
    }
    catch (error) {
        res.status(500).send('Server error');
    }
}));
app.get('/editActor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = yield (0, database_1.getActorById)(req.params.id);
        if (actor) {
            res.render('editActorInfo', { actor });
        }
        else {
            res.status(404).send('Actor not found');
        }
    }
    catch (error) {
        res.status(500).send('Server error');
    }
}));
app.post('/saveEditActor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract data from the request body
        const { id, name, description, age, nationality, isActive, birthdate, relationshipStatus, hobbies, extraInfo } = req.body;
        // Validate the input
        if (!mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).send('Invalid actor ID.');
        }
        // Parse and validate age
        const parsedAge = Number(age);
        if (isNaN(parsedAge)) {
            return res.status(400).send('Invalid age type.');
        }
        // Parse and validate isActive
        const parsedIsActive = (isActive === 'true');
        // Validate basic string fields
        if (typeof name !== 'string' || typeof description !== 'string' || typeof nationality !== 'string' || typeof relationshipStatus !== 'string' || typeof birthdate !== 'string') {
            return res.status(400).send('Invalid input types for basic fields.');
        }
        // Validate extraInfo
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
        // Parse the comma-separated strings into arrays
        const parsedHobbies = hobbies.split(',').map((hobby) => hobby.trim());
        const parsedPets = pets.split(',').map((pet) => pet.trim());
        const parsedChildren = children.split(',').map((child) => child.trim());
        const parsedAwards = awards.split(',').map((award) => award.trim());
        // Parse and validate hasOscar
        const parsedHasOscar = (hasOscar === 'true');
        // Update actor information in the database
        const result = yield database_1.ActorsCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
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
        });
        if (result.modifiedCount === 0) {
            return res.status(404).send('Actor not found or no changes made.');
        }
        res.redirect('/?message=Actor%20information%20updated%20successfully.&status=success');
    }
    catch (error) {
        console.error('Error updating actor information:', error);
        res.status(500).send('Internal server error.');
    }
}));
app.delete('/deleteActor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actorId = req.params.id;
        if (!mongodb_1.ObjectId.isValid(actorId)) {
            return res.status(400).json({ success: false, message: 'Invalid actor ID.' });
        }
        const result = yield database_1.ActorsCollection.deleteOne({ _id: new mongodb_1.ObjectId(actorId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Actor not found.' });
        }
        res.json({ success: true, message: 'Actor deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting actor:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}));
app.post('/seedDatabase', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.ActorsCollection.deleteMany();
        yield (0, database_1.seed)();
    }
    catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
    res.json({ success: true, message: 'Database seeded successfully.' });
}));
app.listen(app.get("port"), () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.connect)();
    console.log("Server started on http://localhost:" + app.get('port'));
}));
