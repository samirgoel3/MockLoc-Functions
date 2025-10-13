import { MongoClient } from "mongodb";

let cachedClient = null;

export async function handler(event, context) {
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient("mongodb+srv://samir:11223344@mocklocations.zymnm.mongodb.net/");
      await cachedClient.connect();
    }

    const db = cachedClient.db("mydb");
    const users = await db.collection("users").find().toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}