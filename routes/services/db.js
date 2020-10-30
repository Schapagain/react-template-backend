const db = require('../../utils/db');
const { v4 : uuid } = require('uuid');
const fs = require('fs');
const util = require('util');

const insertIntoTable = async (table,data) => {

    // Add unique id if not provided
    if(!data.id) data.id = uuid();

    // Extract information to be saved into the database
    const keys = Object.keys(data).join(',');
    const values = Object.values(data);
    const queryPlaceholders = Object.keys(values).map(key => '$'.concat(Number(key)+1)).join(',');

    const queryString = 
    `INSERT INTO ${table} (${keys}) VALUES (${queryPlaceholders}) RETURNING *`
    const queryValues = values;

    try{
        const result = await db.query(queryString,queryValues);
        const { id } = result.rows[0]
        return { id };
    }catch(err){
        console.log(err);
        return false;
    }
    
}



const getFromTable = async (table,id) => {

    const queryPrefix = `SELECT * FROM ${table}`;
    const queryString = id? queryPrefix.concat('WHERE id=$1'):queryPrefix;
    const queryValues = id? [id]:[];
    try {
        const result = await db.query(queryString,queryValues);
        return result.rows;
    }catch(err){
        console.log(err)
        return false;
    }

}

const deleteFromTable = async (table,id) => {
    
    if (!id) return false;

    const queryString = `DELETE from ${table} where id=$1 RETURNING *`;
    const queryValues = [id];

    try{
        const result = await db.query(queryString,queryValues);
        return result.rows[0];
    }catch(err){
        console.log(err);
        return false;
    }
}

const updateTable = async (table,data) => {
    try{
 
        if (!data || !table || !data.id) return false;

        // Extract id and remove it from the object
        const id = data.id;
        delete data.id;

        const propsToUpdate = Object.keys(data);
        const valuesToUpdate = Object.values(data);

        if (propsToUpdate.length < 1) {
            return false;
        }

        // Create a string of the format: prop1=$2, prop2=$3,...
        for (let i = 0; i < propsToUpdate.length; i++){
            propsToUpdate[i] = propsToUpdate[i].concat('=$',i+2);
        }
        const propsString = propsToUpdate.join(', ');

        const queryString = "update ".concat(table,' set ',propsString,' WHERE id=$1 RETURNING *');
        const queryValues = [id,...valuesToUpdate];
        const result = await db.query(queryString,queryValues);
        if (!result || !result.rowCount){
            return false;
        }else{
            return { id: result.rows[0].id };
        }
    }
    catch (err) {
        console.log(err);
        return false;
    };
}

module.exports = { getFromTable, updateTable, deleteFromTable, insertIntoTable };