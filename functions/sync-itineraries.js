const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL, INSERT_ONE, DELETE_ONE } = require('../api-helper/querryMethods');

const { failedResponse, successResponse } = require('../api-helper/response-handler');


exports.handler = async (event, context) => {
    try {
        const incomingData = JSON.parse(event.body)

        const querryToGetExistingItinerariesOfUser = { "collection": "itineraries", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_id": "" + incomingData.user_id } }

        let axiosFindAllResponse = await axios.post(FIND_ALL, querryToGetExistingItinerariesOfUser, { headers: getHeader() });

        if (axiosFindAllResponse.data.documents.length != 0) {
             // delete exisitng itineraries of this user
             const data = {"collection": "itineraries","database": "mocklocations","dataSource": "mocklocations","filter": { "user_id": "" + incomingData.user_id }}
             await axios.post(DELETE_ONE, data, {headers: getHeader()});
        }
        
        // const QUERRY_TO_INSERT = {"collection": "itineraries","database": "mocklocations","dataSource": "mocklocations","document": incomingData}
        // const res = await axios.post(INSERT_ONE, QUERRY_TO_INSERT, { headers: getHeader() });
        return successResponse("Itineraries synced successfully.", "delete test");
    } catch (e) {
        return failedResponse("Exception in sync-itineraries " + e.message);
    }



}