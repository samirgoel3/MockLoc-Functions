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
            return getAllPlaylist(body.user_id)
        }
    } catch (e) {
        return failedResponse("EXCEPTION in get-all-playlists API --> " + e.message)
    }
}


const getAllPlaylist = async (userId) => {
    try {
        const db = await getDb();
        const playlistCollection = db.collection('stationaryplaylist');
        const docs = await playlistCollection.find({ user_id: userId }).toArray();
        if (!docs || docs.length === 0) {
            return failedResponse("No Playlist found")
        } else {
            return successResponse("You have " + docs.length + " playlist stored on server.", docs);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}
