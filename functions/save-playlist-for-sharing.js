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
    try{
        const body = JSON.parse(event.body)
        const db = await getDb();
        const sharePlaylists = db.collection('shareplaylists');
        const insertResult = await sharePlaylists.insertOne(body.data);
        const insertedId = insertResult.insertedId;
        if(insertedId){
            return successResponse("Playlist saved successfully",{saved_data_id:insertedId});
        }
        else{
            return failedResponse("Unable to save playlist for sharing")
        }
    }catch(e){
        return failedResponse("Exception in save-playlist-for-sharing "+e.message)
    }
}