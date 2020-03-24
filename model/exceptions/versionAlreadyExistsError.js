class VersionAlreadyExistsError extends Error {
    constructor(projectName, version) {
        super(`version ${version} for project ${projectName} already exists`);

        this.projectName = projectName;
        this.version = version;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = VersionAlreadyExistsError;