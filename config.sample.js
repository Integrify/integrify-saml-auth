var config = {
    myapikey: {
        samlStrategy: {

            "path": "/myapikey/samlcallback", //this will be appended to the full URL that the IDP muts post back to http://yourinstance/samlauth/yourAPIKey/samlcallback
            "entryPoint": "https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php", //the url for initiating a SAML Authn request at your IDP
            "issuer": "IntegrifySAMLTest", //a unique ID typically provided by your IDP
            "protocol": "https://", // http or https
            cert: "idp-openid.crt"
        },
        integrify: {
            "useCookieToken":false,
            "service_user" : "iApprove", // and account in integrify with permissions to create and update users
            "integrify_base_url" : "https://integrify.yourdomain.com", //the url of your Integrify site
            "consumer_key": "myapikey", //your API key  (consumer_key) see https://developer.integrify.com/external-auth/activation
            "consumer_secret": "myapisecret", //your API secret (consumer_secret)
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
