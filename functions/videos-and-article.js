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
        if (!body.type) {
            return failedResponse("Please mention Type Article or Videos")
        } else {
            if (body.type == "ARTICLE") { return getArticles(event) }
            if (body.type == "VIDEOS") { return getVideoTutorials(event) }
            else { return failedResponse("Api doesn't support the type") }

        }
    } catch (e) {
        return failedResponse("EXCEPTION in Videos and Articles API --> " + e.message)
    }
}


const getVideoTutorials = async (event) => {
    try {
        const db = await getDb();
        const videos = db.collection('videos');
        const docs = await videos.find({}).toArray();
        if (!docs || docs.length === 0) {
            return failedResponse("No videos and tutorials found")
        } else {
            return successResponse("Videos found successfully", docs);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}


const getArticles = async (event) => {
    try {
        const db = await getDb();
        const articles = db.collection('articles');
        const docs = await articles.find({}).toArray();
        if (!docs || docs.length === 0) {
            return failedResponse("No articles found")
        } else {
            return successResponse("Article found successfully", docs);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getArticles " + e.message)
    }
}
