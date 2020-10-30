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

    __distributors__:

    | Id | name | country | language | email | phone | street | state | postal | district | municipality | ward | website |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    <br/>
    __distributors_login__:

    | Id | email | password |
    | ---- | ---- | ---- |
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
        6. return { ```id```, ```name``` }

    ![alt text1][uploads_directory]
2. Get all distributors

    1. App routes to routes/api/distributors
    2. auth checks for validity of jwt in req.headers.authorization
    3. getDistributors service returns all registered distributors along with their non-file fields
    
    > Note: To access files we'll later implement api/distributors/:id/:documentName route

## API Usage

1. Add a distributor
    * **Endpoint**: /api/distributors
    * **Method**: POST
    * **Payload**:
        * Required: name, country, language, email, phone, street, state, postal, document
        * Optional: district, municipality, ward, website, profilePicture
    * **Return**: Distributor { id, name }

2. View all distributors
    * **Endpoint**: /api/distributors
    * **Method**: GET
    * **Return**: [ Distributor ]