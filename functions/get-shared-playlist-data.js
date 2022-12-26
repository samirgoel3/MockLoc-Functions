// this api is used to deliver data that is saved while sharing playlist
const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ONE } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)

        if (!body.itenary_id) { return failedResponse("Requirted Parameter missing") }


        const data = {
            "collection": "shareplaylists",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "filter": { "_id": { "$oid": body.itenary_id } }
        }
        const res = await axios.post(FIND_ONE, data, { headers: getHeader() });

        if (res.data.document) {
            return successResponse("Playlist find successfully", res.data.document);
        }
        else {
            return failedResponse("Unable to find Shared Playlist document.")
        }
    } catch (e) {
        return failedResponse("Exception in get-shared-playlist-data " + e.message)
    }
}