const app = require('./app');
const { sequelize } = require('./database/models');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Test database connection
sequelize
.authenticate()
.then(() => console.log('Connected to database...'))
.catch(err => console.error('Database connection failed: ', err.message));

// [TODO] Socket stuff to refactor later
io.on("connection", socket => {
    console.log('connected to socket',socket.id);

    socket.on('post-location', ({x,y,timeStamp}) => {
        console.log('got new location',x,y);

        const driverName = 'Tim';
        const licensePlate = 'NYV4ST8';

        socket.broadcast.emit('update-location',{driverName,licensePlate,x,y,timeStamp})
    })
})

// Start the server and listen on port
const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log('Listening on port',PORT));