class MissingProjectError extends Error {
    constructor(projectName) {
        super(`${projectName} does not exist`);

        this.projectName = projectName;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MissingProjectError;