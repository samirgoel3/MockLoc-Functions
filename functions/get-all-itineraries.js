const { failedResponse, successResponse } = require('../api-helper/response-handler');
const { MongoClient } = require('mongodb');

let cachedClient = null;
const getDb = async () => {
    if (!cachedClient) {
        cachedClient = new MongoClient(process.env.MONGO_DB_CONNECTION);
        await cachedClient.connect();
    }
    return cachedClient.db('mocklocations');
}

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.user_id) {
            return failedResponse("please provide user_id")
        } else {
            console.log("-----> USER ID:  ", body.user_id)
            return getAllItineraries(body.user_id)
        }
    } catch (e) {
        return failedResponse("EXCEPTION in get-all-itineraries API --> " + e.message)
    }
}


const getAllItineraries = async (userId) => {
    try {
        const db = await getDb();
        const itinerariesCollection = db.collection('itineraries');
        const doc = await itinerariesCollection.findOne({ user_id: userId });
        if (!doc) {
            return failedResponse("No Itinerary found")
        } else {
            return successResponse("itineraries found successfully.", doc);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getAllItineraries " + e.message)
    }
}
