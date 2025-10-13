const { failedResponse } = require('../api-helper/response-handler');





exports.handler = async (event, context) => {

     return failedResponse("just testing the api")
}