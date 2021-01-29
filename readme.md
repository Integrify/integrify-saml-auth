### Introduction
This accessory code can be installed into an Integrify instance and configured to allow SSO integration via SAML 2.0 with almost any identity provider (ADFS, OKTA, ping...).  This will create a service initiated (your intergify site needs to be auth initiator) implementation with auto provisioning of authenticated users.

_NOTE: Active directory group membership, group provisioning, and manager sync are not within the scope of this client's implementation._

### What do I need?
You will need the following items in order to properly install and configure this SAML 2.0 client into your Integrify installation:

* Administrative access to your Integrify application server
* Ability to run sql scripts against the Integrify consumers tables in the DB
* Your identity provider's signing certificate in base64 format (to verify the SAML asertion when received)


### Installation
1.  Select the proper branch in the branch selector on the left:
    * master for Integrify version 7
    * master-6 for Integrify version 6
   
2.  Click the green ***Clone or Download*** button toward the upper-right and then click ***Download ZIP*** from the displayed window.

3.  On your Integrify application server, create a folder named **\_custom** in the **\integrify\app\webserver\app\\** directory if it does not already exist.

4.  Move the downloaded zip file to the **\integrify\app\webserver\app\\_custom\\** folder and unzip it.

5.  Open an administrative command prompt on the server, and ***cd*** (change directory) to the **\integrify\app\webserver\app\\_custom\integrify-saml-auth-master\\** directory

6.  Run the following command: `npm install`

7.  Copy the **samlauth.yml** file from the **\integrify\app\webserver\app\\_custom\integrify\saml-auth-master\\** directory to the **\integrify\app\webserver\app\data\routes\\** directory

8.  Copy the **auth-config-yourhost-yourport.yml** file from the **\integrify\app\webserver\app\\_custom\integrify\saml-auth-master\\** directory to the **\integrify\app\webserver\\** directory


### Configuration (for commmunication with your Integrify environment)

1.  Create a new API key for integration purposes following the instructions on the [Integrify developer activation page](https://developer.integrify.com/rest/activation).  You can find your **LicenseID** in the Integrify Application at _System Settings > System Config > ID_ or within the Integrify OnPremise Manager under your application name (normally **Integrify**) and _Edit Instance Settings_.

2.  Copy your identity provider's signing certificate in base64 format to the **\integrify\app\webserver\app\\_custom\integrify-saml-auth-master\\** directory

3.  In the **\integrify\app\webserver\app\\_custom\integrify-saml-auth-master\\** directory, choose the example config file that is most similar to the IDP you will be integrating with, and copy either the config.saml.js, config-adfs.js or config-openid.js (example configs) into the same folder.

4.  Rename the copied file to **config.js**.  

5.  Edit config.js based on the requirements specified by your IDP and your Integrify instance settings. 
    *  Replace **myapikey** with the key you created in step 1 on line 2 and in the **callbackURL** and/or **path** settings in the _samlStrategy_ section
    *  Configure **callbackURL** and/or **path** to reflect the proper base url of your integrify installation
    *  Configure the **cert** parameter to reflect the file name of the identity provider's signing certificate in base64 format
    *  Configure the **consumer_key**, and **consumer_secret** parameters in the _integrify_ section to the API key generated in step 1
    *  Configure **integrify_base_url** in the _integrify_ section to reflect the proper base url of your Integrify installation  
    
6.  Edit the contents of the **auth-config-yourhost-yourport.yml** file in the **\integrify\app\webserver\\** directory replacing **myapikey** and the base url in _url_  and _logout_ properties to match your Integrify instance.

7.  Rename the  **auth-config-yourhost-yourport.yml** file, replacing **yourhost** with the base url of the Integrify instance. If Integrify is running on a port other than 80 or 443, replace **yourport** with the port the Integrify application is listening on. If Integrify is running on port 80 or por 443, remove **-yourport** from the file name. Add **.disabled** after **.yml** in the filename to temporarily disable it's use.

8.  Restart your Integrify instance using the Integrify OnPremise Manager.

At this point, the SAML client is in a pre-configured state where it should be up and communicating properly with the Integrify side of things, but not actually enabled.  Use the links in the next two steps to verify.

9.  Point your browser to **http(s)://{your integrify base url}/samlauth/{myapikey}/status** to verify that the module has loaded

10. Point your browser to **http(s)://{your integrify base url}/samlauth/{myapikey}/metadata** to get the XML metadata that describes this service including the Assertion Consumer Service URL and Identifier.  Note that this link does not currently provide enough information to use for _import_ on the IDP side.

* To enable use of the SAML client, remove the **.disabled** from the end of the **auth-config-yourhost-yourport.yml.disabled** filename in the **\integrify\app\webserver\\** directory.

### Mapping your SAML Attributes to Integrify profile fields:

Locate the section of your config.js file for the fieldMap. It will look something like this by default:

    "fieldMap": {
                "NameFirst": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
                "NameLast": "http://schemas.xmlsoap.org/claims/CommonName",
                "Email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
                "UserName": "nameID",
                "Title": "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                "Defaults":{"TimeZone":"Eastern Standard Time"}
                }
            
            
This shows the minimum set of fields required for an Integrify profile. The Integrify Profile field name is the key and the value should match the 
corresponding attribute name in your SAML assertion.

Here is a full list of available profile fields than may be mapped:

     "fieldMap": {
                  
                    "NetworkID": "yourSamlAttribute...",          
                    "UserName": "yourSamlAttribute...",               
                    "Email": "yourSamlAttribute...",        
                    "NameFirst" : "yourSamlAttribute...",              
                    "NameLast": "yourSamlAttribute...",                
                    "NameMiddle": "yourSamlAttribute...",               
                    "AddressLine1": "yourSamlAttribute...", 
                    "AddressLine2": "yourSamlAttribute...",          
                    "City": "yourSamlAttribute...", 
                    "Postal": "yourSamlAttribute...",             
                    "State": "yourSamlAttribute...",          
                    "Location": "yourSamlAttribute...",            
                    "Country": "yourSamlAttribute...",           
                    "Department": "yourSamlAttribute...",               
                    "Division": "yourSamlAttribute...",        
                    "Phone": "yourSamlAttribute...",                      
                    "Title": "yourSamlAttribute...",              
                    "Custom1": "yourSamlAttribute...", 
                    "Custom2": "yourSamlAttribute...", 

                    
    
                }
                
A user that has never been logged in will have their profile created automatically. Returning users will have their profile updated based on the information passed.
