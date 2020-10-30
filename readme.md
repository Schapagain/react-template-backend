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

    | Id | email | password | role |
    | ---- | ---- | ---- | ---- |
    <br/>

    __distributors__:

    | Id | name | country | language | email | phone | street | state | postal | district | municipality | ward | website |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>

## Serverside control flow
1. Add a distributor

    1. App routes to routes/api/distributors
    2. formParser adds ```[ documents ]``` and ```profilePicture``` fields to req.body
    3. validateNewDistributor checks for required fields mentioned in API Usage #1
    4. postDistributor service handles everything below:
        1. create a unique ```id``` for the distributor using uuid()
        2. add all non file fields to distributors table
        3. add a new folder named ```id``` as created above to the ```uploads``` directory (See image below for reference)
        4. save profilePicture.xyz as profilePicture.xyz in the ```id``` folder
        5. save documents as document0.xyz, document1.xyz, ... in the ```id``` folder
        6. return { ```id```, ```email```, ```name``` }

    ![alt text1][uploads_directory]
2. Get all distributors

    1. App routes to routes/api/distributors
    2. auth checks for validity of jwt in req.headers.authorization
    3. auth verifies that the token belongs to an admin
    3. getDistributors service returns all registered distributors with their ```id```, ```email``` and ```name```
    
    > Note: To access all fields and files we'll later implement api/distributors/:id/:documentName route

3. Delete a distributor

    1. App routes to routes/api/distributors
    2. auth checks for validity of jwt in req.headers.authorization
    3. auth verifies that the token belongs to an admin
    4. deleteDistributor service handles the following:
        1. Remove directory ```uploads/id```
        2. Remove rows from ```login``` and ```distributors``` with the given ```id```
        3. Return { ```id```, ```email```, ```name```}

4. Set user password

    1. App routes to routes/api/set_password
    2. validateSetPassword middleware checks if the user password is unset
    3. validateNewPassword middleware checks if the password matches a predefined format
    4. updatePassword service patches the relevant row in the database.
    5. Return { ```id``` }

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