const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.user_id) {
            return failedResponse("please provide user_id")
        } else {
            console.log("-----> USER ID:  ", body.user_id)
            return getAllStationaryPoints(body.user_id)
        }
    } catch (e) {
        return failedResponse("EXCEPTION in get-all-stationary-points API --> " + e.message)
    }
}


const getAllStationaryPoints = async (userId) => {
    try {
        const QUERRY = {
            "collection": "stationarypoints",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "filter": { "user_id": userId, }
        }

        let res = await axios.post(FIND_ALL, QUERRY, { headers: getHeader() })
        if (res.data.documents.length == 0) {
            return failedResponse("No Stationary points found for this user")
        } else {
            return successResponse("You have " + res.data.documents.length + " stationary points stored on server.", res.data.documents);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}
