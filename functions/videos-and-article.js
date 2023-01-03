const axios = require('axios');
const { getHeader } = require('../api-helper');
const { FIND_ALL } = require('../api-helper/querryMethods');
const { failedResponse, successResponse } = require('../api-helper/response-handler');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body)
        if (!body.type) {
            return failedResponse("Please mention Type Article or Videos")
        } else {
            if (body.type == "ARTICLE") { return getArticles(event) }
            if (body.type == "VIDEOS") { return getVideoTutorials(event) }
            else { return failedResponse("Api doesn't support the type") }

        }
    } catch (e) {
        return failedResponse("EXCEPTION in Videos and Articles API --> " + e.message)
    }
}


const getVideoTutorials = async (event) => {
    try {
        const QUERRY = {
            "collection": "videos",
            "database": "mocklocations",
            "dataSource": "mocklocations"
        }

        let res = await axios.post(FIND_ALL, QUERRY, {headers:getHeader()})
        if (!res.data.documents) {
            return failedResponse("No videos and tutorials found")
        } else {
            return successResponse("Videos found successfully", res.data.documents);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getVideoTutorials " + e.message)
    }
}


const getArticles = async (event) => {
    try {
        const QUERRY = {
            "collection": "articles",
            "database": "mocklocations",
            "dataSource": "mocklocations"
        }

        let res = await axios.post(FIND_ALL, QUERRY, {headers:getHeader()})
        if (!res.data.documents) {
            return failedResponse("No articles found")
        } else {
            return successResponse("Article found successfully", res.data.documents);
        }
    } catch (e) {
        return failedResponse("EXCEPTION in getArticles " + e.message)
    }
}
