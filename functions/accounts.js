const { failedResponse, successResponse } = require('../api-helper/response-handler');
const { MongoClient } = require('mongodb');

let cachedClient = null;
const getDb = async () => {
	if (!cachedClient) {
		cachedClient = new MongoClient(process.env.MONGO_DB_CONNECTION);
		await cachedClient.connect();
	}
	return cachedClient.db('mocklocations');
}


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
        const db = await getDb();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ user_email: body.user_email, password: body.password });
        if (!user) { return failedResponse("User Not Found") }
        else {
            // NOTE : update player ID
            return successResponse("User find successfully", user)
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
        const db = await getDb();
        const usersCollection = db.collection('users');
        const existing = await usersCollection.findOne({ user_email: body.user_email });

        if (existing == null) {
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
            const insertResult = await usersCollection.insertOne(documentToCreate);
            if (!insertResult.insertedId) { return failedResponse("Failed to Insert user in DB") }
            documentToCreate._id = insertResult.insertedId;
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
        const db = await getDb();
        const usersCollection = db.collection('users');
        const existing = await usersCollection.findOne({ google_social_id: google_social_id });

        // user does not exist
        if (existing == null) {
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
            const insertResult = await usersCollection.insertOne(documentToCreate);
            if (!insertResult.insertedId) { return failedResponse("Failed to Insert user in DB") }
            documentToCreate.token = "will remove later";
            documentToCreate._id = insertResult.insertedId;

            return successResponse("New User details", documentToCreate)
        }
        // user already exist
        else {
            const dataToSend = existing ; 
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
        const db = await getDb();
        const usersCollection = db.collection('users');
        const existing = await usersCollection.findOne({ google_mail: google_mail });

        // user does not exist
        if (existing == null) {
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
            const insertResult = await usersCollection.insertOne(documentToCreate);
            if (!insertResult.insertedId) { return failedResponse("Failed to Insert user in DB") }
            documentToCreate.token = "will remove later";
            documentToCreate._id = insertResult.insertedId;

            return successResponse("New User details", documentToCreate)
        }
        // user already exist
        else {
            const dataToSend = existing ; 
            dataToSend.token = "will remove later";
            return successResponse("User already exist.", dataToSend)
        }

    } catch (e) {
        return failedResponse("EXCEPTION in googleLoginSignUp --> " + e.message)
    }
}
