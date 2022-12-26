const axios = require('axios');
const { getHeader } = require('../api-helper');
const { INSERT_ONE } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try{
        const body = JSON.parse(event.body)
        
        const data = {
            "collection": "shareplaylists",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "document":body.data
        }
        const res = await axios.post(INSERT_ONE, data, {headers: getHeader()});
        const parsedRes = res.data.insertedId;
        if(parsedRes){
            return successResponse("Playlist saved successfully",{saved_data_id:Buffer.from(""+parsedRes._id).toString('base64')});
        }
        else{
            return failedResponse("Unable to save playlist for sharing")
        }

        
    }catch(e){
        return failedResponse("Exception in save-playlist-for-sharing "+e.message)
    }
}