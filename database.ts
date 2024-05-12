import {Collection, MongoClient} from "mongodb";
import { Actor } from "./types";
import dotenv from "dotenv";

// const ActorsJson = require("./json/Actors.json");
// const actorsjson : Actor[] = ActorsJson;
//alle database gerelateerde code komt hier te staan


dotenv.config();
const uri : string = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
console.log(uri);
const client = new MongoClient(uri);
export const ActorsCollection: Collection<Actor> = client.db("webdevelopment_Project").collection<Actor>("actors");


// async function seed(){
//     if (await ActorsCollection.countDocuments() === 0) {
//         await ActorsCollection.insertMany(actorsjson);
//     }
// }

export async function Actors() {

    let cursor = client.db("webdevelopment_Project").collection("actors").find<Actor>({});
    let actors : Actor[] = await cursor.toArray();
    return actors;
}

async function connect(){ //start connectie
    try {
        await client.connect();
        console.log("Connection with database started");
        // await seed();
        process.on("SIGNINT", exit);
    } catch (e) {
        console.error(e);
    }
}

async function exit(){ //dit sluit connectie met DB op exit
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (e) {
        console.error(e)
    }
    finally{
        process.exit(0);
    }
}

export{connect, exit}