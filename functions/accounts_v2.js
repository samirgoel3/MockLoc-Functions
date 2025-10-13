const { failedResponse, successResponse } = require('../api-helper/response-handler');
import { MongoClient } from "mongodb";
const uri = process.env.MONGO_DB_CONNECTION


let client;

exports.handler = async (event, context) => {

    try {
        return failedResponse("just testing the api")
        if (!event.body) {
            return failedResponse("This is post type api, please send required params correctly")
        } else {
            const TYPE = JSON.parse(event.body).type;
            if (TYPE == "NORMAL_LOGIN") { return "normalLogin(event)" }
            if (TYPE == "NORMAL_SIGNUP") { return "normalSignUp(event)" }
            if (TYPE == "GOOGLE") { return "googleLoginSignUp(event)" }
            if (TYPE == "GOOGLE_REVAMP") { return "googleLoginSignUpRevamp(event)" }
            else { return failedResponse("Please Mention type for Api Call") }
        }
    } catch (e) {
        return failedResponse(e.message)
    }
}