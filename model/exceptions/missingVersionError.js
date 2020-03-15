class MissingVersionError extends Error {
    constructor(projectName, version) {
        super(`${version} does not exist in project ${projectName}`);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MissingVersionError;