const app = require('./app');
const db = require('./utils/db');

// Test database connection
db
.authenticate()
.then(() => console.log('Connected to database...'))
.catch(err => console.error('Database connection failed: ', err.message));

// Start the server and listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log('Listening on port',PORT));


