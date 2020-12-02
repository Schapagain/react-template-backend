
## Clone project and install dependencies
* Run ```git clone http://repos.greatbear.tech/gbt/backend/hello-taxi-backend.git``` to clone project to the local machine
* Change working directory to project root: ```cd hello-taxi-backend```
* Run ```npm install``` to install all dependencies

## Setup environment variables

> Note: You can create a .env file at project root and setup the following variables in that file as an alternative to setting up the environment

* Used by Postgress:
    ```
    PGHOST='localhost'
    PGUSER='hellotaxi'
    PGDATABASE='hello_taxi'
    PGPASSWORD='hello_taxi_123'
    PGPORT='5432'
    ```

* Used by njwt:
    ```
    SECRET_KEY
    ```

## Setup PostgreSQL

* Install PostgreSQL locally
* Create ROLE/USER ``sudo -u postgres createuser -P hellotaxi``
    * Enter and confirm password ``hello_taxi_123`` for the new role
* To verify that the new role has been created, run the following cli commands:
    * ``sudo -u postgres psql`` to login as superuser
    * ``\du`` to list all roles for the database
    * Verify ``hellotaxi`` is one of the roles displayed
    * ``\q`` to quit

* To create a database for our application, and assign ownership to the newly created role ``hellotaxi``, run the following cli commands:
    * ``sudo -u postgres createdb -O hellotaxi hello_taxi``
    
* To verify that the new database, with hellotaxi as its owner, has been created, run these cli commands:
    * ``sudo -u postgres psql`` to login as superuser
    * ``\l`` to list all database with their ownership information
    * Verify that the databse ``hello_taxi`` exists and has ``hellotaxi`` as its owner
    * ``\q`` to quit

## Setup database tables

* All migrations are located at ```/migrations``` at project root
* To create all required tables and insert admin info, run these commands from the command line : <br/>
 ```npx sequelize db:migrate --to 20201123192233-add-login-distributor-association.js```<br/> 
 ```npx sequelize db:migrate```<br/>
 ```npx sequelize db:seed:all```


## Start development server
* In the command line, run : ```npm run dev```


<br/>
<br/>

## Guide to the API Endpoints
<br/>

### Responses and Error Codes
All responses are JSON objects. In cases of failure, an 'error' shall always exist with an appropriate error message. The following are all possible http response types:

|Code|Title|Description|
|-----|-----|-----|
|200|OK|Everything went smoothly!|
|201|Created|Content was posted successfully|
|400|Bad request|At least one required field, or a JWT, was not provided|
|401|Unauthorized|Login credentials mismatch, or JWT invalid|
|404|Not Found|Page, or resource (user, file) not found on the server|
|409|Conflict|A resource with the provided unique identifier (email, phone) already exists|
|500|Internal Server Error|Something unexpected happened! Please report an issue asap|

<br/>

### Authentication

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /api/admin | Admin authentication | POST | Public | password | { token } | password: password77 |
| /api/auth/get_code | Get an OPT code via text | POST | Public | phone | { message } | ----- |
| /api/auth | User authentication | POST | Public | <ins>Either</ins>: email, password <br/> <ins>OR</ins>: phone, code | {{ id, email, role }}, token | ----- |


### Distributor handling
> url prefix: /api/distributors

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /| View all distributors | GET | Admin/Distributor | ----- | [ Distributor ]| ----- |
| / | Add a distributor | POST | Admin/Distributor | <ins>Required</ins>: (pan OR vat), name, country, language, email, phone, street, state, postal, licenseDocument <br/> <ins>Optional</ins>: district, municipality, ward, website, profilePicture | { id, email, name } | A link is sent via email to set a new password <br/><br/> Admin can pass in an optional 'parentId' (defaults to 1) field to add resellers under specefic distributors |
| /signup | Signup as an independent distributor | POST | Public | <ins>Required</ins>: (pan OR vat), name, country, language, email, phone, street, state, postal, licenseDocument <br/> <ins>Optional</ins>: district, municipality, ward, website, profilePicture | { id, email, name } | A link is sent via email to set a new password |
| /:id | View distributor info | GET | Private | ----- | Distributor | ----- |
| /:id | Update distributor info | PATCH | Private | ----- | { id, email, name } | ----- |
| /:id | Delete a distributor | DELETE | Private | ----- | { id, email, name } | ----- |
| /forget_password | Get a password reset link via email | POST | Public | email | { message } | ----- |
| /set_password/:id/:code | Set/Reset password | POST | Public | password | { message } | ----- |

### Driver handling
> url prefix: /api/drivers

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /| View all drivers | GET | Distributor | ----- | [ Driver ]| ----- |
| / | Add a driver | POST | Distributor | <ins>Required</ins>: phone, licenseDocument, name <br/> <ins>Optional</ins>: dob, address, profilePicture | { id , name } | OTP is sent via text |
| /signup | Signup as an independent driver | POST | Public | <ins>Required</ins>: appId , phone, licenseDocument, name <br/> <ins>Optional</ins>: dob, address, profilePicture | { id , name } | OTP is sent via text |
| /:id | View driver info | GET | Private | ----- | Driver | ----- |
| /:id/vehicles | Get assigned vehicle info | GET | Private | ----- | Driver | ----- |
| /:id | Update driver info | PATCH | Private | ----- | { id, name, phone } | ----- |
| /:id | Delete a driver | DELETE | Private | ----- | { id, phone, name } | ----- |

### Vehicle handling
> url prefix: /api/vehicles

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| / | View all vehicles | GET | Distributor | ----- | [ Vehicle ]| ----- |
| / | Add a vehicle | POST | Distributor | <ins>Required</ins>: company, registrationDocument, model, modelYear, licensePlate <br/> <ins>Optional</ins>: chassisNumber, seats, doors, color | { id, model, driverInfo } | ----- |
| /:id | View vehicle info | GET | Distributor | ----- | Vehicle | ----- |
| /:id/drivers | View assigned driver info | GET | Distributor | ----- | Vehicle | ----- |
| /:id | Update vehicle info | PATCH | Distributor | ----- | { id, model, licensePlate, driver, driverInfo } | ----- |
| /:id | Delete a vehicle | DELETE | Distributor | ----- | { id } | ----- |

### User handling
> url prefix: /api/users

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /| View all users | GET | Distributor | ----- | [ User ]| ----- |
| / | Add a user | POST | Distributor | name, phone | { id, name, phone  } | OTP is sent via text |
| /signup | Signup as a user | POST | Public | name, phone, appId | { id, name, phone  } | OTP is sent via text |
| /:id | View user info | GET | Private | ----- | User | ----- |
| /:id | Update user info | PATCH | Private | ----- | { id, name, phone  } | ----- |
| /:id | Delete a user | DELETE | Private | ----- | { id, name, phone } | ----- |


<br/>

> Contacts route is not up to date yet. Working on it.
### Contacts handling

1. Add a contact
    * **Endpoint**: /api/contacts
    * **Method**: POST
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Payload**: 
        * required: { name, email | phone | mobile }
        * optional: { jobPosition, title }
    * **Return**: { message, id, name }

2. View all contacts
    * **Endpoint**: /api/contacts
    * **Method**: GET
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: [ { Contact } ]

3. Get contact info
    * **Endpoint**: /api/contacts/:id
    * **Method**: GET
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**:  { Contact }

4. Update contact info
    * **Endpoint**: /api/contacts/:id
    * **Method**: PATCH
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, id, name }

5. Delete a contact
    * **Endpoint**: /api/contacts/:id
    * **Method**: DELETE
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, title, name }

