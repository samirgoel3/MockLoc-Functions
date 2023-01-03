const axios = require('axios');
const { getHeader } = require('../api-helper');
const { DELETE_MANY } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {

    const body = event.body;
    if (!body.user_id) { return failedResponse("Required field missing user_id") }
    else {
        const data = {
            "collection": "stationarypoints",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "filter": { "user_id": "" + body.user_id }
        }

        const res = await axios.post(DELETE_MANY, data, {headers: getHeader()});
        return successResponse("Deleted Response", res.data)
    }

}