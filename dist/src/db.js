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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.getUser_db = getUser_db;
exports.get_scoreboard = get_scoreboard;
exports.save_score_db = save_score_db;
exports.closeDatabase = closeDatabase;
require("dotenv").config();
const mongodb_1 = require("mongodb");
let client = null;
let database = null;
const uri = process.env.URI;
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client) {
            client = new mongodb_1.MongoClient(uri);
            yield client.connect();
            database = client.db("MemoryGame");
            console.log("Database connected");
        }
    });
}
function getUser_db(username) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!database) {
            throw new Error("Database not initialized. Call connectToDatabase first.");
        }
        const Users = database.collection("Users");
        const query = { username };
        const user = yield Users.findOne(query);
        return user;
    });
}
function get_scoreboard(difficulty) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!database) {
            throw new Error("Database not connected!");
        }
        const Scores = database.collection("ScoreBoard");
        try {
            return yield Scores.find({
                difficulty: String(difficulty),
            }).toArray();
        }
        catch (error) {
            return error;
        }
    });
}
function save_score_db(score, difficulty, username) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!database) {
            throw new Error("Database not connected!");
        }
        const Users = database.collection("ScoreBoard");
        const updateQuery = {
            $max: {
                score,
            },
        };
        yield Users.updateOne({ username, difficulty }, updateQuery, {
            upsert: true,
        });
    });
}
function closeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (client) {
            yield client.close();
            client = null;
            database = null;
        }
    });
}
