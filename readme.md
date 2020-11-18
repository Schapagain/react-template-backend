
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
|400|Bad request|At least one required field, or a JWT, was not provided, or a wrong data type was sent|
|401|Unauthorized|Login credentials mismatch, or JWT invalid|
|404|Not Found|Page, or resource (user, file) not found on the server|
|409|Conflict|A resource with the provided unique identifier (email, phone) already exists|
|500|Internal Server Error|Something unexpected happened! Please report an issue asap|

<br/>

### Authentication
1. Admin authentication
    * **Endpoint**: /api/admin
    * **Method**: POST
    * **Access**: Public
    * **Payload**: { email, password }
    * **Return**: { token }

2. User authentication
    * **Endpoint**: /api/auth
    * **Method**: POST
    * **Access**: Public
    * **Payload**: { email, password } || { phone, code } **for code see 3. below**
    * **Return**: { { id, email, role }, token }

3. Get a OTP code
    * **Endpoint**: /api/auth/get_code
    * **Method**: POST
    * **Access**: Public
    * **Payload**: { phone }
    * **Return**: { message, code }

### Distributor handling

1. Add a distributor
    * **Endpoint**: /api/distributors
    * **Method**: POST
    * **Access**: Public
    * **Payload**:
        * Required: adminId, (pan || vat), name, country, language, email, phone, street, state, postal, licenseDocument
        * Optional: district, municipality, ward, website, profilePicture
    * **Return**: { message, id, email, name, moreInfo }

2. Set distributor password
    * **Endpoint**: /api/set_password/:token
    * **Method**: PATCh
    * **Access**: Public
    * **Return**: { message }

3. View all distributors
    * **Endpoint**: /api/distributors
    * **Method**: GET
    * **Access**: Admin/distributor
    * **Header**: Authorization: token
    * **Return**: [ Distributor ]

4. Get distributor info
    * **Endpoint**: /api/distributors/:id
    * **Method**: GET
    * **Access**: Private
    * **Header**: Authorization: token
    * **Return**: [ { Distributor, documents, profilePicture } ]

5. Update distributor info
    * **Endpoint**: /api/distributors/:id
    * **Method**: PATCH
    * **Access**: Private
    * **Header**: Authorization: token
    * **Return**: { message, id, email, name, moreInfo }

6. Delete a distributor
    * **Endpoint**: /api/distributors/:id
    * **Method**: DELETE
    * **Access**: Admin/distributor
    * **Header**: Authorization: token
    * **Return**: { message, id, email, name }

### Driver handling

1. Add a driver
    * **Endpoint**: /api/drivers/
    * **Method**: POST
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Payload**: 
        * required: { phone, licenseDocument, name }
        * optional: { dob, address, profilePicture }
    * **Return**: { message, id, name, moreInfo }

2. View all drivers
    * **Endpoint**: /api/drivers
    * **Method**: GET
    * **Access**: Distributor
    * **Header**: Authorization: token
    * **Return**: [ Driver ]

3. Get driver info
    * **Endpoint**: /api/drivers/:id
    * **Method**: GET
    * **Access**: Private
    * **Header**: Authorization: token
    * **Return**:  { Driver }

4. Update driver info
    * **Endpoint**: /api/drivers/:id
    * **Method**: PATCH
    * **Access**: Private
    * **Header**: Authorization: token
    * **Return**: { message, id, name, phone, moreInfo }

5. Delete a driver
    * **Endpoint**: /api/drivers/:id
    * **Method**: DELETE
    * **Access**: Admin/distributor
    * **Header**: Authorization: token
    * **Return**: { message, id, email, name }

### Vehicle handling

1. Add a vehicle
    * **Endpoint**: /api/vehicles/
    * **Method**: POST
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Payload**: 
        * required: { company, registrationDocument, model, modelYear, licensePlate }
        * optional: { chassisNumber, seats, doors, color }
    * **Return**: { message, id, model, driverInfo, moreInfo }

2. View all vehicles
    * **Endpoint**: /api/vehicles
    * **Method**: GET
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: [ { id, model, licensePlate, driverInfo, moreInfo } ]

3. Get vehicle info
    * **Endpoint**: /api/vehicles/:id
    * **Method**: GET
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**:  { Vehicle }

4. Update vehicle info
    * **Endpoint**: /api/vehicles/:id
    * **Method**: PATCH
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, id, model, licensePlate, driver, driverInfo, moreInfo }

5. Delete a vehicle
    * **Endpoint**: /api/vehicles/:id
    * **Method**: DELETE
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, id }

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

### User handling

1. Add a user
    * **Endpoint**: /api/users
    * **Method**: POST
    * **Access**: Public
    * **Payload**: 
        * required: { name, phone, password, distributorId }
        * optional: { email, profilePicture,  }
    * **Return**: { message, id, name, phone, moreInfo }

2. View all users
    * **Endpoint**: /api/users
    * **Method**: GET
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: [ { User } ]

3. Get user info
    * **Endpoint**: /api/users/:id
    * **Method**: GET
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**:  { User }

4. Update user info
    * **Endpoint**: /api/users/:id
    * **Method**: PATCH
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, id, name, phone, moreInfo }

5. Delete a user
    * **Endpoint**: /api/users/:id
    * **Method**: DELETE
    * **Access**: distributor
    * **Header**: Authorization: token
    * **Return**: { message, id, name, phone }