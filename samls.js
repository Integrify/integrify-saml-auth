/**
 * Created by trusky on 9/21/15.
 */
var SamlStrategy = require('passport-saml').Strategy
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
            if (thisConfig.samlStrategy.cert) {
                try {
                    thisConfig.samlStrategy.cert = fs.readFileSync(path.join(__dirname, thisConfig.samlStrategy.cert), 'utf-8')



                }
                catch (e) {
                    console.error(e)
                }

            }
            var samlStrat = new SamlStrategy(
                thisConfig.samlStrategy,
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