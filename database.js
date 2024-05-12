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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = exports.connect = exports.Actors = exports.ActorsCollection = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
// const ActorsJson = require("./json/Actors.json");
// const actorsjson : Actor[] = ActorsJson;
//alle database gerelateerde code komt hier te staan
dotenv_1.default.config();
const uri = (_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "mongodb://localhost:27017";
console.log(uri);
const client = new mongodb_1.MongoClient(uri);
exports.ActorsCollection = client.db("webdevelopment_Project").collection("actors");
// async function seed(){
//     if (await ActorsCollection.countDocuments() === 0) {
//         await ActorsCollection.insertMany(actorsjson);
//     }
// }
function Actors() {
    return __awaiter(this, void 0, void 0, function* () {
        let cursor = client.db("webdevelopment_Project").collection("actors").find({});
        let actors = yield cursor.toArray();
        return actors;
    });
}
exports.Actors = Actors;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Connection with database started");
            // await seed();
            process.on("SIGNINT", exit);
        }
        catch (e) {
            console.error(e);
        }
    });
}
exports.connect = connect;
function exit() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.close();
            console.log("Disconnected from database");
        }
        catch (e) {
            console.error(e);
        }
        finally {
            process.exit(0);
        }
    });
}
exports.exit = exit;
