const fs = require('fs');
const readLastLines = require('read-last-lines');

const csvUtils = require("../utils/csvUtils");
const fileUtils = require('../utils/fileUtils');

// errors
const MissingProjectError = require('./exceptions/missingProjectError');
const ProjectAlreadyExistsError = require('./exceptions/projectAlreadyExistsError');
const VersionAlreadyExistsError = require('./exceptions/versionAlreadyExistsError');
const MissingVersionError = require('./exceptions/missingVersionError');

class PrjHistoryManager {
    /**
     * 
     * @param {string} projectsFolder 
     * @param {Map<string, string>} projectsLastVersion 
     * @param {Map<string, Set>} projectsVersionsList 
     */
    constructor(projectsFolder, projectsLastVersion, projectsVersionsList) {
        this.projectsFolder = projectsFolder;
        this.projectsLastVersion = projectsLastVersion;
        this.projectsVersionsList = projectsVersionsList;
    }

    getProjectFile(projectName) {
        return `./${this.projectsFolder}/${projectName}.csv`;
    }

    doesProjectExist(projectName) {
        return this.projectsLastVersion.has(projectName);
    }

    doesVersionExist(projectName, version) {
        if (!this.doesProjectExist(projectName))
            throw new MissingProjectError(projectName);

        return this.projectsVersionsList.get(projectName).has(version);
    }

    async getProjectVersionsHistory(projectName) {
        if (!this.doesProjectExist(projectName))
            throw new MissingProjectError(projectName);

        let projectVersionsHistory = await fileUtils.readFile(this.getProjectFile(projectName));
        return (await csvUtils.csvToJsonSync(projectVersionsHistory)).reverse();
    }

    /**
     * 
     * @param {string} projectName 
     * @description return the last version or null if the project does not contain versions
     */
    getProjectLastVersion(projectName) {
        if (!this.doesProjectExist(projectName))
            throw new MissingProjectError(projectName);

        return this.projectsLastVersion.get(projectName);
    }

    /**
     * 
     * @param {string} projectName 
     */
    async addNewProject(projectName) {
        if (this.doesProjectExist(projectName))
            throw new ProjectAlreadyExistsError(projectName);

        this.projectsLastVersion.set(projectName, null);
        this.projectsVersionsList.set(projectName, new Set());

        await fileUtils.writeFile(this.getProjectFile(projectName), "");
    }

    /**
     * 
     * @param {string} projectName 
     * @param {Object} versionData 
     */
    async addNewVersion(projectName, versionData) {
        if (this.doesVersionExist(projectName, versionData.version))
            throw new VersionAlreadyExistsError(projectName, versionData.version);

        let csvContent = "";
        if ((await fileUtils.getFileSize(this.getProjectFile(projectName))).size === 0)
            csvContent = csvUtils.jsonToCsvSync([versionData]);
        else 
            csvContent = csvUtils.castObjectToCsv(versionData);

        await fileUtils.appendFile(this.getProjectFile(projectName), "\n" + csvContent);

        this.projectsVersionsList.get(projectName).add(versionData.version);
        this.projectsLastVersion.set(projectName, versionData.version);
    }

    /**
     * delete the specified version
     * @param {string} projectName 
     * @param {string} version 
     */
    async deleteVersion(projectName, version) {
        if (!this.doesVersionExist(projectName, version))
            throw new MissingVersionError(projectName, version);

        let oldCsvContent = (await fileUtils.readFile(this.getProjectFile(projectName)))
            .split('\n');
        let oldVersionsCsv = oldCsvContent.slice(1); 
        let newVersionsCsv = [];

        // version === last version
        if (this.projectsLastVersion.get(projectName) === version) {
            newVersionsCsv = oldVersionsCsv.slice(0, -1);

            let projectVersions = [...this.projectsVersionsList.get(projectName)];
            this.projectsLastVersion.set(projectName, 
                projectVersions.length === 1 ? null : 
                projectVersions[projectVersions.length - 2]);
        }
        // version !== last version
        else {
            let versionIndex = null;
            let i = 0;
            for (let v of this.projectsVersionsList.get(projectName).values()) {
                if (v === version) {
                    versionIndex = i;
                }
                i++;
            }

            newVersionsCsv = [...oldVersionsCsv.slice(0, versionIndex), ...oldVersionsCsv.slice(versionIndex + 1)];
        }

        let newCsvContent = [oldCsvContent[0], ...newVersionsCsv].join("\n");
        await fileUtils.writeFile(newCsvContent);

        this.projectsVersionsList.get(projectName).delete(version);
    }

    async viewHtmlForProject(projectName) {
        if (!this.doesProjectExist(projectName))
            throw new MissingProjectError(projectName);

        let versions = await this.getProjectVersionsHistory(projectName);
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

module.exports = PrjHistoryManager;