const { failedResponse, successResponse } = require('../api-helper/response-handler');
const { MongoClient, ObjectId } = require('mongodb');

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
        const user_id = body.user_id;

        if (!user_id) {
            return failedResponse("Please send required paramaters")
        }

        let userObjectId;
        try {
            userObjectId = new ObjectId(user_id);
        } catch (e) {
            return failedResponse("Invalid user_id")
        }

        const db = await getDb();
        const usersCollection = db.collection('users');
        const userDoc = await usersCollection.findOne({ _id: userObjectId });

        if (!userDoc) {
            return failedResponse("No user found")
        }

        const userIdString = '' + userDoc._id;
        const stationaryCollection = db.collection('stationarypoints');
        const playlistCollection = db.collection('stationaryplaylist');
        const itinerariesCollection = db.collection('itineraries');

        const [stationaryDocs, playlistDocs, itineraryDocs] = await Promise.all([
            stationaryCollection.find({ user_id: userIdString }).toArray(),
            playlistCollection.find({ user_id: userIdString }).toArray(),
            itinerariesCollection.find({ user_id: userIdString }).toArray()
        ]);

        return successResponse("Data found", {
            user: userDoc,
            stationarypoints: stationaryDocs || [],
            playlists: playlistDocs || [],
            itineraries: itineraryDocs || []
        })
    } catch (e) {
        return failedResponse("EXCEPTION in get-all-synced-data-by-userid --> " + e.message)
    }
}


