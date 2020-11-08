const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const formParser = require('../../middlewares/formParser');
const { postContact, disableContact, getContact, updateContact, getContacts } = require('../../services/contacts');
const path = require('path');

// @route   POST api/contacts
// @desc    Add a new contact
// @access  distributor
router.post('/', 
    auth,
    formParser,
    async (req, res) => {
        try{
            const contact = req.body;
            const distributorId = req.body.id;
            let result = await postContact({...contact,distributorId});
            if (!result) throw new Error();

            result = {
                message: 'Contact added successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','contacts',result.id)
            }
            res.status(201).json(result)
        }catch(err){
            res.status(500).json({error:err.message})
        }
    });

// @route   GET api/contacts/:id
// @desc    Get contact info
// @access  Private
router.get('/:id', 
auth,
async (req,res) => {
    try{
        const distributorId = req.body.id;
        const id = req.params.id;
        if(!id) return res.json({error:'No id found'})

        const result = await getContact(distributorId,id);
        if(!result) return res.json({error:'No contact found'})

        res.status(200).json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Could not fetch contact"})
    }
}
);

// @route   GET api/contacts
// @desc    View all contacts
// @access  distributor
router.get('/', 
    auth,
    async (req,res) => {
        try{
            const distributorId = req.body.id;
            let result = await getContacts(distributorId);
            if(!result) throw new Error();
            res.status(200).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not fetch contacts"})
        }
    }
);

// @route   DELETE api/contact/:id
// @desc    delete a contact
// @access  Private
router.delete('/:id', 
    auth,
    async (req,res) => {
        try{
            const distributorId = req.body.id;
            const id = req.params.id;
            let result = await disableContact(distributorId,id);
            if(!result) {
                return res.status(400).json({
                    error: "Contact not found"
                })
            };
            result ={
                message: 'Contact deleted successfully',
                ...result,
            }
            const { message, title, name, } = result;
            res.status(200).json({ message, title, name });
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not delete contact. Try again later"})
        }
    }
);

// @route   PATCH api/contacts/:id
// @desc    Update contact info
// @access  Private
router.patch('/:id', 
    auth,
    formParser,
    async (req,res) => {
        try{
            const distributorId = req.body.id;
            const id = req.params.id;
            if(!id) return res.json({error:'No id found'})

            // Get info from database
            let result = await updateContact({distributorId,...req.body,id});
            if(!result) return res.json({error:'No contact found'})
            result = {
                'message' : 'Contact updated successfully',
                ...result,
                'moreInfo:': path.join(req.get('host'),'api','contacts',result.id)
            }
            res.status(201).json(result);
        }catch(err){
            console.log(err);
            res.status(500).json({error:"Could not update contact"})
        }
    }
);

module.exports = router;