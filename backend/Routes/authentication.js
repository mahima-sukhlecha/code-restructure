async function getAuthenticationToken() {
    var adal = require('adal-node');
    var fs = require('fs');
    var https = require('https');
   

    var AuthenticationContext = adal.AuthenticationContext;

    function turnOnLogging() {
        var log = adal.Logging;
        log.setLoggingOptions(
        {
        level : log.LOGGING_LEVEL.VERBOSE,
        log : function(level, message, error) {
            console.log(message);
            if (error) {
            console.log(error);
            }
        }
        });
    }

    turnOnLogging();

    var config = require('./config.json');

    var authorityUrl = config.authorityUrl

    var casjson = fs.readFileSync(__dirname + '\/cas.json');

    var cas = JSON.parse(casjson);
    console.log(cas)
    //https.globalAgent.options.ca = cas

    var promise = undefined;
    // use user credentials and appId to get an aad token
    if (config.authenticationType == "MasterUser")
    {
        var context = new AuthenticationContext(authorityUrl);
        promise = () => { return new Promise(
            (resolve, reject) => {
                context.acquireTokenWithUsernamePassword(config.resourceUrl, config.username, config.password, config.appId , function(err, tokenResponse) {
                    if (err) reject(err);
                    resolve(tokenResponse);
                })
            });
        };
    }
    else if (config.authenticationType == "ServicePrincipal")
    {
        authorityUrl = authorityUrl.replace('common', config.tenantId);
        var context = new AuthenticationContext(authorityUrl);
        promise = () => { return new Promise(
            (resolve, reject) => {
                context.acquireTokenWithClientCredentials(config.resourceUrl, config.appId, config.applicationSecret, function(err, tokenResponse) {
                    if (err){ console.log("errorrrrrrrrrr->>>>>>>",err)
                        reject(err);
                    }
                    console.log("token response=------>",tokenResponse)
                    resolve(tokenResponse);
                })
            });
        };
    }

    var res;
    await promise().then(
        tokenResponse => res = tokenResponse
    ).catch(
        err => res = err 
    );

    return res;
}

  module.exports.getAuthenticationToken = getAuthenticationToken;