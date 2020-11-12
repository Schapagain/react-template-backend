[uploads_directory]: ./doc_images/uploads.png "Uploads directory structure"

## Configuration

1. Setup these environment variables:

    Used by Postgress:
    ```
    PGHOST
    PGUSER
    PGDATABASE
    PGPASSWORD
    PGPORT
    ```

    Used by njwt:
    ```
    SECRET_KEY
    ```

2. Setup these tables in the database:

    __login__:

    | Id | email | password | role | phone |
    | ---- | ---- | ---- | ---- | ---- |
    <br/>

    __distributors__:

    | Id | admin_id | name | country | language | email | phone | street | state | postal | district 
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- 

    | municipality | ward | website | license_document | registration_document | profile_picture |
    | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>
    
    __drivers__:

    | Id | distributor_id | phone | email | password | role | dob | name | license_document |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>

    __vehicles__:

    | Id | distributor_id | driver_id | registration_document | model | license_plate 
    | ---- | ---- | ---- | ---- | ---- | ---- 
    
    | model_year | company | chassis_number | seats | doors | color | created_at | updated_at |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>

    __contacts__:

    | Id | distributor_id | name | job_position | title | email 
    | ---- | ---- | ---- | ---- | ---- | ---- 

    | phone | mobile | created_at | updated_at | deleted_at |
    | ---- | ---- | ---- | ---- | ---- |
    <br/>

    


## API Usage

### Distributor handling

1. Add a distributor
    * **Endpoint**: /api/distributors
    * **Method**: POST
    * **Access**: Public
    * **Payload**:
        * Required: name, country, language, email, phone, street, state, postal, licenseDocument
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