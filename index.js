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
// const ActorsJson = require("./json/Actors.json");
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
    const actors = yield (0, database_1.Actors)();
    let detailId = (_a = req.query.id) !== null && _a !== void 0 ? _a : "";
    let sortName = (_b = req.query.sortName) !== null && _b !== void 0 ? _b : "";
    let sortAge = (_c = req.query.sortAge) !== null && _c !== void 0 ? _c : "";
    let sortBirthdate = (_d = req.query.sortBirthdate) !== null && _d !== void 0 ? _d : "";
    let sortNationality = (_e = req.query.sortNationality) !== null && _e !== void 0 ? _e : "";
    let sortIsActive = (_f = req.query.sortIsActive) !== null && _f !== void 0 ? _f : "";
    let sortRelationshipStatus = (_g = req.query.sortRelationshipStatus) !== null && _g !== void 0 ? _g : "";
    // Sort the actors array based on the sort parameters
    //SORTEREN VIA MONGODB
    //OOK OBJECTID VAN MONGODB GEBRUIKEN
    // ZEKER LOGIN EN EDIT
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
        actorDetails = yield database_1.ActorsCollection.findOne({ _id: detailId });
    }
    res.render("index", {
        actors: sortedActors,
        actorDetails
    });
}));
app.listen(app.get("port"), () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.connect)();
    console.log("Server started on http://localhost:" + app.get('port'));
}));
