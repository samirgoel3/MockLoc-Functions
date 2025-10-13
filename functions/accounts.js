const axios = require('axios');
const { failedResponse, successResponse } = require('../api-helper/response-handler');
const { getHeader } = require('../api-helper');
const { FIND_ONE, INSERT_ONE } = require('../api-helper/querryMethods');
import { MongoClient } from "mongodb";
const uri = process.env.MONGO_DB_CONNECTION;

let client;

exports.handler = async (event, context) => {

    try {
        if (!event.body) {
            return failedResponse("This is post type api, please send required params correctly")
        } else {
            const TYPE = JSON.parse(event.body).type;
            if (TYPE == "NORMAL_LOGIN") { return normalLogin(event) }
            if (TYPE == "NORMAL_SIGNUP") { return normalSignUp(event) }
            if (TYPE == "GOOGLE") { return googleLoginSignUp(event) }
            if (TYPE == "GOOGLE_REVAMP") { return googleLoginSignUpRevamp(event) }
            else { return failedResponse("Please Mention type for Api Call") }
        }
    } catch (e) {
        return failedResponse(e.message)
    }
}

const normalLogin = async (event) => {
    try {
        const body = JSON.parse(event.body)

        if (!body.user_email || !body.password) { return failedResponse("Please enter email and password") }

        if (!client) {
            client = new MongoClient(uri);
            await client.connect();
        }
        const db = client.db("mocklocations");
        const collection = db.collection("users");
        const query = { user_email: body.user_email,password: body.password};
        const res = await collection.findOne(query);
        if (!res.data.document) { return failedResponse("User Not Found") }
        else {
            // NOTE : update player ID
            return successResponse("User find successfully", res.data.document)
        }
    } catch (e) {
        return failedResponse("EXCEPTION in normalLogin Method --> " + e.message)
    }
}

const normalSignUp = async (event) => {
    try {
        const body = JSON.parse(event.body)

        const user_name = body.user_name
        const user_email = body.user_email
        const user_phone = body.user_phone
        const developer = body.is_developer || true
        const password = body.password
        const player_id = body.player_id || "NA"

        if (!user_name || !user_email || !password) { return failedResponse("Please send required paramaters") }

        // check weather email already exsist
        const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_email": body.user_email, } }
        const res = await axios.post(FIND_ONE, QUERRY, { headers: getHeader() });

        if (res.data.document == null) {
            const documentToCreate = {
                "login_type": "NORMAL",
                "user_name": user_name,
                "user_email": user_email,
                "user_phone": user_phone,
                "developer": developer,
                "password": password,
                "google_name": "",
                "google_mail": "",
                "google_social_id": "",
                "google_photo": "",
                "facebook_name": "",
                "facebook_mail": "",
                "facebook_social_id": "",
                "facebook_photo": "",
                "player_id": player_id
            }
            const QUERRY = {
                "collection": "users",
                "database": "mocklocations",
                "dataSource": "mocklocations",
                "document": documentToCreate
            }
            const res = await axios.post(INSERT_ONE, QUERRY, { headers: getHeader() });
            if (!res.data.insertedId) { return failedResponse("Failed to Insert user in DB") }
            documentToCreate._id = res.data.insertedId;
            return successResponse("New User details", documentToCreate)
        }
        else { return failedResponse("Seems like user email is already exist") }





    } catch (e) {
        return failedResponse("EXCEPTION in normalSignUp --> " + e.message)
    }
}


const googleLoginSignUp = async (event) => {
    try {
        const body = JSON.parse(event.body)

        const google_social_id = body.social_id
        const player_id = body.player_id || "NA"

        if (!google_social_id) { return failedResponse("Please send required paramaters") }

        // check user already exist
        const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "google_social_id": google_social_id, } }
        const res = await axios.post(FIND_ONE, QUERRY, { headers: getHeader() });

        // user does not exist
        if (res.data.document == null) {
            const documentToCreate = {
                login_type: "GOOGLE",
                user_name: "",
                user_email: "",
                user_phone: "" + body.user_phone,
                developer: body.developer === 1 ? true : false,
                password: "",
                google_name: "" + body.google_name,
                google_mail: "" + body.google_mail,
                google_social_id: "" + google_social_id,
                google_photo: "" + body.google_photo,
                facebook_name: "",
                facebook_mail: "",
                facebook_social_id: "",
                facebook_photo: "",
                player_id: player_id
            }
            const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "document": documentToCreate }
            const res = await axios.post(INSERT_ONE, QUERRY, { headers: getHeader() });
            if (!res.data.insertedId) { return failedResponse("Failed to Insert user in DB") }
            documentToCreate.token = "will remove later";
            documentToCreate._id = res.data.insertedId;

            return successResponse("New User details", documentToCreate)
        }
        // user already exist
        else {
            const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "google_social_id": google_social_id } }
            const res = await axios.post(FIND_ONE, QUERRY, { headers: getHeader() });
            const dataToSend = res.data.document;
            dataToSend.token = "will remove later";
            return successResponse("User already exist.", dataToSend)
        }

    } catch (e) {
        return failedResponse("EXCEPTION in googleLoginSignUp --> " + e.message)
    }
}

const googleLoginSignUpRevamp = async (event) => {
    try {
        const body = JSON.parse(event.body)

        const google_social_id = body.social_id
        const google_mail = body.google_mail
        const player_id = body.player_id || "NA"

        if (!google_social_id) { return failedResponse("Please send required paramaters") }

        // check user already exist
        const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "google_mail": google_mail, } }
        const res = await axios.post(FIND_ONE, QUERRY, { headers: getHeader() });

        // user does not exist
        if (res.data.document == null) {
            const documentToCreate = {
                login_type: "GOOGLE",
                user_name: "",
                user_email: "",
                user_phone: "" + body.user_phone,
                developer: body.developer === 1 ? true : false,
                password: "",
                google_name: "" + body.google_name,
                google_mail: "" + body.google_mail,
                google_social_id: "" + google_social_id,
                google_photo: "" + body.google_photo,
                facebook_name: "",
                facebook_mail: "",
                facebook_social_id: "",
                facebook_photo: "",
                player_id: player_id
            }
            const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "document": documentToCreate }
            const res = await axios.post(INSERT_ONE, QUERRY, { headers: getHeader() });
            if (!res.data.insertedId) { return failedResponse("Failed to Insert user in DB") }
            documentToCreate.token = "will remove later";
            documentToCreate._id = res.data.insertedId;

            return successResponse("New User details", documentToCreate)
        }
        // user already exist
        else {
            const QUERRY = { "collection": "users", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "google_mail": google_mail } }
            const res = await axios.post(FIND_ONE, QUERRY, { headers: getHeader() });
            const dataToSend = res.data.document;
            dataToSend.token = "will remove later";
            return successResponse("User already exist.", dataToSend)
        }

    } catch (e) {
        return failedResponse("EXCEPTION in googleLoginSignUp --> " + e.message)
    }
}
