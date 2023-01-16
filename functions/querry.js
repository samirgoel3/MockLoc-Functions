const axios = require('axios');
const { failedResponse, successResponse } = require('../api-helper/response-handler');
const { getHeader } = require('../api-helper');
const { FIND_ALL, INSERT_ONE } = require('../api-helper/querryMethods');


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
        const QUERRY = {
            "collection": "queries",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "document": documentToCreate
        }
        const res = await axios.post(INSERT_ONE, QUERRY, { headers: getHeader() });
        if (!res.data.insertedId) { return failedResponse("Failed to Insert Querry in DB") }
        documentToCreate._id = res.data.insertedId;
        return successResponse("New User details", documentToCreate)
    }
}


const getAllQueries = async(event)=>{
    const user_id = JSON.parse(event.body).user_id;
    if(!user_id){
        return failedResponse("Please add required paramas "+user_id )
    }else{

        const QUERRY = {"collection": "queries","database": "mocklocations","dataSource": "mocklocations","filter": { "user_id": user_id, }};
        let res = await axios.post(FIND_ALL, QUERRY, { headers: getHeader() })
        if (res.data.documents.length == 0) {
            return failedResponse("No Querries found")
        } else {
            return successResponse("You have " + res.data.documents.length + "  stored on server.", res.data.documents);
        }

    }
}