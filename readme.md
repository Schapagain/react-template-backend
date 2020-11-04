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

    | Id | admin_id | name | country | language | email | phone | street | state | postal | district | municipality | ward | website | license_document | registration_document | profile_picture |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>
    
    __drivers__:

    | Id | distributor_id | phone | email | password | role | dob | name | license_document |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>


## Serverside control flow
1. Add a distributor

    1. App routes to routes/api/distributors
    2. formParser adds ```[ documents ]``` and ```profilePicture``` fields to req.body
    3. validateNewDistributor checks for required fields mentioned in API Usage #1
    4. postDistributor service handles everything below:
        1. create a unique ```id``` for the distributor using uuid()
        2. add all non file fields to distributors table
        3. save all files with random names into the ```uploads``` folder
        4. add filenames to their respective fields in the database
        5. return { ```id```, ```email```, ```name``` }

2. Get all distributors

    1. App routes to routes/api/distributors
    2. auth middleware checks for validity of jwt in req.headers.authorization
    3. auth middleware verifies that the token belongs to an admin
    3. getDistributors service returns all registered distributors with their ```id```, ```email``` and ```name```
    
    > Note: To access all fields and files we'll later implement api/distributors/:id/:documentName route

3. Delete a distributor

    1. App routes to routes/api/distributors
    2. auth middleware checks for validity of jwt in req.headers.authorization
    3. auth middleware verifies that the token belongs to an admin
    4. deleteDistributor service handles the following:
        1. Remove all distributor files from the ```uploads``` folder
        2. Remove rows from ```login``` and ```distributors``` with the given ```id```
        3. Return { ```id```, ```email```, ```name```}

4. Set user password

    1. App routes to routes/api/set_password
    2. validateSetPassword middleware checks if the user password is unset
    3. validateNewPassword middleware checks if the password matches a predefined format
    4. updatePassword service patches the relevant row in the database.
    5. Return { ```id``` }

5. Authenticate user

    1. App routes to routes/api/auth
    2. check if the user exists using CRUD operations provided by the db service
    3. check for password match using bcrypt compare
    4. Create a new jwt with id and role injected into it
    5. Return {```user```: { ```id```, ```email```, ```role```}, ```token```}

6. Get distributor info

    1. App routes to routes/api/distributors
    2. auth middleware checks for validity of jwt in req.headers.authorization
    3. auth middleware checks if the user is admin or is accessing their own information
    4. getFiles in the db service reads all files inside ```uploads/id``` and returns file buffers
    5. Return { ```Distributor``` , ```profilePicture```, ```[ documents ]```}

## API Usage

1. Add a distributor
    * **Endpoint**: /api/distributors
    * **Method**: POST
    * **Access**: Public
    * **Payload**:
        * Required: name, country, language, email, phone, street, state, postal, document
        * Optional: district, municipality, ward, website, profilePicture
    * **Return**: Distributor { id, email, name }

2. View all distributors
    * **Endpoint**: /api/distributors
    * **Method**: GET
    * **Access**: Admin
    * **Header**: Authorization: token
    * **Return**: [ Distributor ]

3. Delete a distributor
    * **Endpoint**: /api/distributors
    * **Method**: DELETE
    * **Access**: Admin
    * **Header**: Authorization: token
    * **Return**: [ Distributor ]

4. Set user password
    * **Endpoint**: /api/set_password/:id
    * **Method**: PATCH
    * **Access**: Public
    * **Return**: { id }

5. Authenticate user
    * **Endpoint**: /api/auth
    * **Method**: POST
    * **Access**: Public
    * **Payload**: { email, password }
    * **Return**: { user {id, email, role}, token }

6. Get distributor info
    * **Endpoint**: /api/distributors/:id
    * **Method**: GET
    * **Access**: Private
    * **Header**: Authorization: token
    * **Return**: [ { Distributor, documents, profilePicture } ]

7. Add a driver
    * **Endpoint**: /api/drivers
    * **Method**: POST
    * **Access**: Distributor
    * **Payload**:
        * Required: name, phone, distributorId, licenseDocument
        * Optional: dob, address, profile_picture
    * **Return**: Driver { id, phone, name }

8. View all drivers
    * **Endpoint**: /api/drivers
    * **Method**: GET
    * **Access**: Distributor
    * **Header**: Authorization: token
    * **Return**: [ Driver ]