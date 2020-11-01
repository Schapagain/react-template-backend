const fs = require('fs');
const path = require('path');
const { v4 : uuid } = require('uuid');

const { DISTRIBUTOR } = require('../../utils/roles');
const { getAuthToken } = require('../../utils/auth');


const Distributor = require('../../models/Distributor');
const Login = require('../../models/Login');

async function postDistributor(distributor) {
    // Remove properties that are not stored in the database
    const documents = distributor.documents;
    const profilePicture = distributor.profilePicture;
    delete distributor.documents;
    delete distributor.profilePicture;

    // Create a unique id for the new distributor
    const id = uuid();
    distributor.id = id;
    try{
        // File path to hold all user documents
        const filePath = path.resolve('.','uploads',id);
        await Promise.all([ 
            Distributor.create(distributor),
            _prepareFileSystem(filePath),
            _saveFiles(filePath, profilePicture, documents),
            _initLogin(id,distributor.email),
        ]);
        const { name, email } = distributor;
        return { id, email, name };
    }catch(err){
        // [TODO] Roll back changes
        console.error(err);
        return false;
    }
}

async function _initLogin(id,email) {
    try{
        //[TODO] send a token that'll let the distributor set a password later
        const role = DISTRIBUTOR
        const token = getAuthToken(id,role);
        console.log('New password reset token:',token);
        await Login.create({id, email, role});
    }catch(err){
        console.log(err);
    }
}

async function _prepareFileSystem(dirPath) {
    try{
        await fs.promises.mkdir(dirPath);
    }catch(err){
        throw err;
    }
}

async function _saveFiles(rootPath, profilePicture, documents) {
        const writeFile = fs.promises.writeFile;
        const readFile = fs.promises.readFile;
        if (profilePicture) {
            const fileStream = await readFile(profilePicture.path);
            const fileName = 'profilePicture'.concat(path.extname(profilePicture.name));
            const profilePicturePath = path.resolve(rootPath,fileName);
            writeFile(profilePicturePath,fileStream);
        }
        documents.forEach( async (document,index) => {
            const fileStream = await readFile(document.path);
            const fileName = 'document'.concat(index,path.extname(document.name));
            const documentPath = path.resolve(rootPath,fileName);
            writeFile(documentPath,fileStream);
        })  
}

async function getDistributor(parent,id) {
    try {
        const result = await Distributor.findOne({where:{parent,id}});
        return result.dataValues;
    }catch(err){
        console.log(err);
    }
}

async function getDistributors(parent) {
    try {
        const result = await Distributor.findAll({where:{parent}})
        return result.map(distributor => {
            const {id, email, name} = distributor
            return {id, email, name}
        });
    }catch(err){
        console.log(err)
    }
}

async function deleteDistributor(parent,id) {

    const result = await Distributor.findOne({where:{parent,id}});
    if (!result) return false;

    deleteFiles(id);
    Distributor.destroy({where:{parent,id}})
    Login.destroy({where:{id}});

    const { email, name } = result;
    return { id, email, name }
}

function deleteFiles(id) {

    const dirPath = path.resolve('.','uploads',id);
    fs.rmdir(dirPath,{recursive:true}, err=> {
        if (err){
            console.log(err)
        }
    });  
}

module.exports = { postDistributor, getDistributor, getDistributors, deleteDistributor };