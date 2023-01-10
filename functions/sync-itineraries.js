const axios = require('axios');
const { getHeader } = require('../api-helper');
const { failedResponse, successResponse } = require('../api-helper/response-handler');


exports.handler = async (event, context) => {
    try {
        const incomingData = JSON.parse(event.body)

        const querryToGetExistingItinerariesOfUser = { "collection": "itineraries", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_id": "" + incomingData.user_id } }

        let axiosFindAllResponse = await axios.post(FIND_ALL, querryToGetExistingItinerariesOfUser, { headers: getHeader() });
        console.log("******** ", axiosFindAllResponse.data);
        return successResponse("********  ",axiosFindAllResponse.data);

        // const QUERRY = { "collection": "itineraries", "database": "mocklocations", "dataSource": "mocklocations", "document": incomingData }

    
        return successResponse("Sendiong test response", "test")
    } catch (e) {
        return failedResponse("Exception in sync-itineraries "+e.message);
    }



}