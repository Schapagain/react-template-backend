
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
* Used for admin auth:
    ```
    ADMIN_EMAIL='admin@admin.com'
    ADMIN_PASSWORD='password77'
    ADMIN_ID='123'
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
* To create all required tables, simply run : ```npx sequelize db:migrate```

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
| /api/admin | Admin authentication | POST | Public | email, password | { token } | ----- |
| /api/auth/get_code | Get an OPT code via text | POST | Public | phone | { message } | ----- |
| /api/auth | User authentication | POST | Public | <ins>Either</ins>: email, password <br/> <ins>OR</ins>: phone, code | {{ id, email, role }}, token | ----- |


### Distributor handling

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /api/distributors| View all distributors | GET | Admin/Distributor | ----- | [ Distributor ]| ----- |
| /api/distributors | Add a distributor | POST | Public | <ins>Required</ins>: adminId, (pan OR vat), name, country, language, email, phone, street, state, postal, licenseDocument <br/> <ins>Optional</ins>: district, municipality, ward, website, profilePicture | { message, id, email, name, moreInfo } | A link is sent via email to set a new password |
| /api/distributors/:id | View distributor info | GET | Private | ----- | Distributor | ----- |
| /api/distributors/:id | Update distributor info | PATCH | Private | ----- | { message, id, email, name, moreInfo } | ----- |
| /api/distributors/:id | Delete a distributor | DELETE | Private | ----- | { message, id, email, name } | ----- |
| /api/distributors/forget_password | Get a password reset link via email | POST | Public | email | { message } | ----- |
| /api/distributors/set_password/:id/:code | Set/Reset password | POST | Public | password | { message } | ----- |

### Driver handling

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /api/drivers| View all drivers | GET | Distributor | ----- | [ Driver ]| ----- |
| /api/drivers | Add a driver | POST | Distributor | <ins>Required</ins>: phone, licenseDocument, name <br/> <ins>Optional</ins>: dob, address, profilePicture | { message, id , name, moreInfo } | ----- |
| /api/drivers/:id | View driver info | GET | Private | ----- | Driver | ----- |
| /api/drivers/:id | Update driver info | PATCH | Private | ----- | { message, id, name, phone, moreInfo } | ----- |
| /api/drivers/:id | Delete a driver | DELETE | Private | ----- | { message, id, phone, name } | ----- |

### Vehicle handling


|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /api/vehicles| View all vehicles | GET | Distributor | ----- | [ Vehicle ]| ----- |
| /api/vehicles | Add a vehicle | POST | Distributor | <ins>Required</ins>: company, registrationDocument, model, modelYear, licensePlate <br/> <ins>Optional</ins>: chassisNumber, seats, doors, color | { message, id, model, driverInfo, moreInfo } | ----- |
| /api/vehicles/:id | View vehicle info | GET | Distributor | ----- | Vehicle | ----- |
| /api/vehicles/:id | Update vehicle info | PATCH | Distributor | ----- | { message, id, model, licensePlate, driver, driverInfo, moreInfo } | ----- |
| /api/vehicles/:id | Delete a vehicle | DELETE | Distributor | ----- | { message, id } | ----- |

### User handling

|Endpoint|Desc|Method|Access|Payload|Return|Notes|
|-----|-----|-----|-----|-----|-----|-----|
| /api/users| View all users | GET | Distributor | ----- | [ User ]| ----- |
| /api/users | Add a user | POST | Public | name, phone, distributorId | { message, id, name, phone , moreInfo } | Account activation link is sent via text |
| /api/users/:id | View user info | GET | Private | ----- | User | ----- |
| /api/users/:id | Update user info | PATCH | Private | ----- | { message, id, name, phone , moreInfo } | ----- |
| /api/users/:id | Delete a user | DELETE | Private | ----- | { message, id, name, phone } | ----- |


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
    * **Return**: { message, id, name, moreInfo }

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
    * **Return**: { message, id, name, moreInfo }

5. Delete a contact
    * **Endpoint**: /api/contacts/:id
    * **Method**: DELETE
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, title, name }

