var config = {
    myapikey: {
        samlStrategy: {
            // v5: `path`/`protocol` removed; absolute `callbackUrl` now REQUIRED
            // (must match the ACS URL registered at the IdP).
            "callbackUrl": "https://your-integrify-host/samlauth/myapikey/login/callback",
            "entryPoint": "https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php",
            "issuer": "IntegrifySAMLTest",
            // v5: `cert` renamed to `idpCert`.
            "idpCert": "idp-openid.crt",
            // v5: `audience` validated; defaults to `issuer`. Set to false to disable.
            "audience": "IntegrifySAMLTest",
            // v5 secure defaults (both true). Flip to false only if the IdP does not
            // sign the assertion / response — verify against the live IdP first.
            "wantAssertionsSigned": true,
            "wantAuthnResponseSigned": true
        },
        integrify: {
            "service_user" : "iApprove",
            "integrify_base_url" : "http://localhost:3500",
            "consumer_key": "myapikey",
            "consumer_secret": "mysecret",
            "fieldMap" : {
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
