const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL, DELETE_MANY, INSERT_MANY } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.playlists || !body.user_id) { return failedResponse("Required Field missign | playlists |user_id") }
        const incoming_playlists = body.playlists;

        console.log("-----> Total Incoming playlist by user ID: " + body.user_id + ": " + incoming_playlists.length);



        const querryToGetAllExistingPlaylists = { "collection": "stationaryplaylist", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_id": "" + body.user_id } }

        let axiosFindAllResponse = await axios.post(FIND_ALL, querryToGetAllExistingPlaylists, { headers: getHeader() });

        let allExistingPlaylistsOfUser = axiosFindAllResponse.data.documents;
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
        failedResponse("This is testing")


        // if (elementsToUpdate.length > 0) {
        //     let playlistsToUpdate = getPlaylistsArrayToUpdateInDb(elementsToUpdate, body.user_id);
        //     let playlistsToCreate = getPlaylistsArrayToAddInDb(elementsToCreate, body.user_id);

        //     // deleting existing docs
        //     const querryDeleteExistingPoints = { "collection": "stationarypoints", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_id": "" + body.user_id } }
        //     const deletedDocument = await axios.post(DELETE_MANY, querryDeleteExistingPoints, { headers: getHeader() })
        //     console.log("-----> Existing Document Deleted: ", JSON.stringify(deletedDocument.data))

        //     // Collecting all existing and new point in single array 
        //     const overallPointsToAddInDb = getOverallPoints(stationaryPointToCreate, stationaryPointsToUpdate, allExistingPointsOfUser);
        //     console.log("-----> Overall ST Point need to add and update in DB: ", overallPointsToAddInDb.length);

        //     // Inserting overall elements in DB 
        //     const querryToInsertMultipleDocs = {
        //         "collection": "stationarypoints",
        //         "database": "mocklocations",
        //         "dataSource": "mocklocations",
        //         "documents": overallPointsToAddInDb
        //     }
        //     const overallInsertionResult = await axios.post(INSERT_MANY, querryToInsertMultipleDocs, { headers: getHeader() })
        //     console.log("-----> Overall documents inserted response ", JSON.stringify(overallInsertionResult.data))
        //     return successResponse("Overall documents inserted response", overallInsertionResult.data);

        // }
        // else {
        //     if (elementsToCreate.length > 0) {
        //         let stationaryPointToCreate = getStationaryPointArrayToAddInDb(elementsToCreate, allExistingPointsOfUser, body.user_id);
        //         console.log("Overall ST Point need to add in DB: ", stationaryPointToCreate.length);

        //         // Inserting overall elements in DB 
        //         const querryToInsertMultipleDocs = {
        //             "collection": "stationarypoints",
        //             "database": "mocklocations",
        //             "dataSource": "mocklocations",
        //             "documents": stationaryPointToCreate
        //         }
        //         const axiosResponse = await axios.post(INSERT_MANY, querryToInsertMultipleDocs, { headers: getHeader() })
        //         return successResponse("Stationary Points added successfully ", axiosResponse.data)

        //     }
        // }
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
            playlist_id: elementsToCreate[i].stationaryPlaylistNames.id,
            name: elementsToCreate[i].stationaryPlaylistNames.Name,
            description: elementsToCreate[i].stationaryPlaylistNames.Description,
            label_color: elementsToCreate[i].stationaryPlaylistNames.LabelColor,
            time: elementsToCreate[i].stationaryPlaylistNames.Time,
            points_count: elementsToCreate[i].stationaryPlaylistNames.Points,
            favourite: elementsToCreate[i].stationaryPlaylistNames.Favourite,
            loop: elementsToCreate[i].stationaryPlaylistNames.Loop,
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
            playlist_id: elementsToUpdate[i].stationaryPlaylistNames.id,
            name: elementsToUpdate[i].stationaryPlaylistNames.Name,
            description: elementsToUpdate[i].stationaryPlaylistNames.Description,
            label_color: elementsToUpdate[i].stationaryPlaylistNames.LabelColor,
            time: elementsToUpdate[i].stationaryPlaylistNames.Time,
            points_count: elementsToUpdate[i].stationaryPlaylistNames.Points,
            favourite: elementsToUpdate[i].stationaryPlaylistNames.Favourite,
            loop: elementsToUpdate[i].stationaryPlaylistNames.Loop,
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
        if (elementsToUpdate.some(el => el.latitude == allExistingPointsOfUser[i].latitude)) {

        } else {
            delete elementsToUpdate[i]._id
            overallStationaryPoints.push(elementsToUpdate[i])
        }
    }

    return overallStationaryPoints;
}