class ValidationError extends Error {
    constructor(field){
        super(`Invalid ${field}`);
        this.field = field;
        this.name = this.constructor.name;
        this.httpCode = 400;
    }
}

class NotUniqueError extends Error {
    constructor(field){
        super(`${field} already exists`);
        this.name = this.constructor.name;
        this.httpCode = 409;
    }
}

class NotFoundError extends Error {
    constructor(resource){
        super(`${resource} not found`);
        this.resource = resource;
        this.name = this.constructor.name;
        this.httpCode = 404;
    }
}

class ServerError extends Error {
    constructor(message){
        super(message? message:"Oops something's wrong with the server. We're working on a fix. ");
        this.name = this.constructor.name;
        this.httpCode = 500;
    }
}

async function getError(err){
    if (err.name){
        switch (err.name) {
            case 'ValidationError':
                return new ValidationError(err.field);
            case 'NotFoundError':
                return new NotFoundError(err.resource);
            case 'SequelizeValidationError':
                return new ValidationError(err.errors[0].path);
            case 'SequelizeUniqueConstraintError':
                return new NotUniqueError(err.errors[0].path);
            case 'SequelizeDatabaseError':
                return new ServerError(err.message);
            default:
                return new ServerError();
        }
    }
    return new ServerError();
}

module.exports = {
    ValidationError,
    NotFoundError,
    getError
}