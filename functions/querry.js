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
            if (TYPE == "SEND_QUERRY") { return addQuerry(event) }
            if (TYPE == "GET_ALL_QUERRIES") { return getAllQueries(event) }
            else { return failedResponse("Please Mention type for Api Call") }
        }
    } catch (e) {
        return failedResponse("Exception in querry API "+e.message)
    }
}

const addQuerry = async (event)=>{
    const user_id = JSON.parse(event.body).user_id;
    const user_email = JSON.parse(event.body).user_email;
    const user_phone = JSON.parse(event.body).user_phone;
    const user_query = JSON.parse(event.body).user_query;
    if(!user_id || !user_email || !user_phone || !user_query){
        return failedResponse("Please add required paramas user_id  email phone querry" )
    }else{
        const documentToCreate = {"user_id":user_id, "user_email":user_email, "user_phone":user_phone, "user_query":user_query, "status":"PENDING" }
        const db = await getDb();
        const queries = db.collection('queries');
        const insertResult = await queries.insertOne(documentToCreate);
        if (!insertResult.insertedId) { return failedResponse("Failed to Insert Querry in DB") }
        documentToCreate._id = insertResult.insertedId;
        return successResponse("New Query details", documentToCreate)
    }
}


const getAllQueries = async(event)=>{
    const user_id = JSON.parse(event.body).user_id;
    if(!user_id){
        return failedResponse("Please add required paramas "+user_id )
    }else{
        const db = await getDb();
        const queries = db.collection('queries');
        const docs = await queries.find({ user_id: user_id }).toArray();
        if (docs.length == 0) {
            return failedResponse("No Querries found")
        } else {
            return successResponse("You have " + docs.length + "  stored on server.", docs);
        }

    }
}