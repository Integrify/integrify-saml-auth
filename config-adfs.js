var config = {
    myapikey: {
        samlStrategy: {
            // v5: `path`/`protocol`/`host` were removed; an absolute `callbackUrl`
            // is now REQUIRED. It must be the externally-reachable URL of this
            // app's POST callback route (/samlauth/<appkey>/login/callback) and
            // must match the ACS URL registered at the IdP.
            callbackUrl: 'https://your-integrify-host/samlauth/myapikey/login/callback',
            entryPoint: 'https://integrifyadfs.integrify.com/adfs/ls',
            issuer: "integrify-saml-client",
            // v5: `cert` was renamed to `idpCert`.
            idpCert: "idp-adfs.crt",
            // v5: `audience` is validated. Defaults to `issuer`; set explicitly to
            // the SP entityID the IdP expects, or set to false to disable.
            audience: "integrify-saml-client",
            acceptedClockSkewMs: -1,
            authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
            identifierFormat: null,
            signatureAlgorithm: 'sha256',
            // v5 secure defaults (both true). Flip to false ONLY if your IdP does
            // not sign the assertion / response respectively — verify against the
            // live IdP before changing.
            wantAssertionsSigned: true,
            wantAuthnResponseSigned: true,
            loggerType: "dev"
        },
        integrify: {
            "service_user": "iApprove",
            "integrify_base_url": "http://localhost:3500",
            "consumer_key": "myapikey",
            "consumer_secret": "mysecret",
            "fieldMap": {
                "NameFirst": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
                "NameLast": "http://schemas.xmlsoap.org/claims/CommonName",
                "Email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
                "UserName": "nameID",
                "Title": "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                "Defaults":{"TimeZone":"Eastern Standard Time"}

            }
        }
    }
}


module.exports = config;
