const axios = require('axios');
const { getHeader } = require('../api-helper');

exports.handler = async (event, context) => {

    console.log(event.body)

    
    const data = {
        "collection": "users",
        "database": "mocklocations",
        "dataSource": "mocklocations"
    }

    const res = await axios.post("https://data.mongodb-api.com/app/data-fiicp/endpoint/data/v1/action/find", data, {
        headers: getHeader()
    });

    // const res = await axios.get("https://jsonplaceholder.typicode.com/users/1");


    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                result: 1,
                messsage: "Result fetch successfully",
                response: res.data
            }
        )
    }
}