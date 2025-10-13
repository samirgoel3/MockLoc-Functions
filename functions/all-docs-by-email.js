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
        if (!event.body) {
            return failedResponse("This is post type api, please send required params correctly")
        }

        const body = JSON.parse(event.body);
        const user_email = body.user_email;

        if (!user_email) {
            return failedResponse("Please send required paramaters")
        }

        const db = await getDb();
        const usersCollection = db.collection('users');
        const documents = await usersCollection.find({ $or: [ { user_email: user_email }, { google_mail: user_email } ] }).toArray();

        if (!documents || documents.length === 0) {
            return failedResponse("No documents found")
        }

        // Use found users' IDs to fetch stationary points
        const userIds = documents.map(u => '' + u._id);
        const stationaryCollection = db.collection('stationarypoints');
        const stationaryDocs = await stationaryCollection.find({ user_id: { $in: userIds } }).toArray();

        return successResponse("Data found", { users: documents, stationarypoints: stationaryDocs || [] })
    } catch (e) {
        return failedResponse("EXCEPTION in allDocsByEmail --> " + e.message)
    }
}


