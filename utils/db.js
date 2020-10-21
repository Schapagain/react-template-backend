const {Pool} = require('pg');
const pool = new Pool();

const newPool = {
    query: (text,params,callback) => {
        return pool.query(text,params,callback);
    },
}

module.exports = newPool;