class ProjectAlreadyExistsError extends Error {
    constructor(projectName) {
        super(`project ${projectName} already exists`);

        this.projectName = projectName;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ProjectAlreadyExistsError;