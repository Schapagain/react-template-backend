const db = require('../../utils/db');
const fs = require('fs');
const util = require('util');
const path = require('path');

const { getFromTable, deleteFromTable, insertIntoTable } = require('./db');
const { DISTRIBUTOR } = require('../../utils/roles');
const { getAuthToken } = require('../../utils/auth');

const postDistributor = async distributor => {

    // Remove properties that are not stored in the database
    const documents = distributor.documents;
    const profilePicture = distributor.profilePicture;
    delete distributor.documents;
    delete distributor.profilePicture;

    try{
        const result = await insertIntoTable('distributors',distributor);
        const { id } = result;
        const email = distributor.email;
        const name = distributor.name;

        // Create a folder to hold user documents
        const filePath = await _prepareFileSystem(id);
        if (!filePath) throw new Error(' Could not setup file system')
        await Promise.all([_saveFiles(filePath, profilePicture, documents),_initLogin(id,distributor.email)]);
        return { id, email, name };
    }catch(err){
        console.log(err);
        return false;
    }
}

const _initLogin = async (id,email) => {
    try{

        // Save initial password as a token that'll let the distributor
        // set a password later
        const role = DISTRIBUTOR
        const token = getAuthToken(id,role);
        token => console.log('New password reset token:',token)();

        await insertIntoTable('login',{id,email,role});
    }catch(err){
        console.log(err);
    }
}

const _prepareFileSystem = async id => {

    const makeDir = util.promisify(fs.mkdir);
    try{
        const dirPath = path.resolve('.','uploads',id);
        await makeDir(dirPath);
        return dirPath;
    }catch(err){
        console.log(err);
        return false
    }

}

const _saveFiles = async (rootPath, profilePicture, documents) => {
        
        // Store received files into the file system
        const writeFile = util.promisify(fs.writeFile);
        const readFile = util.promisify(fs.readFile);

        if (profilePicture) {
            const fileStream = await readFile(profilePicture.path);
            const fileName = 'profilePicture'.concat(path.extname(profilePicture.name));
            const profilePicturePath = path.resolve(rootPath,fileName);
            await writeFile(profilePicturePath,fileStream);
        }

        documents.forEach( async (document,index) => {
            const fileStream = await readFile(document.path);
            const fileName = 'document'.concat(index,path.extname(document.name));
            const documentPath = path.resolve(rootPath,fileName);
            await writeFile(documentPath,fileStream);
        })  

}



const getDistributors = async (distId,getAll) => {
    try {
        // console.log('geeting distributor')
        const result = distId? await getFromTable('distributors',distId) : await getFromTable('distributors');

        const cleanResult = result.map(distributor => {
            const { id, email, name } = distributor;
            return { id, email, name }
        })

        return distId? getAll? result[0]:cleanResult[0]:cleanResult;
    }catch(err){
        console.log(err)
        return false;
    }

}

const deleteDistributor = async id => {
    deleteFiles(id);
    deleteFromTable('login',id);
    const result = await deleteFromTable('distributors',id);
    if (!result) return false;
    const { email, name } = result;
    return { id, email, name }
}

const deleteFiles = id => {

    const dirPath = path.resolve('.','uploads',id);
    fs.rmdir(dirPath,{recursive:true}, err=> {
        if (err){
            console.log(err)
        }
    });

    
}

module.exports = { postDistributor, getDistributors, deleteDistributor };