import {Express} from "express";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import {connect, Actors, ActorsCollection} from "./database";
import { Actor } from "./types";
import {Collection, MongoClient} from "mongodb";


// const ActorsJson = require("./json/Actors.json");

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

async function sortActors(sortField: any, sortOrder: any): Promise<Actor[]> {
    return await ActorsCollection.find<Actor>({}).sort({ [sortField]: sortOrder }).toArray();
}
function sortOrder(sortParam: string): number {
    return sortParam.toLowerCase() === "asc" ? 1 : -1;
}

app.get("/", async (req, res) => {
    const actors : Actor[] = await Actors();

    let detailId: any = req.query.id ?? "";
    let sortName: any = req.query.sortName ?? "";
    let sortAge: any = req.query.sortAge ?? "";
    let sortBirthdate: any = req.query.sortBirthdate ?? "";
    let sortNationality: any = req.query.sortNationality ?? "";
    let sortIsActive: any = req.query.sortIsActive ?? "";
    let sortRelationshipStatus: any = req.query.sortRelationshipStatus ?? "";

    // Sort the actors array based on the sort parameters
    //SORTEREN VIA MONGODB
    //OOK OBJECTID VAN MONGODB GEBRUIKEN
    // ZEKER LOGIN EN EDIT
    var sortedActors : Actor[] = await Actors();
    var actorDetails;
    
    if (sortName) {
        sortedActors = await sortActors("name", sortOrder(sortName));
    } else if (sortAge) {
        sortedActors = await sortActors("age", sortOrder(sortAge));
    } else if (sortBirthdate) {
        sortedActors = await sortActors("birthdate", sortOrder(sortBirthdate));
    } else if (sortNationality) {
        sortedActors = await sortActors("nationality", sortOrder(sortName));
    } else if (sortIsActive) {
        sortedActors = await sortActors("isActive", sortOrder(sortIsActive));
    } else if (sortRelationshipStatus) {
        sortedActors = await sortActors("relationshipStatus", sortOrder(sortRelationshipStatus));
    }
    else if (detailId) {
        actorDetails = await ActorsCollection.findOne({ _id: detailId });
    }    

    res.render("index", {
        actors : sortedActors,
        actorDetails
    });
});



app.listen(app.get("port"), async() => {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
});