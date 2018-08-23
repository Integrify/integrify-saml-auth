var request = require("request");
var integrifyToken = require("integrify-access-token");
var url = require("url")
var R = require("ramda")
var querystring = require("querystring")
var logger;
try {
     logger = require('integrify-require')('integrify-logger');
} catch(e) {
    console.log(e);
    var logger = console;
}

var integrifyAuth = {}



integrifyAuth.loginSaml = function loginSaml(user, instanceAuthConf, callback) {


    var options = {
        key: instanceAuthConf.consumer_key,
        secret: instanceAuthConf.consumer_secret,
        "url": instanceAuthConf.integrify_base_url,
        username: instanceAuthConf.service_user
    }
    var keyMap = instanceAuthConf.fieldMap;
    integrifyToken.getTokenFromJWT(options, function (err, tokenObj) {

        if (err) {
            logger.error(err, "integrify-saml");
            return callback('invalid key or user', err);
        }
        //create an object for oauth header
        tokenObj = JSON.parse(tokenObj);
        tokenObj.key = instanceAuthConf.consumer_key;
        tokenObj.token = tokenObj.access_token;
        tokenObj.sso = true;

        //check to see is user exists
        var userUrl = url.resolve(instanceAuthConf.integrify_base_url, "users?username=" + user[keyMap["UserName"]]);

        logger.info("Checking user in Integrify DB", "integrify-saml");

        let tempOAuthHeader =  {Oauth: querystring.stringify(tokenObj)};
        request.get({
            url: userUrl,
            headers: tempOAuthHeader
        }, function (err, resp, users) {
            if (err) return callback(err);
            users = JSON.parse(users);
            //console.log(users);
            var thisUser = {};
            if (users.Items.length > 0) {
                var existingUser = users.Items[0];
                thisUser.SID = existingUser.SID;
                logger.info("User found", existingUser, "integrify-saml");
            }

            var mapKeys = R.keys(R.omit(['Defaults'],keyMap));

            logger.info("Mapping SAML Response values to user properties", "integrify-saml");
            var mapIt = function(x) { thisUser[x] = user[keyMap[x]] || keyMap.Defaults[x]; };
            R.forEach(mapIt, mapKeys); //=> [1, 2, 3]
            //_.each(mapKeys, function (key) {
            //    thisUser[key] = user[keyMap[key]];
            //});

            if (!thisUser.NameFirst || !thisUser.NameLast || !thisUser.Email || !thisUser.UserName) {
                logger.error("First Name, Last Name, Email and User Name must be passed in the SAML Assertion.", tokenObj, "integrify-saml")
                return callback("First Name, Last Name, Email and User Name must be passed in the SAML Assertion.")
            }

            if (thisUser.DeletedDateF) {
                logger.error("User access denied. " + thisUser.UserName + " account has been deactivated:", 'integrify-saml')
                return callback('User account has been deactivated');
            }
            thisUser.IsActive = true;

            //update or insert the user
            var saveUserUrl = url.resolve(instanceAuthConf.integrify_base_url, "users" + (thisUser.SID ? "/" + thisUser.SID : ""));
            var reqMethod = thisUser.SID ? "PUT" : "POST";
            logger.info("Saving user to Integrify", "integrify-saml");
            request({
                method: reqMethod,
                url: saveUserUrl,
                json: thisUser,
                headers: tempOAuthHeader
            }, function (err, resp, save) {
                if (err) {
                    logger.error("Error saving user", err, "integrify-saml");
                    return callback(err);
                }

                logger.info("Result of saving user" + save.toString(),  "integrify-saml");

                //activate the user's original token by calling the impersonate api with request-token=true in the querystring.
                imepersonateURL = url.resolve(instanceAuthConf.integrify_base_url, "access/impersonate?key=" + instanceAuthConf.consumer_key + "&user=" + thisUser.UserName);

                //the below code could be used to automatically expire the token in a certain timeframe
                //options = {key: instanceAuthConf.consumer_key,secret:instanceAuthConf.consumer_secret,"url":instanceAuthConf.integrify_base_url, username:thisUser.UserName, expiresInMinutes:20}
                //integrifyToken.getTokenFromJWT(options, function(err,tokenObj){

                // if (instanceAuthConf.tokenExpiresInMinutes) {
                //
                //     var d = new Date();
                //     d.setMinutes(d.getMinutes() + instanceAuthConf.tokenExpiresInMinutes);
                //
                //    imepersonateURL = imepersonateURL + "&expires=" +  (d.getTime()/1000.00);
                // }
                request(imepersonateURL, function (err, resp, tokenObj) {
                    if (!err) {

                        tokenObj = JSON.parse(tokenObj);
                        logger.info("recieved a valid access token", tokenObj, "integrify-saml")
                    }

                    callback(err, tokenObj);
                });

            })

        })

    });
}

module.exports = integrifyAuth;