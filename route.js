/**
 * Created by trusky on 9/16/15.
 */
var samls = require("./samls");
var bodyParser = require('body-parser')
var morgan = require('morgan');
var fs = require ("fs")
var path = require("path")
var express = require('express');
var app = express();
var integrifyAuth = require("./integrify-auth")
var url = require("url")
var cookieParser = require("cookie-parser")
var R  = require("ramda")
var querystring = require("querystring")

app.use(morgan('dev'));

var logger;
try {
    logger = require('integrify-require')('integrify-logger');
    logger.info("using integrify logger", "integrify-saml")
} catch(e) {
    console.log(e);
    console.log("using console for logging")
    logger = console;
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


console.log("samls loaded: " + samls.passport._strategies)


app.use(samls.passport.initialize());


app.get('/:appkey/metadata', function (req, res) {

    var strategy = samls.passport._strategies['saml-' + req.params.appkey];
    var metaData = strategy.generateServiceProviderMetadata()

    res.type('text/xml')
    res.send(metaData);
});

app.get("/:appkey/", function(req,res){
    var exp = 600 * 1000;
    var integrifyUrl = req.query.r || req.query.redirect;
    res.cookie('integrifyUrl', integrifyUrl, {maxAge: exp});

    res.redirect("/samlauth/" + req.params.appkey + "/login")

})

app.get('/:appkey/login', function(req, res, next) {
    samls.passport.authenticate('saml-' + req.params.appkey, function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.status(500).send(err); }
        //req.logIn(user, function(err) {
        //    if (err) { return next(err); }
            //return  res.redirect('/' + req.params.appkey);
        //});
    })(req, res, next);
});

app.get('/:appkey/logout', function(req, res) {
    res.clearCookie('iapi_token');
    var config = samls.config[req.params.appkey];
    const samlStrategy = samls.passport._strategies["saml-" + req.params.appkey];
    req.user = {nameIDFormat: config.samlStrategy.identifierFormat, nameID: req.cookies.NameID};
    samlStrategy.logout(req, function(err, redirectUrl) {
        if (err) { return next(err); }
        if (!redirectUrl) { return res.status(500).send(err); }
        res.clearCookie('NameID');
        res.redirect(redirectUrl)
    });
});

app.post('/:appkey/login/callback', function(req, res, next) {

    samls.passport.authenticate('saml-' + req.params.appkey, function(err, user, info) {

        var config = samls.config[req.params.appkey];
        if (err) {
            logger.error("Error extracting user from saml assertion:", err, 'integrify-saml')
            return next(err);
        }
        if (!user) {
            logger.error("Empty user from saml assertion:", 'integrify-saml')
            return res.status(500).send(err)
        }
        logger.info("user extracted from saml assertion:", user, 'integrify-saml')
        integrifyAuth.loginSaml(user, config.integrify, function (err, tok) {
            if (err) {
                return res.status(500).send(err);
            }
            var exp = 600 * 1000;
            var destinationUrl = req.cookies.integrifyUrl;
            res.clearCookie('integrifyUrl', {maxAge: exp});
            if (destinationUrl) {

                var redirectrUrlObj = url.parse(destinationUrl);
                delete redirectrUrlObj.search;
                if (!redirectrUrlObj.query) redirectrUrlObj.query = {};
                //querystring token only works in v6
                if (config.integrify.useQueryStringSToken){
                    redirectrUrlObj.query.token_type = "bearer";
                    redirectrUrlObj.query.token = tok.token;
                } else {
                    var accessToken = {};
                    accessToken.oauth_token = tok.token.replace(/-/g, "");
                    accessToken.oauth_token_secret = '00000';
                    res.cookie('iapi_token', 'access&'+ querystring.stringify(accessToken), {
                        secure: config.integrify.use_secure_cookie,
                        httpOnly: config.use_http_only_cookie
                    });
                    res.cookie('NameID', user[config.integrify.fieldMap["UserName"]], {
                        secure: config.integrify.use_secure_cookie,
                        httpOnly: config.use_http_only_cookie
                    });

                }

                var redirectUrl = url.format(redirectrUrlObj);

                return res.redirect(redirectUrl);
            } else {
                return res.status(500).send("Your login took too long to process");

            }

        });
    })(req, res, next);
});


app.get('/:appkey/status', function (req, res) {
    var config = samls.config[req.params.appkey];
    var msg = "SAMl Module Not Configured for " + req.params.appkey;
    if (config){
        msg = 'SAML Module Loaded form ' + req.params.appkey;

    }
    res.send(msg);
});

var SamlAuth = function(){
    this.router = app;
}

module.exports = new SamlAuth();
