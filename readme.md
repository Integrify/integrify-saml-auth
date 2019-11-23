### Introduction
This accessory code can be installed into an Integrify instance and configured to allow SSO integration via SAML 2.0 with almost any identity provider (ADFS, OKTA, ping...).  This is a will create a service initiated (your intergify site needs to be auth initiator) implementation with auto provisioning of authenticated users.

_NOTE: Active directory group membership, group provisioning, and manager sync are not within the scope of this client's implementation._

### What do I need?
You will need the following items in order to properly install and configure this SAML 2.0 client into your Integrify installation:

* Administrative access to you Integrify application server
* Ability to run sql scripts against the Integrify consumers tables in the DB
* Your identity provider's signing certificate in base64 format (to verify the SAML asertion when recieved)
* 


### Installation
1.  Select the proper branch in the branch selector on the left:
    * master for Integrify version 7
    * master-6 for Integrify version 6
   
2.  Click the green ***Clone or Download*** button toward the upper-right and then click ***Download ZIP*** from the displayed window.

3.  On your Integrify application server, create a folder named **\_custom** in the **\integrify\app\webserver\app\\** directory if it does not already exist.

4.  Move the downloaded zip file to the **\integrify\app\webserver\app\_custom\\** folder and unzip it.

5.  Open an administrative command prompt on the server, and ***cd*** (change directory) to the **\integrify\app\webserver\app\_custom\integrify\saml-auth-master\\** directory

6.  Run the following command: `npm install`

7.  Copy the **samlauth.yml** file from the **\integrify\app\webserver\app\_custom\integrify\saml-auth-master\\** directory to the **\integrify\app\webserver\app\data\routes\\** directory

### Configuration

To configure:

* Download and unzip this folder. Save it under webserver/app/_custom in your Integrify installation.
* from a command prompt in this folder run the command "npm install"
* Obtain signing certificate in base64 format if required to verify the SAML asertion sent from your IDP and copy it to this folder
* Copy the config.saml.js, config-adfs.js or config-openid.js (example configs) file to a file named config.js in this folder
* Edit config.js based on the requirements specified by your IDP and your Integrify instance settings. Note, you will need a Consumer_Key with API access with Impersonation enabled. See your OAUTH_CONSUMERS table.
* Copy the samlauth.yml file to  /webserver/app/data/routes
* Copy the auth-config-yourhost-yourport.yml file to the root /webserver. Edit the contents of this file and replace myapikey in the iurl property to a valid API key for your instance.
Rename the file replacing yourhost with the host name of the Integrify server. If running on a port other than 80 or 443, replace -yourport with the port the Integrify server is listening on.
If Integrify is running on port 80 or por 443, remove the -yourport section from the file name.
* restart your Integrify isntance
* browse to http(s)://{integrify server}/samlauth/{app_key}/status to verify that the module has loaded
* browse to http(s)://{integrify server}/samlauth/{app_key}/metadata to get the XML metadata that describes this service including the Assertion Consumer Service URL and Identifier


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
