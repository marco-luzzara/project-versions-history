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

        let versions = this.getProjectData(projectName).versions;
        let resContent = `
            <html>
                <body>
                    <h3>${projectName}</h3>`
        resContent += `Select the version to display: <select id="versionFilter">`
        versions.filter(elem => version === undefined || elem.version === version)
            .forEach((details, index) => {
                if (index == 0) {
                    resContent += `<option value=${details.version} selected>${details.version}</option>`;
                }
                else {
                    resContent += `<option value=${details.version}>${details.version}</option>`;
                }
            })
        resContent += `</select>
                    <ul>`;

        if (versions.length > 20) {
            versions = versions.slice(0, 20);
        }

        versions.filter(elem => version === undefined || elem.version === version)
            .forEach((details, index) => {
                if (index == 0) {
                    resContent += `<li id="${details.version}">Version ${details.version}</li>`;
                    resContent += `<ul id="tasks${details.version}">`
                    details.tasks.forEach((task) => {
                        resContent += `<li><a href='https://redmine.aliaslab.net/issues/${task.id}'>Task ${task.id}</a></li>`;
                        resContent += `<ul>`;
                        task.messages.forEach((msg, index) => {
                            resContent += `<li>${msg}</li>`
                        })
                        resContent += `</ul>`;
                    })
                    resContent += `</ul>`;
                }
                else {
                    resContent += `<li id="${details.version}" style="display:none">Version ${details.version}</li>`;
                    resContent += `<ul id="tasks${details.version}" style="display:none">`
                    details.tasks.forEach((task) => {
                        resContent += `<li><a href='https://redmine.aliaslab.net/issues/${task.id}' style="display:none">Task ${task.id}</a></li>`;
                        resContent += `<ul style="display:none">`;
                        task.messages.forEach((msg, index) => {
                            resContent += `<li style="display:none">${msg}</li>`
                        })
                        resContent += `</ul>`;
                    })
                    resContent += `</ul>`;
                }
            });
        resContent += `
                    </ul>
                    <script>
                    var lastSelected = document.getElementById("versionFilter").value;
            
                    function modifyChildDisplay(element,value){
                        if(element.tagName == "UL" && value == "list-item")
                            element.style.display = "block";
                        else
                            element.style.display = value;
                        if(element.hasChildNodes()){
                            var elementChildren = [...element.children];
                            elementChildren.forEach((child) => {modifyChildDisplay(child,value)});
                        }
                    }
            
                    document.getElementById("versionFilter").addEventListener('change',() => {
                        const selectedVal = document.getElementById("versionFilter").value;
                        document.getElementById(lastSelected).style.display = "none";
                        var lastSelectedTasks = document.getElementById("tasks"+lastSelected)
                        modifyChildDisplay(lastSelectedTasks,"none");
                        
                        document.getElementById(selectedVal).style.display = "list-item";
                        var selectedTasks = document.getElementById("tasks"+selectedVal);
                        modifyChildDisplay(selectedTasks,"list-item");
            
                        lastSelected = selectedVal;
                    })
                    </script></body></html>`;

        return resContent;
    }
}

let versionHistory = new VersionHistory(PROJECTS_FOLDER);

module.exports = versionHistory;