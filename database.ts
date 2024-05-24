import {Collection, MongoClient, ObjectId} from "mongodb";
import { Actor, IUser } from "./types";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { promises } from "dns";

const ActorsJson = require("./json/Actors.json");
const actorsjson : Actor[] = ActorsJson;
// alle database gerelateerde code komt hier te staan


dotenv.config();
const uri : string = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
console.log(uri);
const client = new MongoClient(uri);
export const ActorsCollection: Collection<Actor> = client.db("webdevelopment_Project").collection<Actor>("actors");
export const usersCollection: Collection<IUser> = client.db("webdevelopment_Project").collection<IUser>("users");



export async function seed(){
    if (await ActorsCollection.countDocuments() === 0) {
        await ActorsCollection.insertMany(actorsjson);
        console.log("seeding DB");
    }
}

export async function Actors() {

    let cursor = client.db("webdevelopment_Project").collection("actors").find<Actor>({});
    let actors : Actor[] = await cursor.toArray(); 
    return actors;
}

export async function getActorById(id: string) {
    return ActorsCollection.findOne({_id: new ObjectId(id)});
}

export async function registerUser(username: string, password: string, isAdmin: boolean) : Promise<string>{
    try {
        const userExists = await usersCollection.findOne({username});
        if (userExists) {
            return 'Username already taken';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser : IUser = {
            username,
            password: hashedPassword,
            isAdmin
        }

        await usersCollection.insertOne(newUser);
        return 'User registered successfully';
    } catch (error) {
        console.log('Error registering user:', error);
        return 'Server error';
    }
}

async function CreateDefaultUsers() {
    const admin : string = "admin";
    const adminExists = await usersCollection.findOne({username : admin});
    const defaultUser : string = "user";
    const defaultUserExists = await usersCollection.findOne({username : defaultUser});
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin132", 10);

        const admin : IUser = {
            username : "admin",
            password : hashedPassword,
            isAdmin : true
        }
        await usersCollection.insertOne(admin)
        console.log("added admin");
    }
    if (!defaultUserExists) {
        const hashedPassword = await bcrypt.hash("user", 10);

        const user : IUser = {
            username : "user",
            password : hashedPassword,
            isAdmin : false
        }
        await usersCollection.insertOne(user)
        console.log("added default user");
    }
}

async function connect(){ //start connectie
    try {
        await client.connect();
        console.log("Connection with database started");
        await CreateDefaultUsers();
        await seed();
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