const db = require('../../utils/db');
const { v4 : uuid } = require('uuid');
const fs = require('fs');
const util = require('util');

const postDistributor = async distributor => {

    // Remove properties that are not stored in the database
    const documents = distributor.documents;
    const profilePicture = distributor.profilePicture;
    delete distributor.documents;
    delete distributor.profilePicture;

    // Add unique userId
    const uniqueId = uuid();
    distributor.id = uniqueId;

    // Extract information to be saved into the databse
    const keys = Object.keys(distributor).join(',');
    const values = Object.values(distributor);
    const queryPlaceholders = Object.keys(values).map(key => '$'.concat(Number(key)+1)).join(',');

    const queryString = 
    `INSERT INTO distributors (${keys}) VALUES (${queryPlaceholders}) RETURNING *`
    const queryValues = values;

    try{
        const result = await db.query(queryString,queryValues);
        const { id, name } = result.rows[0]
        
        // Create a folder to hold user documents
        const filePath = await prepareFileSystem(id);
        if (!filePath) throw new Error(' Could not setup file system')
        await saveFiles(filePath, profilePicture, documents);
        return { id, name };
    }catch(err){
        console.log(err);
        return false;
    }
    
}

const prepareFileSystem = async id => {

    const makeDir = util.promisify(fs.mkdir);
    try{
        const path = './uploads/'.concat(id,'/');
        await makeDir(path);
        return path;
    }catch(err){
        console.log(err);
        return false
    }

}

const saveFiles = async (rootPath, profilePicture, documents) => {
        
        // Store received files into the file system
        const writeFile = util.promisify(fs.writeFile);
        const readFile = util.promisify(fs.readFile);

        if (profilePicture) {
            const fileStream = await readFile(profilePicture.path);
            const profilePicturePath = rootPath.concat('profilePicture.',profilePicture.type.split('/').pop());
            await writeFile(profilePicturePath,fileStream);
        }

        documents.forEach( async (document,index) => {
            const fileStream = await readFile(document.path);
            const documentPath = rootPath.concat('document',index,'.',document.type.split('/').pop());
            await writeFile(documentPath,fileStream);
        })  

}

const getDistributors = async () => {

    const queryString = 'SELECT * FROM distributors';
    try {
        const result = await db.query(queryString);
        return result.rows;
    }catch(err){
        console.log(err)
        return false;
    }

}

module.exports = {postDistributor, getDistributors};