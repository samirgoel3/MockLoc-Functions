import { MongoClient } from "mongodb";

let cachedClient = null;

export async function handler(event, context) {
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGO_DB_CONNECTION);
      await cachedClient.connect();
    }

    const db = cachedClient.db("mocklocations");
    const users = await db.collection("users").find().toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}