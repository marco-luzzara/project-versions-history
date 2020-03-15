class VersionAlreadyExistsError extends Error {
    constructor(projectName, version) {
        super(`version ${version} for project ${projectName} already exists`);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = VersionAlreadyExistsError;