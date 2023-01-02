const axios = require('axios');
const { getHeader } = require('../api-helper');

exports.handler = async (event, context) => {

    console.log("***** This is for testing only ")

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                result: 1,
                messsage: "Result fetch successfully",
                response: "This is for synchronising stationary points"
            }
        )
    }
}