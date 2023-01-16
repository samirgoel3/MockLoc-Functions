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
        const documentToCreate = {"question":question, "answer":answer }
        const QUERRY = {
            "collection": "faq",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "document": documentToCreate
        }
        const res = await axios.post(INSERT_ONE, QUERRY, { headers: getHeader() });
        if (!res.data.insertedId) { return failedResponse("Failed to Insert Querry in DB") }
        documentToCreate._id = res.data.insertedId;
        return successResponse("New FAQ details", documentToCreate)
    }
}


const getAllFAQ = async(event)=>{
    const QUERRY = {"collection": "faq","database": "mocklocations","dataSource": "mocklocations","filter": { }};
        let res = await axios.post(FIND_ALL, QUERRY, { headers: getHeader() })
        if (res.data.documents.length == 0) {
            return failedResponse("No FAQ found")
        } else {
            return successResponse("You have " + res.data.documents.length + " FAQ stored on server.", res.data.documents);
        }

}