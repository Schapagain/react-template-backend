
const { Contact } = require('../database/models');
const { getError, NotFoundError, ValidationError } = require('../utils/errors');

async function postContact(contact) {
    try{
        await Contact.create(contact);
        const { id, name, title } = contact;
        return { id, name, title };
    }catch(err){
       throw await getError(err); 
    }
}


async function getContacts(distributorId) {
    try {
        const result = await Contact.findAll({where:{distributorId}})
        return result.map(contact => {
            return contact;
        });
    }catch(err){
        throw await getError(err);
    }
}

async function getContact(distributorId,id) {
    try {
        const result = await Contact.findOne({where:{distributorId,id}});
        return result? result.dataValues : result;
    }catch(err){
        throw await getError(err);
    }
}


async function deleteContact(distributorId,id) {

    try{
        const result = await Contact.findOne({where:{distributorId,id}});
        if (!result) 
            throw new NotFoundError('contact')
        Contact.destroy({where:{distributorId,id},force:true})
        const { title, name } = result;
        return { id, title, name }
    }catch(err){
        throw await getError(err);
    }
   
}

async function disableContact(distributorId,id) {

    try{
        const result = await Contact.findOne({where:{distributorId,id}});
        if (!result) return false;
        Contact.destroy({where:{distributorId,id}})
        const { title, name } = result;
        return { id, title, name }
    }catch(err){
        throw await getError(err);
    }
    
}


async function updateContact(contact) {
    try{
        const { id, distributorId } = contact;
        if (!id || !distributorId) 
            throw new ValidationError('id/distributorId')

        let result = await Contact.findOne({where:{distributorId,id}});
        if (!result) 
            throw new NotFoundError('contact')

        result = await Contact.update(contact,{where:{id},returning:true,plain:true});
        const { title, name } = result[1].dataValues;
        return {id, title, name}
    }catch(err){
        throw await getError(err);
    }
    
}

module.exports = { postContact, getContacts, getContact, updateContact, disableContact, deleteContact };