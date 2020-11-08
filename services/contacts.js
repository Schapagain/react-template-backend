
const { getRandomId } = require('../utils');
const Driver = require('../models/Driver');
const Contact = require('../models/Contact');


function validateNewContact(contact) {
    const { 
        name,
        phone,
        email,
        mobile,
    } = contact;

    if (!name || !(email || phone || mobile) ) return false;
    return true;
}

async function postContact(contact) {

    // [TODO] validation here
    if (!validateNewContact(contact)) throw new Error("Please provide all fields")

    // Create a unique id for the new contact
    contact.id = getRandomId();
    try{
        await Contact.create(contact);
        const { id, name, title } = contact;
        return { id, name, title };
    }catch(err){
        // [TODO] Roll back changes
        console.error(err);
        return false;
    }
}


async function getContacts(distributorId) {
    try {
        const result = await Contact.findAll({where:{distributorId}})
        return result.map(contact => {
            return contact;
        });
    }catch(err){
        console.log(err)
    }
}

async function getContact(distributorId,id) {
    try {
        const result = await Contact.findOne({where:{distributorId,id}});
        return result? result.dataValues : result;
    }catch(err){
        console.log(err);
    }
}


async function deleteContact(distributorId,id) {

    const result = await Contact.findOne({where:{distributorId,id}});
    if (!result) return false;

    Contact.destroy({where:{distributorId,id},force:true})

    const { title, name } = result;
    return { id, title, name }
}

async function disableContact(distributorId,id) {

    const result = await Contact.findOne({where:{distributorId,id}});
    if (!result) return false;

    Contact.destroy({where:{distributorId,id}})

    const { title, name } = result;
    return { id, title, name }
}


async function updateContact(contact) {
    try{
        const { id, distributorId } = contact;
        if (!id || !distributorId) return false;

        let result = await Contact.findOne({where:{distributorId,id}});
        if (!result) return false;

        result = await Contact.update(contact,{where:{id},returning:true,plain:true});
        const { title, name } = result[1].dataValues;
        return {id, title, name}
    }catch(err){
        console.log(err);
        return false;
    }
    
}

module.exports = { postContact, getContacts, getContact, updateContact, disableContact, deleteContact };