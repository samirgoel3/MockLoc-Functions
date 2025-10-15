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
        const body = JSON.parse(event.body)
        console.log("-----> BODY: ", body)
        if (!body.playlists || !body.user_id) { return failedResponse("Required Field missign | playlists |user_id") }
        const incoming_playlists = body.playlists;

        if(incoming_playlists.length == 0 ){ return failedResponse("No playlist received")}

        console.log("-----> Total Incoming playlist by user ID: " + body.user_id + ": " + incoming_playlists.length);




		const db = await getDb();
		const playlistCollection = db.collection('stationaryplaylist');
		let allExistingPlaylistsOfUser = await playlistCollection.find({ user_id: '' + body.user_id }).toArray();
        if (allExistingPlaylistsOfUser.length != 0) { console.log("-----> This user does already have some saved playlist", "length=" + allExistingPlaylistsOfUser.length) }
        else { console.log("-----> This user does not have any saved playlist") }

        /**
         * Check weather element to be update or create
         */
        var elementsToUpdate = [], elementsToCreate = [];
        for (var i = 0; i < incoming_playlists.length; i++) {
            if (allExistingPlaylistsOfUser.some(el => el.playlist_id == incoming_playlists[i].id)) {
                elementsToUpdate.push(incoming_playlists[i])
            } else {
                elementsToCreate.push(incoming_playlists[i])
            }
        }
        console.log("-----> Elements to update", elementsToUpdate.length)
        console.log("-----> Elements to Insert", elementsToCreate.length)


		if (elementsToUpdate.length > 0) {
            let playlistsToUpdate = getPlaylistsArrayToUpdateInDb(elementsToUpdate, body.user_id);
            let playlistsToCreate = getPlaylistsArrayToAddInDb(elementsToCreate, body.user_id);

			// deleting existing docs
			const deleteResult = await playlistCollection.deleteMany({ user_id: '' + body.user_id });
			console.log("-----> Existing Document Deleted: deletedCount=", deleteResult.deletedCount)

            // Collecting all existing and new point in single array 
            const overallPlaylistsToAddInDb = getOverallPoints(playlistsToCreate, playlistsToUpdate, allExistingPlaylistsOfUser);
            console.log("-----> Overall Playlists need to add or update in DB: ", overallPlaylistsToAddInDb.length);

			// Inserting overall elements in DB 
			const overallInsertionResult = await playlistCollection.insertMany(overallPlaylistsToAddInDb);
			console.log("-----> Overall documents inserted: insertedCount=", overallInsertionResult.insertedCount)
            return getAllPlaylist(body.user_id)
            // return successResponse("Overall documents inserted response", overallInsertionResult.data);

        }
        else {
            if (elementsToCreate.length > 0) {
                let stationaryPlaylistToCreate = getPlaylistsArrayToAddInDb(elementsToCreate, body.user_id);
                console.log("Overall Playlist need to add in DB: ", stationaryPlaylistToCreate.length);

				// Inserting overall elements in DB 
				const insertManyResult = await playlistCollection.insertMany(stationaryPlaylistToCreate)
                return getAllPlaylist(body.user_id)
                // return successResponse("Stationary Points added successfully ", axiosResponse.data)

            }
        }
    } catch (e) {
        console.log("******* Exception " + e.message);
        return failedResponse("Exception in sync-stationary-points " + e.message)
    }

}


/**
 * 
 * @param {array of incoming object from mobile} elementsToCreate 
 * @param { array of existing point from DB} allExistingPointsOfUser 
 * @param {string} userId 
 * @returns this return a modulated custom object that matches object saved in DB
 */
const getPlaylistsArrayToAddInDb = (elementsToCreate, userId) => {
    let playlist_to_create = [];
    for (var i = 0; i < elementsToCreate.length; i++) {
        playlist_to_create.push({
            user_id: userId,
            playlist_id: elementsToCreate[i].id,
            name: elementsToCreate[i].Name,
            description: elementsToCreate[i].Description,
            label_color: elementsToCreate[i].LabelColor,
            time: elementsToCreate[i].Time,
            points_count: elementsToCreate[i].Points,
            favourite: elementsToCreate[i].Favourite,
            loop: elementsToCreate[i].Loop,
            playlist_points: elementsToCreate[i].stationaryPlaylistPoints,
            sync_state: true
        })
    }
    return playlist_to_create;
}


/**
 * 
 * @param {array of incoming objects from mobile} elementsToUpdate 
 * @param {string} userId 
 * @returns this return a modulated custom object that will update  saved in DB
 */
const getPlaylistsArrayToUpdateInDb = (elementsToUpdate, userId) => {
    let playlistsToUpdate = []
    for (var i = 0; i < elementsToUpdate.length; i++) {
        let playlist = {
            user_id: userId,
            playlist_id: elementsToUpdate[i].id,
            name: elementsToUpdate[i].Name,
            description: elementsToUpdate[i].Description,
            label_color: elementsToUpdate[i].LabelColor,
            time: elementsToUpdate[i].Time,
            points_count: elementsToUpdate[i].Points,
            favourite: elementsToUpdate[i].Favourite,
            loop: elementsToUpdate[i].Loop,
            playlist_points: elementsToUpdate[i].stationaryPlaylistPoints,
            sync_state: true
        }
        playlistsToUpdate.push(playlist)
    }
    return playlistsToUpdate;

}


/**
 * This method only used in case when there are documents to update so here we are summarising all doc in songle variable
 * @param {array of stationary point object that is new in nature} elementsToCreate 
 * @param {array of stationary point object that was already exist in DB} elementsToUpdate 
 * @param {array of stationary point object that was already exist in DB but was removed} allExistingPointsOfUser 
 */
const getOverallPoints = (elementsToCreate, elementsToUpdate, allExistingPointsOfUser) => {
    console.log("-----> Final calculation using -->  elementsToCreate:" + elementsToCreate.length + " elementsToUpdate:" + elementsToUpdate.length + " allExistingPointsOfUser:" + allExistingPointsOfUser.length)
    const overallStationaryPoints = [];
    for (var i = 0; i < elementsToCreate.length; i++) {
        overallStationaryPoints.push(elementsToCreate[i])
    }
    for (var i = 0; i < elementsToUpdate.length; i++) {
        overallStationaryPoints.push(elementsToUpdate[i])
    }
    for (var i = 0; i < allExistingPointsOfUser.length; i++) {
        if (elementsToUpdate.some(el => el.playlist_id == allExistingPointsOfUser[i].playlist_id)) {

        } else {
            delete allExistingPointsOfUser[i]._id
            overallStationaryPoints.push(allExistingPointsOfUser[i])
        }
    }

    return overallStationaryPoints;
}


const getAllPlaylist = async (userId) => {
    try {
        const db = await getDb();
        const playlistCollection = db.collection('stationaryplaylist');
        const docs = await playlistCollection.find({ user_id: userId }).toArray();
        if (docs.length == 0) {
            return failedResponse("No Playlist found")
        } else {
            return successResponse("You have " + docs.length + " playlist stored on server.", docs);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}