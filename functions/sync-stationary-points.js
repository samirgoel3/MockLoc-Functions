const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try{
        const body = JSON.parse(event.body)
        const incoming_points = body.stationary_points ;

        console.log("***** INCOMING POINTS: "+incoming_points);
        console.log("***** USER ID: "+body.user_id);



        const querryToGetAllExistingPoints = {"collection": "stationarypoints","database": "mocklocations","dataSource": "mocklocations","filter":{"user_id":""+body.user_id}}

        const allPointsOfUser = await axios.post(FIND_ALL, querryToGetAllExistingPoints, { headers: getHeader() });
        if(allPointsOfUser.data.documents){console.log("***** This user does have some documents")}
        else{console.log("***** This user does not have any documents")}

        /**
         * Check weather element to be update or create
         */
        var elementsToUpdate = [] , elementsToCreate = [];
        for(var i=0 ; i < incoming_points.length ; i++ ){
            if( allPointsOfUser.data.documents.some(el => el.latitude == incoming_points[i].Latitude)){
                elementsToUpdate.push(incoming_points[i])
            }else{
                elementsToCreate.push(incoming_points[i])
            }
        }

        var elementsToUpdate = [] , elementsToCreate = [];
        console.log("***** Elements to update", elementsToUpdate.length())
        console.log("***** Elements to Insert", elementsToCreate.length())

        return successResponse("Response is fetched successfully", body)

    }catch(e){
        console.log("******* Exception "+e.message);
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