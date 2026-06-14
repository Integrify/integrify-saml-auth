var jwt = require("jsonwebtoken");
var url = require("url")
var R = require("ramda")
var querystring = require("querystring")
var logger;
try {
    logger = require('integrify-require')('integrify-logger');
} catch (e) {
    console.log(e);
    var logger = console;
}

var integrifyAuth = {}


// Exchange a signed JWT for an Integrify access token (server token flow).
// Inlined from the (now archived) integrify-access-token package so saml-auth is
// self-contained and free of the deprecated request / jsonwebtoken@8 chain.
function getTokenFromJWT(options, callback) {
    var aud = new URL("/oauth2/token", options.url).href;

    var jwtoptions = { issuer: options.key, audience: aud, subject: options.username };
    if (options.expiresIn) {
        jwtoptions.expiresIn = options.expiresIn;
    }

    var token = jwt.sign({ platform: "node.js" }, options.secret, jwtoptions);

    var body = { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: token };

    fetch(aud, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(body).toString()
    })
    .then(function(resp) {
        // tokenObj is the raw response body string (caller JSON.parses it)
        return resp.text().then(function(tokenObj) {
            if (resp.status != 200) {
                return callback("error:" + resp.status, tokenObj);
            }
            callback(null, tokenObj);
        });
    })
    .catch(function(err) { callback(err); });
}


integrifyAuth.loginSaml = function loginSaml(user, instanceAuthConf, callback) {


    var options = {
        key: instanceAuthConf.consumer_key,
        secret: instanceAuthConf.consumer_secret,
        "url": instanceAuthConf.integrify_base_url,
        username: instanceAuthConf.service_user
    }
    var keyMap = instanceAuthConf.fieldMap;
    getTokenFromJWT(options, function(err, tokenObj) {

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

        let tempOAuthHeader = { Oauth: querystring.stringify(tokenObj) };
        fetch(userUrl, { headers: tempOAuthHeader })
            .then(function(resp) { return resp.text(); })
            .then(function(users) {
                users = JSON.parse(users);
                //console.log(users);
                var thisUser = {};
                if (users.Items.length > 0) {
                    var existingUser = users.Items[0];
                    thisUser.SID = existingUser.SID;
                    logger.info("User found", existingUser, "integrify-saml");
                }

                var mapKeys = R.keys(R.omit(['Defaults'], keyMap));

                logger.info("Mapping SAML Response values to user properties", "integrify-saml");
                var mapIt = function(x) { thisUser[x] = user[keyMap[x]] || keyMap.Defaults[x]; };
                R.forEach(mapIt, mapKeys); //=> [1, 2, 3]

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
                return fetch(saveUserUrl, {
                    method: reqMethod,
                    headers: Object.assign({ "Content-Type": "application/json" }, tempOAuthHeader),
                    body: JSON.stringify(thisUser)
                })
                .then(function(resp) { return resp.text(); })
                .then(function(save) {
                    logger.info("Result of saving user" + save.toString(), "integrify-saml");

                    //activate the user's original token by calling the impersonate api with request-token=true in the querystring.
                    var impersonateURL = url.resolve(instanceAuthConf.integrify_base_url, "access/impersonate?key=" + instanceAuthConf.consumer_key + "&user=" + thisUser.UserName);

                    if (instanceAuthConf.tokenExpiresInMinutes) {
                        var d = new Date();
                        d.setMinutes(d.getMinutes() + instanceAuthConf.tokenExpiresInMinutes);

                        impersonateURL = impersonateURL + "&expires=" + (d.getTime() / 1000.00);
                    }

                    return fetch(impersonateURL)
                        .then(function(resp) { return resp.text(); })
                        .then(function(tokenText) {
                            var tokenObj = JSON.parse(tokenText);
                            logger.info("recieved a valid access token", tokenObj, "integrify-saml")
                            callback(null, tokenObj);
                        });
                });
            })
            .catch(function(err) {
                logger.error("Error during SAML login", err, "integrify-saml");
                return callback(err);
            });

    });
}

module.exports = integrifyAuth;
