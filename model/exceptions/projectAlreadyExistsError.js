class ProjectAlreadyExistsError extends Error {
    constructor(projectName) {
        super(`project ${projectName} already exists`);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ProjectAlreadyExistsError;