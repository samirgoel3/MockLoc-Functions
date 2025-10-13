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

    const body = JSON.parse(event.body);
    if (!body.user_id) { return failedResponse("Required field missing user_id") }
    else {
        console.log("-----> USER ID: ",body.user_id);
        const db = await getDb();
        const stationaryCollection = db.collection('stationarypoints');
        const deleteResult = await stationaryCollection.deleteMany({ user_id: '' + body.user_id });
        return successResponse("Deleted Response", { deletedCount: deleteResult.deletedCount })
    }

}