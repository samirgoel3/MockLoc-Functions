const axios = require('axios');
const { getHeader } = require('../api-helper');
const { failedResponse, successResponse } = require('../api-helper/response-handler');


exports.handler = async (event, context) => {
    try {
        const incomingData = JSON.parse(event.body)
        console.log("******  ", incomingData);
        console.log("******  Total Itineraries", incomingData.itinerary.length);
        console.log("******  Total Sub Itineraries", incomingData.sub_itinerary.length);
        return successResponse("Sendiong test response", "test")
    } catch (e) {
        return failedResponse("Exception in sync-itineraries "+e.message);
    }



}