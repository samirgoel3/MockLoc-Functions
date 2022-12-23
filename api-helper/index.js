require('dotenv').config()

exports.getHeader = ()=>{
    return {
        'Access-Control-Request-Headers': '*',
        'Content-Type': 'application/json',
        'api-key': process.env.MONGO_DB_API_KEY
    }
}

exports.getGoogleHeader = ()=>{
    return {
        'Access-Control-Request-Headers': '*',
        'Content-Type': 'application/json'
    }
}


exports.apiError = async(status, message)=>{
    return {
        statusCode: status,
        body: JSON.stringify({
            message:""+message,
            response:[]
        })
    }
}