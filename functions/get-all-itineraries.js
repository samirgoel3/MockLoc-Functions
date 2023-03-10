const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ONE } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.user_id) {
            return failedResponse("please provide user_id")
        } else {
            console.log("-----> USER ID:  ", body.user_id)
            return getAllItineraries(body.user_id)
        }
    } catch (e) {
        return failedResponse("EXCEPTION in get-all-itineraries API --> " + e.message)
    }
}


const getAllItineraries = async (userId) => {
    try {
        const QUERRY = {
            "collection": "itineraries",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "filter": { "user_id": userId, }
        }

        let res = await axios.post(FIND_ONE, QUERRY, { headers: getHeader() })
        if (!res.data.document) {
            return failedResponse("No Itinerary found")
        } else {
            return successResponse("itineraries found successfully.", res.data.document);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getAllItineraries " + e.message)
    }
}
