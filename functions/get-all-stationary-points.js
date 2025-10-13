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
            return getAllStationaryPoints(body.user_id)
        }
    } catch (e) {
        return failedResponse("EXCEPTION in get-all-stationary-points API --> " + e.message)
    }
}


const getAllStationaryPoints = async (userId) => {
    try {
        const db = await getDb();
        const stationaryCollection = db.collection('stationarypoints');
        const docs = await stationaryCollection.find({ user_id: userId }).toArray();
        if (!docs || docs.length === 0) {
            return failedResponse("No Stationary points found for this user")
        } else {
            return successResponse("You have " + docs.length + " stationary points stored on server.", docs);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}
