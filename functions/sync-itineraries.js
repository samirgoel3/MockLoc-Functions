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
		console.log("-----> Tsting this api is running or not", event.body);

        const body = JSON.parse(event.body);
        
        if (!body.itinerary || !body.user_id) {
			console.log("-----> Required fields missing: itinerary or user_id");
            return failedResponse("Required fields missing: itinerary or user_id");
        }else{
			console.log("-----> Found User ID", body.user_id);
		}
        
        const incomingItineraries = body.itinerary;
        
        console.log("-----> Total incoming itineraries for user ID: " + body.user_id + ": " + incomingItineraries.length);
        if (incomingItineraries.length == 0) {
            return failedResponse("No itineraries received");
        }

        const db = await getDb();
        const itineraries = db.collection('itineraries');
        const userIdStr = '' + body.user_id;

        // Get all existing itineraries for this user
        let allExistingItinerariesOfUser = await itineraries.find({ user_id: userIdStr }).toArray();
        if (allExistingItinerariesOfUser.length != 0) {
            console.log("-----> This user already has some saved itineraries", " length=" + allExistingItinerariesOfUser.length);
        } else {
            console.log("-----> This user does not have any saved itineraries");
        }

        /**
         * Check whether elements need to be updated or created
         * Using itineraryCreatedDate as the unique identifier
         */
        var elementsToUpdate = [], elementsToCreate = [];
        for (var i = 0; i < incomingItineraries.itinerary.length; i++) {
            if (allExistingItinerariesOfUser.itinerary.some(el => el.itineraryCreatedDate === incomingItineraries.itinerary[i].itineraryCreatedDate)) {
                elementsToUpdate.push(incomingItineraries.itinerary[i]);
            } else {
                elementsToCreate.push(incomingItineraries.itinerary[i]);
            }
        }
        console.log("-----> Elements to update", elementsToUpdate.length);
        console.log("-----> Elements to create", elementsToCreate.length);

        // Process updates
        if (elementsToUpdate.length > 0) {
            for (let i = 0; i < elementsToUpdate.length; i++) {
                const itinerary = elementsToUpdate[i];
                await itineraries.updateOne(
                    { 
                        user_id: userIdStr, 
                        itineraryCreatedDate: itinerary.itineraryCreatedDate 
                    },
                    { 
                        $set: {
                            ...itinerary,
                            user_id: userIdStr,
                            sync_state: true,
                            last_updated: new Date()
                        }
                    }
                );
            }
            console.log("-----> Updated " + elementsToUpdate.length + " itineraries");
        }

        // Process creates
        if (elementsToCreate.length > 0) {
            const itinerariesToInsert = elementsToCreate.map(itinerary => ({
                ...itinerary,
                user_id: userIdStr,
                sync_state: true,
                created_at: new Date(),
                last_updated: new Date()
            }));
            
            const insertResult = await itineraries.insertMany(itinerariesToInsert);
            console.log("-----> Created " + insertResult.insertedCount + " new itineraries");
        }

        return successResponse("Itineraries synced successfully.", {
            updated: elementsToUpdate.length,
            created: elementsToCreate.length,
            total: incomingItineraries.length
        });

    } catch (e) {
        console.log("******* Exception " + e.message);
        return failedResponse("Exception in sync-itineraries " + e.message);
    }
}