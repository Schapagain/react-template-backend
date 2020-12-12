
const express = require('express');
const app = express();

// Log HTTP requests
const morgan = require('morgan');
app.use(morgan('dev'));

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
app.use('/api/drivers',require('./routes/api/drivers'));
app.use('/api/vehicles',require('./routes/api/vehicles'));
app.use('/api/contacts',require('./routes/api/contacts'));
app.use('/api/users',require('./routes/api/users'));

app.use('/api/countries',require('./routes/api/countries'));
app.use('/api/states',require('./routes/api/states'));
app.use('/api/districts',require('./routes/api/districts'));
app.use('/api/municipalities',require('./routes/api/municipalities'));
app.use('/api/localities',require('./routes/api/localities'));
app.use('/api/wards',require('./routes/api/wards'));

app.use('/api/packages',require('./routes/api/packages'));
app.use('/api/subscriptions',require('./routes/api/subscriptions'));


app.use('/api/vehicle_brands',require('./routes/api/vehicleBrands'));
app.use('/api/vehicle_models',require('./routes/api/vehicleModels'));


// Forward invalid routes to the error handler below
app.use((req,res,next) => {
    const error = new Error('Page Not found');
    error.status = 404;
    next(error);
})

// Handle all errors thrown
app.use((err,req,res,next) => {
    res.status(err.httpCode || 500 ).json({ error: err.message || 'Server error' })
});

module.exports = app;