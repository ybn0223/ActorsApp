import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import {connect, Actors} from "./database";
import { Actor } from "./types";


const ActorsJson = require("./json/Actors.json");

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

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
    let sortedActors = [...actors];

    if (sortName) {
        sortedActors = sortedActors.sort((a, b) => (sortName === 'asc') ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortAge) {
        sortedActors = sortedActors.sort((a, b) => (sortAge === 'asc') ? a.age - b.age : b.age - a.age);
    } else if (sortBirthdate) {
        sortedActors = sortedActors.sort((a, b) => (sortBirthdate === 'asc') ? new Date(a.birthdate).getTime() - new Date(b.birthdate).getTime() : new Date(b.birthdate).getTime() - new Date(a.birthdate).getTime());
    } else if (sortNationality) {
        sortedActors = sortedActors.sort((a, b) => (sortNationality === 'asc') ? a.nationality.localeCompare(b.nationality) : b.nationality.localeCompare(a.nationality));
    } else if (sortIsActive) {
        sortedActors = sortedActors.sort((a, b) => (sortIsActive === 'asc') ? (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1) : (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1));
    } else if (sortRelationshipStatus) {
        sortedActors = sortedActors.sort((a, b) => (sortRelationshipStatus === 'asc') ? a.relationshipStatus.localeCompare(b.relationshipStatus) : b.relationshipStatus.localeCompare(a.relationshipStatus));
    }
      else if (detailId) {
        var actorDetails = actors.find((a) => a.id === detailId)
    }

    res.render("index", {
        actors: sortedActors,
        actorDetails
    });
});



app.listen(app.get("port"), async() => {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
});