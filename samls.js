/**
 * Created by trusky on 9/21/15.
 */
var SamlStrategy = require('@node-saml/passport-saml').Strategy
var fs = require ("fs")
var path = require("path")
var R  = require("ramda")

var Samls = function samls() {
    var me = this;
    try {


        var config = me.config;
        //loop through keys and get individual configs

        var loadStrategy = function (appkey) {
            var thisConfig = config[appkey];
            // v5: `cert` was renamed to `idpCert` (the IdP's signing certificate).
            if (thisConfig.samlStrategy.idpCert) {
                try {
                    thisConfig.samlStrategy.idpCert = fs.readFileSync(path.join(__dirname, thisConfig.samlStrategy.idpCert), 'utf-8')
                }
                catch (e) {
                    console.error(e)
                }

            }
            // v5: `privateCert` was renamed to `privateKey` (our SP private key for signing requests).
            if (thisConfig.samlStrategy.privateKey) {
                try {
                    thisConfig.samlStrategy.privateKey = fs.readFileSync(path.join(__dirname, thisConfig.samlStrategy.privateKey), 'utf-8')
                }
                catch (e) {
                    console.error(e)
                }

            }
            // v5: the Strategy constructor takes TWO verify callbacks — one for
            // sign-on and a (now required) one for logout. Both simply pass the
            // profile through, preserving the prior single-callback behavior.
            var samlStrat = new SamlStrategy(
                thisConfig.samlStrategy,
                function (profile, done) {
                    return done(null, profile);
                },
                function (profile, done) {
                    return done(null, profile);
                });
            samlStrat.name = 'saml-' + appkey;

            me.passport.use(samlStrat);

        };
        R.forEach(loadStrategy, R.keys(config));


    }
    catch (e) {
        console.log(e)


    }
}
Samls.prototype.passport = require("passport");
Samls.prototype.config = require("./config.js");

module.exports = new Samls();
