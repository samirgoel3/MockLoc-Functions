exports.failedResponse = async( message)=>{
    return {
        statusCode: 200,
        body: JSON.stringify({
            result:0,
            message:""+message,
            response:[]
        })
    }
}


exports.successResponse = async( message, resposeToSend)=>{
    return {
        statusCode: 200,
        body: JSON.stringify({
            result:1,
            message:""+message,
            response:resposeToSend
        })
    }
}

