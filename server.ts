import express, { Request, Response } from "express";
import { connectToDatabase, save_score_db, get_scoreboard } from "./src/db";
import { handleSockets } from "./src/sockets";
import { readFileSync } from "node:fs";
import { readFile } from "fs";

require("dotenv").config();
const port = readFileSync(String(process.env.SERVER_PORT)) || 3000;
const uri = readFileSync(String(process.env.URI));
const ws_port = readFileSync(String(process.env.WS_PORT));
// process.env.SERVER_PORT || 3000;
// const uri: any = process.env.URI;
// const ws_port: any = process.env.WS_PORT;

handleSockets(Number(ws_port));
const cors = require("cors")();
const app = express();

app.use(express.json());
app.use(cors());
app.listen(port, async () => {
  await connectToDatabase(uri);
  console.log("Server running!");
});

app.get("/", (req: Request, res: Response) => {
  res.send("I am Groot!");
});

app.post("/save_score", (req: Request, res: Response) => {
  const score = Number(req.body.score);
  const difficulty = String(req.body.difficulty);
  const username = String(req.body.username);
  if (score && difficulty && username) {
    save_score_db(score, difficulty, username);
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

app.get("/get_scoreboard", async (req: Request, res: Response) => {
  const difficulty = String(req.query.difficulty);
  if (!difficulty) {
    return res.status(400).json({ error: "Difficulty is required" });
  }
  const scoreboard = await get_scoreboard(difficulty);
  return res.json(scoreboard);
});
