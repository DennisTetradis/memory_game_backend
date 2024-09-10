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
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const db_1 = require("./src/db");
const sockets_1 = require("./src/sockets");
(0, sockets_1.handleSockets)();
const cors = require("cors");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors());
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectToDatabase)();
    console.log("Server running!");
}));
app.get("/", (req, res) => {
    res.send("I am Groot!");
});
app.post("/save_score", (req, res) => {
    const score = Number(req.body.score);
    const difficulty = String(req.body.difficulty);
    const username = String(req.body.username);
    if (score && difficulty && username) {
        (0, db_1.save_score_db)(score, difficulty, username);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(500);
    }
});
app.get("/get_scoreboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const difficulty = String(req.query.difficulty);
    if (!difficulty) {
        return res.status(400).json({ error: "Difficulty is required" });
    }
    const scoreboard = yield (0, db_1.get_scoreboard)(difficulty);
    return res.json(scoreboard);
}));
