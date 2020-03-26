const AsyncLock = require('async-lock');

const prjHistoryManager = require('../instances/prjHistoryManagerInstance');
let lock = new AsyncLock();

const AddNewVersionBody = require('./model/addNewVersionBody');

const MissingProjectError = require('../model/exceptions/missingProjectError');
const VersionAlreadyExistsError = require('../model/exceptions/versionAlreadyExistsError');
const MissingVersionError = require('../model/exceptions/missingVersionError');
const AddNewVersionBodyError = require('./model/exceptions/addNewVersionBodyError');

function flattenObject(obj) {
    let newObj = {};
    var props = Object.getOwnPropertyNames(obj);

    for(var key of props) {
        newObj[key] = obj[key];
    }

    return newObj;
}

/**
 * 
 * @param {ServerResponse} res
 * @param {Error} exc - error thrown
 * @param {Object} handlerDescriptor - describes what error code corresponds to which errors. like:
 * {
 *     "404": [MissingProjectError, MissingVersionError],
 *     "400": [null]
 * }
 * null corresponds to the default clause in a switch statement
 */
function handleException(res, exc, handlerDescriptor) {
    //console.log(exc);
    res.setHeader('Content-Type', 'application/json');

    let exceptionMap = new Map();
    for (let [statusCode, errors] of Object.entries(handlerDescriptor)) {
        for (let error of errors) {
            exceptionMap.set(error, statusCode);
        }
    }

    let isExcFound = false;
    for (let [error, statusCode] of exceptionMap.entries()) {
        if (error !== null && exc instanceof error) {
            res.statusCode = statusCode;
            isExcFound = true;
            break;
        }
    }

    exc = JSON.stringify(flattenObject(exc));
    if (!isExcFound)
        res.statusCode = exceptionMap.get(null);

    res.end(exc);
}

function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk;
        }).on('end', () => {
            resolve(body);
        }).on('error', (err) => {
            reject(err);
        });
    });
}


// GET /:project_name/versions/last
// get the last version of a project
async function getLastVersion(req, res, projectName) {
    try {
        let lastVersion = await lock.acquire(projectName, () => prjHistoryManager.getProjectLastVersion(projectName));

        res.statusCode = 200;
        res.end(lastVersion);
    }
    catch (exc) {
        handleException(res, exc, {
            "404": [MissingProjectError],
            "500": [null]
        });
    }
}

// POST /:project_name/versions/
// body: json with version data
async function addNewVersion(req, res, projectName) {
    try {
        let body = await getBody(req);
        let versionData = JSON.parse(body);
        versionData = new AddNewVersionBody(versionData);

        await lock.acquire(projectName, async () => {
            if (!prjHistoryManager.doesProjectExist(projectName))
                await prjHistoryManager.addNewProject(projectName);
            await prjHistoryManager.addNewVersion(projectName, versionData);
        });

        res.statusCode = 200;
        res.end();
    }
    catch (exc) {
        handleException(res, exc, {
            "400": [VersionAlreadyExistsError, AddNewVersionBodyError],
            "500": [null]
        });
    }
}

// DELETE /:project_name/versions/:version
// delete a version entry from project specified
async function deleteVersion(req, res, projectName, version) {
    try {
        await lock.acquire(projectName, async () => {
            await prjHistoryManager.deleteVersion(projectName, version);
        });

        res.statusCode = 200;
        res.end();
    }
    catch (exc) {
        handleException(res, exc, {
            "404": [MissingProjectError, MissingVersionError],
            "500": [null]
        });
    }
}

// GET /:project_name/
// returns a web page (static) where versions contains a list of tasks and each task has a list of commit message. task ids will be links to redmine issues
async function getProjectHistoryHTML(req, res, projectName) {
    try {
        let content = await prjHistoryManager.viewHtmlForProject(projectName);

        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(content);
    }
    catch (exc) {
        handleException(res, exc, {
            "404": [MissingProjectError],
            "500": [null]
        });
    }
}

module.exports = {
    getLastVersion: getLastVersion,
    addNewVersion: addNewVersion,
    getProjectHistoryHTML: getProjectHistoryHTML,
    deleteVersion: deleteVersion
}