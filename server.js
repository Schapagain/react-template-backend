const app = require('./app');
const { sequelize } = require('./models/index');

// Test database connection
sequelize
.authenticate()
.then(() => console.log('Connected to database...'))
.catch(err => console.error('Database connection failed: ', err.message));

// Start the server and listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log('Listening on port',PORT));


