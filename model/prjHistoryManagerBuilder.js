const fs = require('fs');
const path = require('path');

const csvUtils = require("../utils/csvUtils")
const PrjHistoryManager = require("./prjHistoryManager");

class PrjHistoryManagerBuilder {
    constructor(projectsFolder) {
        this.projectsLastVersion = new Map();
        this.projectsFolder = projectsFolder;   
        this.projectsVersionsList = new Map(); 
    }

    _validateProjectName(projectName) {
        try {
            if (typeof(projectName) !== 'string' || projectName === "")
                throw new Error(`${projectName} is not valid, must be string and non empty`);

            return projectName;
        }
        catch (exc) {
            console.log(exc.message);
            throw exc;
        }
    }

    _validateJsonProjectHistory(projectHistory) {
        try {
            if (typeof(projectHistory) === 'string')
                projectHistory = JSON.parse(projectHistory);

            return projectHistory;
        }
        catch (exc) {
            console.log(`could not parse provided json: ${projectHistory}`);
            throw exc;
        }
    }

    /**
     * @param {string} projectName
     * @augments {object} projectHistory
     */
    fromJson(projectName, projectHistory){
        projectName = this._validateProjectName(projectName);

        let content = csvUtils.jsonToCsvSync(projectHistory);
        fs.writeFileSync(path.join(this.projectsFolder, projectName + ".csv"), content);

        this.projectsLastVersion.set(projectName, projectHistory[0].version);
        this.projectsVersionsList.set(projectName, new Set(projectHistory.map(vh => vh.version)));

        return this;
    }

    fromFolderPath() {
        fs.readdirSync(this.projectsFolder).forEach(project => {
            let projectName = project.substring(0, project.lastIndexOf('.'));
            projectName = this._validateProjectName(projectName);

            let rawdata = fs.readFileSync(path.join(this.projectsFolder, project));
            let projectHistory = csvUtils.csvToJsonSync(rawdata);

            this.projectsLastVersion.set(projectName, projectHistory[0].version);
            this.projectsVersionsList.set(projectName, new Set(projectHistory.map(vh => vh.version)));
        });

        return this;
    }

    build() {
        return new PrjHistoryManager(this.projectsFolder, this.projectsLastVersion, this.projectsVersionsList);
    }
}

module.exports = PrjHistoryManagerBuilder;