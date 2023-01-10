const axios = require('axios');
const { getHeader } = require('../api-helper');

exports.handler = async (event, context) => {

    const incomingData = JSON.parse(event.body)

    console.log("******  ", incomingData);


    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                result: 1,
                messsage: "Result fetch successfully",
                response: "Data is coming"
            }
        )
    }
}