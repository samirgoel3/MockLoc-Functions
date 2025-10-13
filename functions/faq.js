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
        } else {
            const TYPE = JSON.parse(event.body).type;
            if (TYPE == "ADD_FAQ") { return addFAQ(event) }
            if (TYPE == "GET_ALL_FAQ") { return getAllFAQ(event) }
            else { return failedResponse("Please Mention type for Api Call") }
        }
    } catch (e) {
        return failedResponse("Exception in querry API "+e.message)
    }
}

const addFAQ = async (event)=>{
    const question = JSON.parse(event.body).question;
    const answer = JSON.parse(event.body).answer;
    
    if( !question || !answer){
        return failedResponse("Please add required paramas question answer" )
    }else{
        const db = await getDb();
        const faqCollection = db.collection('faq');
        const documentToCreate = {"question":question, "answer":answer }
        const insertResult = await faqCollection.insertOne(documentToCreate);
        if (!insertResult.insertedId) { return failedResponse("Failed to Insert Querry in DB") }
        documentToCreate._id = insertResult.insertedId;
        return successResponse("New FAQ details", documentToCreate)
    }
}


const getAllFAQ = async(event)=>{
    const db = await getDb();
    const faqCollection = db.collection('faq');
    const docs = await faqCollection.find({}).toArray();
    if (!docs || docs.length === 0) {
        return failedResponse("No FAQ found")
    } else {
        return successResponse("You have " + docs.length + " FAQ stored on server.", docs);
    }

}