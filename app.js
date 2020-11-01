
const express = require('express');
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable Cross Origin Sharing for everyone
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','*');

    // Handle initial OPTIONS request
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});


// Route to API
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/distributors',require('./routes/api/distributors'));
app.use('/api/admin',require('./routes/api/admin'));
app.use('/api/set_password',require('./routes/api/setPassword'));
app.use('/api/files',require('./routes/api/files'));

// Forward invalid routes to the error handler below
app.use((req,res,next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

// Handle all errors thrown
app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error: error.message,
    });
});

module.exports = app;