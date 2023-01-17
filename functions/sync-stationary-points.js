const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL, DELETE_MANY, INSERT_MANY } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.stationary_points || !body.user_id) { return failedResponse("Required Field missign | stationary_points |user_id") }
        const incoming_points = body.stationary_points;

        console.log("-----> Total Incoming point by user ID: " + body.user_id + ": " + incoming_points.length);
        if(incoming_points.length == 0 ){ return failedResponse("No Stationary Point Received")}



        const querryToGetAllExistingPoints = { "collection": "stationarypoints", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_id": "" + body.user_id } }

        let axiosFindAllResponse = await axios.post(FIND_ALL, querryToGetAllExistingPoints, { headers: getHeader() });

        let allExistingPointsOfUser = axiosFindAllResponse.data.documents;
        if (allExistingPointsOfUser.length != 0) { console.log("-----> This user does already have some saved documents", " length=" + allExistingPointsOfUser.length) }
        else { console.log("-----> This user does not have any saved documents") }

        /**
         * Check weather element to be update or create
         */
        var elementsToUpdate = [], elementsToCreate = [];
        for (var i = 0; i < incoming_points.length; i++) {
            if (allExistingPointsOfUser.some(el => el.latitude == incoming_points[i].Latitude)) {
                elementsToUpdate.push(incoming_points[i])
            } else {
                elementsToCreate.push(incoming_points[i])
            }
        }
        console.log("-----> Elements to update", elementsToUpdate.length)
        console.log("-----> Elements to Insert", elementsToCreate.length)


        if (elementsToUpdate.length > 0) {
            let stationaryPointsToUpdate = getStationaryPointArrayToUpdateInDb(elementsToUpdate, body.user_id);
            let stationaryPointToCreate = getStationaryPointArrayToAddInDb(elementsToCreate, allExistingPointsOfUser, body.user_id);

            // deleting existing docs
            const querryDeleteExistingPoints = { "collection": "stationarypoints", "database": "mocklocations", "dataSource": "mocklocations", "filter": { "user_id": "" + body.user_id } }
            const deletedDocument = await axios.post(DELETE_MANY, querryDeleteExistingPoints, { headers: getHeader() })
            console.log("-----> Existing Document Deleted: ", JSON.stringify(deletedDocument.data))

            // Collecting all existing and new point in single array 
            const overallPointsToAddInDb = getOverallPoints(stationaryPointToCreate, stationaryPointsToUpdate, allExistingPointsOfUser);
            console.log("-----> Overall ST Point need to add and update in DB: ", overallPointsToAddInDb.length);


            // Inserting overall elements in DB 
            const querryToInsertMultipleDocs = {
                "collection": "stationarypoints",
                "database": "mocklocations",
                "dataSource": "mocklocations",
                "documents": overallPointsToAddInDb
            }
            const overallInsertionResult = await axios.post(INSERT_MANY, querryToInsertMultipleDocs, { headers: getHeader() })
            console.log("-----> Overall documents inserted response ", JSON.stringify(overallInsertionResult.data))
            return getAllStationaryPoints(body.user_id)
            // return successResponse("Overall documents inserted response", overallInsertionResult.data);

        } else {
            if (elementsToCreate.length > 0) {
                let stationaryPointToCreate = getStationaryPointArrayToAddInDb(elementsToCreate, allExistingPointsOfUser, body.user_id);
                console.log("Overall ST Point need to add in DB: ", stationaryPointToCreate.length);

                // Inserting overall elements in DB 
                const querryToInsertMultipleDocs = {
                    "collection": "stationarypoints",
                    "database": "mocklocations",
                    "dataSource": "mocklocations",
                    "documents": stationaryPointToCreate
                }
                const axiosResponse = await axios.post(INSERT_MANY, querryToInsertMultipleDocs, { headers: getHeader() })
                return getAllStationaryPoints(body.user_id)
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
const getStationaryPointArrayToAddInDb = (elementsToCreate, allExistingPointsOfUser, userId) => {
    let stationaryPointToCreate = [];
    let counter = allExistingPointsOfUser.length;
    for (var i = 0; i < elementsToCreate.length; i++) {
        stationaryPointToCreate.push({
            user_id: "" + userId,
            point_id: counter + 1,
            name: elementsToCreate[i].Name,
            description: elementsToCreate[i].Description,
            latitude: elementsToCreate[i].Latitude,
            longitude: elementsToCreate[i].Longitude,
            geographic_address: elementsToCreate[i].geogrphicAddress,
            icon: elementsToCreate[i].Icon,
            timeZone: elementsToCreate[i].TimeZone,
            is_favourite: elementsToCreate[i].IsFavourite,
            hours_playback: elementsToCreate[i].HourPlayback,
            playlist_linkage: elementsToCreate[i].PlayListLinkage,
            selected_via: elementsToCreate[i].SelectedVia,
            date: elementsToCreate[i].TimeStamp,
            launches: elementsToCreate[i].launches,
            sync_state: true,
                accuracy:elementsToCreate[i].accuracy ? elementsToCreate[i].accuracy :0.0
        })
        counter = counter + 1;
    }
    return stationaryPointToCreate;
}


/**
 * 
 * @param {array of incoming objects from mobile} elementsToUpdate 
 * @param {string} userId 
 * @returns this return a modulated custom object that will update  saved in DB
 */
const getStationaryPointArrayToUpdateInDb = (elementsToUpdate, userId) => {
    let stationaryPointToUpdate = []
    for (var i = 0; i < elementsToUpdate.length; i++) {
        stationaryPointToUpdate.push(
            {
                user_id: userId,
                point_id: "" + elementsToUpdate[i].id,
                name: elementsToUpdate[i].Name,
                description: elementsToUpdate[i].Description,
                latitude: elementsToUpdate[i].Latitude,
                longitude: elementsToUpdate[i].Longitude,
                geographic_address: elementsToUpdate[i].geogrphicAddress,
                icon: elementsToUpdate[i].Icon,
                timeZone: elementsToUpdate[i].TimeZone,
                is_favourite: elementsToUpdate[i].IsFavourite,
                hours_playback: elementsToUpdate[i].HourPlayback,
                playlist_linkage: elementsToUpdate[i].PlayListLinkage,
                selected_via: elementsToUpdate[i].SelectedVia,
                date: elementsToUpdate[i].TimeStamp,
                launches: elementsToUpdate[i].launches,
                accuracy:elementsToUpdate[i].accuracy ? elementsToUpdate[i].accuracy :0.0, 
                sync_state: true
            }
        )
    }
    return stationaryPointToUpdate;

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
            delete allExistingPointsOfUser[i]._id
            overallStationaryPoints.push(allExistingPointsOfUser[i])
        }
    }

    return overallStationaryPoints;
}


const getAllStationaryPoints = async (userId) => {
    try {
        const QUERRY = {
            "collection": "stationarypoints",
            "database": "mocklocations",
            "dataSource": "mocklocations",
            "filter": { "user_id": userId, }
        }

        let res = await axios.post(FIND_ALL, QUERRY, { headers: getHeader() })
        if (res.data.documents.length == 0) {
            return failedResponse("No Stationary points found for this user")
        } else {
            return successResponse("You have " + res.data.documents.length + " stationary points stored on server.", res.data.documents);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}