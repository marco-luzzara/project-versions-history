const fs = require('fs');

const PROJECTS_FOLDER = 'projects';

class VersionHistory {
    constructor(projectsFolder) {
        this.projectsFolder = projectsFolder;
        this.repoVersions = new Map();

        fs.readdirSync(this.projectsFolder).forEach(project => {
            let rawdata = fs.readFileSync(`${this.projectsFolder}/${project}`);
            
            let projectName = project.substring(0, project.lastIndexOf('.'));
            this.repoVersions.set(projectName, JSON.parse(rawdata));
        });
    }

    get projectNames() {
        return Array.from(this.repoVersions.keys());
    }

    doesProjectExist(projectName) {
        return this.repoVersions.has(projectName);
    }

    doesVersionExist(projectName, version) {
        if (!this.doesProjectExist(projectName))
            return false;

        return this.getProjectData(projectName).versions.some(versionData => versionData.version === version)
    }

    getProjectData(projectName) {
        if (!this.doesProjectExist(projectName))
            return null;

        return this.repoVersions.get(projectName);
    }

    getProjectLastVersion(projectName) {
        let projectData = this.getProjectData(projectName);
        if (projectData === null || projectData.versions[0] === undefined)
            return null;

        return projectData.versions[0].version;
    }

    addNewProject(projectName) {
        if (this.doesProjectExist(projectName))
            return;
        
        let content = `
        {
            "versions": []
        }`;
        let jsonContent = JSON.parse(content);

        fs.writeFileSync(`./${PROJECTS_FOLDER}/${projectName}.json`, content);
        this.repoVersions.set(projectName, jsonContent);
    }

    addNewVersion(projectName, versionJsonData) {
        if (!this.doesProjectExist(projectName)) {
            this.addNewProject(projectName);
            this.addNewVersion(projectName, versionJsonData);

            return;
        }

        if (this.doesVersionExist(projectName, versionJsonData.version))
            throw "Version already present";

        let projectData = this.getProjectData(projectName);
        projectData.versions.unshift(versionJsonData);

        let content = JSON.stringify(projectData);
        fs.writeFileSync(`./${PROJECTS_FOLDER}/${projectName}.json`, content);
    }

    viewHtmlForProject(projectName, version) {
        if (!this.doesProjectExist(projectName))
            throw "Project does not exist";

        let resContent = `
            <html>
                <body>
                    <h3>${projectName}</h3>
                    <ul>`;
        
        this.getProjectData(projectName).versions
            .filter(elem => version === undefined || elem.version === version)
            .forEach(elem => {
                resContent += `
                        <li>Version ${elem.version}</li>
                            <ul>`;
                elem.tasks.forEach(task => {
                    resContent += `
                                <li>
                                    <a href='https://redmine.aliaslab.net/issues/${task.id}'>Task ${task.id}</a>
                                    <ul>`;
                    task.messages.forEach(msg => {
                        resContent += ` <li>${msg}</li>`;
                    });

                    resContent += `
                                    </ul>
                                </li>`;
                });
                resContent += `
                            </ul>`;
            });

        resContent += `
                    </ul>
                </body>
            </html>`;

        return resContent;
    }
}

let versionHistory = new VersionHistory(PROJECTS_FOLDER);

module.exports = versionHistory;