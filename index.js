const fs = require('fs');
const http = require('http');

const versionHistory = require('./data/prjHistoryStore');
const versionApi = require('./api/version');

const PORT = 9001;

const server = http.createServer((req, res) => {
    const pathParams = req.url.split('/');

    // GET /:project_name/versions/last
    if (pathParams[2] == "versions" && pathParams[3] == "last" && pathParams.length == 4 && req.method === 'GET') {
        versionApi.getLastVersion(req, res, pathParams[1]);

    // POST /:project_name/versions/
    } else if (pathParams[2] == "versions" && pathParams.length == 3 && req.method === 'POST') {
        versionApi.addNewVersion(req, res, pathParams[1]);

    // GET /:project_name/
    // returns a web page (static) where versions contains a list of tasks and each task has a list of commit message. task ids will be links to redmine issues
    } else if (pathParams.length == 2 && req.method === 'GET') {
        versionApi.getProjectHistoryHTML(req, res, pathParams[1]);

    // DELETE /:project_name/versions/:version
    // delete a version entry from project specified
    } else if (pathParams[2] == "versions" && pathParams.length == 4 && req.method === 'DELETE') {
        versionApi.deleteVersion(req, res, pathParams[1], pathParams[3]);

    // Invalid request
    } else {
        res.statusCode = 404;
        res.end("Not found");
    }
});

server.listen(PORT, function () {
    console.log(`IDSign.Versioning listening on port ${PORT}`);
});