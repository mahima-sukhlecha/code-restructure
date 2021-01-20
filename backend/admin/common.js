const request = require('request');

//send GET request in sync
function getRequest(url, token) {
    try {
        return new Promise(function (resolve, reject) {
            request({
                url: url,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                method: 'GET'
            }, function (error, response, body) {
                if (!error && response.statusCode >= 200) {
                    //console.log(body)
                    resolve(body);
                } else {
                    console.log(error)
                    reject(error);
                }
            });
        });
    }
    catch (error) {
        throw error
    }
}

module.exports =
{
    getRequest
}