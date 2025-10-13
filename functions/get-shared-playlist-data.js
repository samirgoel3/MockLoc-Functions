// this api is used to deliver data that is saved while sharing playlist
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
        const body = JSON.parse(event.body)

        if (!body.itenary_id) { return failedResponse("Requirted Parameter missing") }


        const db = await getDb();
        const sharePlaylists = db.collection('shareplaylists');
        const doc = await sharePlaylists.findOne({ _id: new ObjectId(body.itenary_id) });
        if (doc) {
            return successResponse("Playlist find successfully", doc);
        } else {
            return failedResponse("Unable to find Shared Playlist document.")
        }
    } catch (e) {
        return failedResponse("Exception in get-shared-playlist-data " + e.message)
    }
}