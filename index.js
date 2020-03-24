const fs = require('fs');
const http = require('http');

const env_consts = require('./env_consts');
const versionApi = require('./api/version');

const server = http.createServer(async (req, res) => {
    const pathParams = req.url.split('/');

    // GET /:project_name/versions/last
    if (pathParams[2] == "versions" && pathParams[3] == "last" && pathParams.length == 4 && req.method === 'GET') {
        versionApi.getLastVersion(req, res, pathParams[1]);

    // POST /:project_name/versions/
    } else if (pathParams[2] == "versions" && pathParams.length == 3 && req.method === 'POST') {
        await versionApi.addNewVersion(req, res, pathParams[1]);

    // GET /:project_name/
    // returns a web page (static) where versions contains a list of tasks and each task has a list of commit message. task ids will be links to redmine issues
    } else if (pathParams.length == 2 && req.method === 'GET') {
        await versionApi.getProjectHistoryHTML(req, res, pathParams[1]);

    // DELETE /:project_name/versions/:version
    // delete a version entry from project specified
    } else if (pathParams[2] == "versions" && pathParams.length == 4 && req.method === 'DELETE') {
        await versionApi.deleteVersion(req, res, pathParams[1], pathParams[3]);

    // Bad Request
    } else {
        res.statusCode = 400;
        res.end('your request does not correspond to any of the documented APIs');
    }
});

let server_starting = new Promise((resolve, reject) => {
    server.listen(env_consts.PORT, env_consts.HOST, function () {
        console.log(`IDSign.Versioning listening on port ${env_consts.PORT}`);
        resolve();
    });
});

module.exports = {
    server: server,
    server_starting: server_starting
}