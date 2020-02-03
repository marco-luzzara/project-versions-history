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

    _saveProjectData(projectName, data) {
        let content = JSON.stringify(data);
        fs.writeFileSync(`./${PROJECTS_FOLDER}/${projectName}.json`, content);
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

        this._saveProjectData(projectName, projectData);
    }

    deleteVersion(projectName, version) {
        if (!this.doesVersionExist(projectName, version))
            throw "Project or version does not exist";
        
        let projectData = this.getProjectData(projectName);
        let versionEntryIndex = projectData.versions.findIndex(vEntry => vEntry.version === version);
        
        projectData.versions.splice(versionEntryIndex, 1);

        this._saveProjectData(projectName, projectData);
    }

    viewHtmlForProject(projectName) {
        if (!this.doesProjectExist(projectName))
            throw "Project does not exist";

        let versions = this.getProjectData(projectName).versions;
        let whitespaceCSS = "\\00a0";

        let resContent = `
            <html>
                <head>
                    <script
                        src="https://code.jquery.com/jquery-3.4.1.min.js"
                        integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
                        crossorigin="anonymous">
                    </script>
                    <style>                       
                        ul {                                 
                            list-style-type: none;  
                            padding: 0;             
                            margin: 0;              
                        }                                   

                        li {                                 
                            padding-left: 0.5em;    
                        }
                        
                        .handle::before {
                            content: "${whitespaceCSS.repeat(5)}";
                            display: block;
                            float: left;
                        }
                          
                        .collapsed::before {
                            content: "${whitespaceCSS.repeat(2)}+${whitespaceCSS.repeat(2)}";
                            cursor: pointer;
                            float: left;
                        }                                                                                    
                          
                        .expanded::before {
                            content: "${whitespaceCSS.repeat(2)}-${whitespaceCSS.repeat(2)}";
                            cursor: pointer;
                            float: left;
                        }                           
                    </style>             
                </head>
                <body>
                    <h3>${projectName}</h3>
                    Select the version to display: 
                    <select id="versionFilter">
                        <option value="all" selected>All</option>`;

        versions.forEach(details => {
                resContent += `
                        <option value="${details.version}">${details.version}</option>`;
            });
        resContent += `
                    </select>
                    <ul id="tree">`;

        versions.forEach(details => {
                resContent += `
                        <li id="${details.version}" class="version_element">Version ${details.version}
                            <ul>`;
                details.tasks.forEach((task) => {
                    resContent += `
                                <li>
                                    <a href='https://redmine.aliaslab.net/issues/${task.taskId}'>Task ${task.taskId}</a>
                                    <ul>`;
                    task.commits.forEach(commitMsg => {
                        resContent += `
                                        <li>${commitMsg}</li>`;
                    });
                    resContent += `
                                    </ul>
                                </li>`;
                });
                resContent += `
                            </ul>
                        </li>`;
            });

        resContent += `
                    </ul>
                    <script>
                        let versionFilterJQuery = $("#versionFilter");
                        let versionFilter = versionFilterJQuery.get(0);
                        let lastSelected = versionFilter.value;
                        
                        versionFilterJQuery.on('change',() => {
                            const selectedVal = versionFilter.value;
                            if (lastSelected === "all")
                                $(".version_element").css("display", "none");
                            else 
                                $(\`[id="\${lastSelected}"]\`).css("display", "none");
                            
                            if (selectedVal === "all")
                                $(".version_element").css("display", "list-item");
                            else
                                $(\`[id="\${selectedVal}"]\`).css("display", "list-item");

                            lastSelected = selectedVal;
                        });

                        $(document).ready(function() {                                                               
                            $("#tree ul").hide();                                                       
                          
                            $("#tree li").each(function() {                                                  
                                var handleSpan = $("<span></span>")                            
                                    .addClass("handle").prependTo(this);                                          
                          
                                if($(this).has("ul").length > 0) {                              
                                    handleSpan.addClass("collapsed").click(function() {                            
                                    $(this).toggleClass("collapsed expanded")   
                                        .siblings("ul").toggle();             
                                    });                                                      
                                }                                                                    
                            });                                                                              
                        });     
                    </script>
                </body>
            </html>`;

        return resContent;
    }
}

let versionHistory = new VersionHistory(PROJECTS_FOLDER);

module.exports = versionHistory;