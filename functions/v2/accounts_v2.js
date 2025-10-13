
exports.handler = async (event, context) => {
    try {
        return failedResponse("just testing the api")
    } catch (e) {
        return failedResponse(e.message)
    }
}
