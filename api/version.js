const fs = require('fs');

const versionHistory = require('../data/prjHistoryStore');

// GET /:project_name/versions/last
// get the last version of a project
function getLastVersion(req, res, projectName) {
    if (projectName == undefined) {
        res.statusCode = 400;
        res.end('Project name undefined');

        return;
    }
    if (versionHistory.doesProjectExist(projectName)) {
        let lastVersion = versionHistory.getProjectLastVersion(projectName);

        res.statusCode = 200;
        res.end(lastVersion);
    }
    else {
        res.statusCode = 404;
        res.end('Project Not found');
    }
}

// POST /:project_name/versions/
// body: json with version data
function addNewVersion(req, res, projectName) {
    if (projectName == undefined) {
        res.statusCode = 400;
        res.end('Project name undefined');

        return;
    }

    let body = "";
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        let jsonVersion = JSON.parse(body);

        try {
            versionHistory.addNewVersion(projectName, jsonVersion);

            res.statusCode = 200;
            res.end("");
        }
        catch (exc) {
            res.statusCode = 400;
            res.end(exc.message);
        }
    });
}

// GET /:project_name/
// returns a web page (static) where versions contains a list of tasks and each task has a list of commit message. task ids will be links to redmine issues
function getProjectHistoryHTML(req, res, projectName) {
    if (projectName == undefined) {
        res.statusCode = 400;
        res.end('Project name undefined');

        return;
    }

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    try {
        let content = versionHistory.viewHtmlForProject(projectName);

        res.write(content);
        res.statusCode = 200;
        res.end();
    }
    catch (exc) {
        res.statusCode = 400;
        res.end(exc.message);
    }
}

// DELETE /:project_name/versions/:version
// delete a version entry from project specified
function deleteVersion(req, res, projectName, version) {
    if (projectName === undefined || version === undefined) {
        res.statusCode = 400;
        res.end('Project name or version undefined');

        return;
    }

    try {
        versionHistory.deleteVersion(projectName, version);

        res.statusCode = 200;
        res.end();
    }
    catch (exc) {
        res.statusCode = 400;
        res.end(exc.message);
    }
}

module.exports = {
    getLastVersion: getLastVersion,
    addNewVersion: addNewVersion,
    getProjectHistoryHTML: getProjectHistoryHTML,
    deleteVersion: deleteVersion
}