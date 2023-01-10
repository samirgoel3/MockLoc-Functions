const axios = require('axios');
const { getGoogleHeader } = require('../api-helper');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.type) {
            return failedResponse("Please mention Google Api Type")
        } else {
            if (body.type == "NEARBY") { return nearBy(event) }
            if (body.type == "ADDRESS_BY_LOCATION") { return getAddressByLocation(event) }
            if (body.type == "DIRECTION") { return getDirectionRouteBetweenTwoPoints(event) }
            if (body.type == "AUTO_COMPLETE") { return getAutoComplete(event) }
            else { return failedResponse("Api doesn't support the type") }

        }
    } catch (e) {
        return failedResponse("EXCEPTION in Google Maps API --> " + e.message)
    }
}

// NearBy Location Api 
const nearBy = async (event) => {
    try {
        const body = JSON.parse(event.body)
        const location = body.location
        const radius = body.radius
        const searchtype = body.searchtype

        if (!location || !radius || !searchtype) { return failedResponse("Required Field Missing.") }
        else {
            const apiToCall = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + location + "&radius=" + radius + "&type=" + searchtype + "&key=" + process.env.GOOGLE_NEARBY_API_KEY
            const res = await axios.post(apiToCall, { headers: getGoogleHeader() });
            return successResponse("Nearby location for " + searchtype + " fetched successfully.", res.data);
        }
    } catch (e) {
        failedResponse("" + e.message)
    }
}

// Reverse Geo Code
const getAddressByLocation = async (event) => {
    try {
        const body = JSON.parse(event.body)
        const location = body.location;
        if (!location) {
            return failedResponse("Required Field missing")
        } else {
            const apiToCall = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + location + "&key=" + process.env.GOOGLE_REVERSE_GEO_CODE_API_KEY;
            const res = await axios.get(apiToCall, { headers: getGoogleHeader() })
            if (res.data.status != 'OK') {
                return failedResponse("Please check you location")
            }
            else {
                return successResponse("Address Obtained Successfully", res.data)
            }

        }
    } catch (e) {
        return failedResponse("Exception happened " + e.message);
    }
}


const getDirectionRouteBetweenTwoPoints = async (event) => {
    try {
        const body = JSON.parse(event.body)
        const travelMode = body.travelMode;
        const startLocation = body.startLocation;
        const endLocation = body.endLocation;
        if (!travelMode || !startLocation || !endLocation) {
            return failedResponse("Required field missing")
        } else {
            const apiToCall = "https://maps.googleapis.com/maps/api/directions/json?origin=" + startLocation + "&destination=" + endLocation + "&mode=" + travelMode + "&key=" + process.env.GOOGLE_DIRECTION_KEY;
            const res = await axios.get(apiToCall, { headers: getGoogleHeader() })
            if (res.data.status != 'OK') {
                return failedResponse("Result is not OK actually")
            }
            else {
                // creating report for app

                const data =  res.data;

                const report = {
                    total_distance: data.routes[0].legs[0].distance.text,
                    total_distance_in_metres: data.routes[0].legs[0].distance.value,
                    total_duration: data.routes[0].legs[0].duration.text,
                    total_duration_in_seconds: data.routes[0].legs[0].duration.value,
                    polyline: data.routes[0].overview_polyline.points,
                    driver_mode: travelMode,
                    start: {
                        address: data.routes[0].legs[0].start_address,
                        lat: data.routes[0].legs[0].start_location.lat,
                        lng: data.routes[0].legs[0].start_location.lng,
                    },
                    destination: {
                        address: data.routes[0].legs[0].end_address,
                        lat: data.routes[0].legs[0].end_location.lat,
                        lng: data.routes[0].legs[0].end_location.lng,
                    },
                };
                
                return successResponse("Route Data Obtained Successfully", report)
            }
        }
    } catch (e) {
        return failedResponse("" + e.message)
    }
}


const getAutoComplete = async (event) => {
    try {
        const body = JSON.parse(event.body)
        const input = body.input;
        const location = body.location;
        if (!input || !location ) {
            return failedResponse("Required field missing")
        } else {
            const apiToCall = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + input + "&location=" + location  + "&key=" + process.env.GOOGLE_AUTO_COMPLETE_KEY;
            const res = await axios.get(apiToCall, { headers: getGoogleHeader() })
            if (res.data.status != 'OK') {
                return failedResponse(""+res.data.error_message)
            }
            else {
                const data =  res.data;
                return successResponse("Route Data Obtained Successfully", data)
            }
        }
    } catch (e) {
        failedResponse("" + e.message)
    }
}