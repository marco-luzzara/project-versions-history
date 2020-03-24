class MissingVersionError extends Error {
    constructor(projectName, version) {
        super(`${version} does not exist in project ${projectName}`);

        this.projectName = projectName;
        this.version = version;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MissingVersionError;