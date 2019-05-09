var config = {
    myapikey: {
        samlStrategy: {

            entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
            issuer: "integrify-saml-client",
            protocol: "http://",
            cert: "idp.crt",
            privateCert: "integrify.pem",
            acceptedClockSkewMs: -1,
            // authnContext: 'urn:oasis:names:tc:SAML:2.0:ac:classes:Password<',
            identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
            signatureAlgorithm: 'sha256',
            loggerType: "dev",
            callbackUrl: "http://localhost:3001/samlauth/integrifyinstance/login/callback",
            forceAuthn: false,
            logoutUrl: "http://localhost:8080/simplesaml/saml2/idp/SingleLogoutService.php"
        },
        integrify: {
            "useCookieToken":true,
            "service_user" : "iApprove", // and account in integrify with permissions to create and update users
            "integrify_base_url" : "https://integrify.yourdomain.com", //the url of your Integrify site
            "consumer_key": "myapikey", //your API key  (consumer_key) see https://developer.integrify.com/external-auth/activation
            "consumer_secret": "myapisecret", //your API secret (consumer_secret)
            "use_secure_cookie": false, //set to true if all of your Integrify servers are running under https and any load balancer in use supports and is configured for this
            "use_http_only_cookie": true, //set to false for pre 2019-03 versions of Integrify
            "tokenExpiresInMinutes" : 60, //number of minutes the loging seeiosn is valid
            "fieldMap" : {  // a mapping of Integrify profile fields to fields returned in the SAML.
                "NameFirst": "givenName",
                "NameLast" : "sn",
                "Email" : "mail",
                "UserName" : "mail",
                "Defaults":{"TimeZone":"Eastern Standard Time"}
            }
        }
    }

}


module.exports = config;
