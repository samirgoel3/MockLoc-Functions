const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try{
        const body = JSON.parse(event.body)
        console.log("***** "+body.stationary_points);
        console.log("***** "+body.user_id);


        const data = {
            "collection": "stationarypoints",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "filter":{
                "user_id":""+body.user_id
            }
        }

        const allPointsOfUser = await axios.post(FIND_ALL, data, { headers: getHeader() });
        console.log("******* "+JSON.parse(allPointsOfUser));



        return successResponse("Response is fetched successfully", body)

    }catch(e){
        return failedResponse("Exception in sync-stationary-points " + e.message)
    }

    // console.log("***** This is for testing only ")

    // return {
    //     statusCode: 200,
    //     body: JSON.stringify(
    //         {
    //             result: 1,
    //             messsage: "Result fetch successfully",
    //             response: "This is for synchronising stationary points"
    //         }
    //     )
    // }
}