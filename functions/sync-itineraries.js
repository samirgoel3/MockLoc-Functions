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
        const incomingData = JSON.parse(event.body)

		const db = await getDb();
		const itineraries = db.collection('itineraries');
		const userIdStr = '' + incomingData.user_id;

		// delete existing itineraries for this user (if any)
		await itineraries.deleteMany({ user_id: userIdStr });

		// insert new itinerary document
		const insertResult = await itineraries.insertOne(incomingData);
		return successResponse("Itineraries synced successfully.", { insertedId: insertResult.insertedId });
    } catch (e) {
        return failedResponse("Exception in sync-itineraries " + e.message);
    }



}