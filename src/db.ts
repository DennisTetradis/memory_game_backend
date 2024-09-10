import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(uri: any): Promise<void> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    database = client.db("MemoryGame");
    console.log("Database connected");
  }
}

export async function getUser_db(username: string): Promise<any | null> {
  if (!database) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  const Users: Collection = database.collection("Users");
  const query = { username };
  const user = await Users.findOne(query);
  return user;
}

export async function get_scoreboard(difficulty: string): Promise<any> {
  if (!database) {
    throw new Error("Database not connected!");
  }
  const Scores: Collection = database.collection("ScoreBoard");

  try {
    return await Scores.find({
      difficulty: String(difficulty),
    }).toArray();
  } catch (error) {
    return error;
  }
}

export async function save_score_db(
  score: number,
  difficulty: string,
  username: string
): Promise<any | null> {
  if (!database) {
    throw new Error("Database not connected!");
  }
  const Users: Collection = database.collection("ScoreBoard");

  const updateQuery = {
    $max: {
      score,
    },
  };

  await Users.updateOne({ username, difficulty }, updateQuery, {
    upsert: true,
  });
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}
