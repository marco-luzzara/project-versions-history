class AddNewVersionBodyError extends Error {
    constructor(message) {
        super(`model validation for body in /:projectName/versions failed with: ${message}`);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AddNewVersionBodyError;