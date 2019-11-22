const fs = require('fs');
const http = require('http');

const PORT = 9001;
const FILE = 'versions.json';

let rawdata = fs.readFileSync(FILE);
let repoVersions = JSON.parse(rawdata);

const server = http.createServer((req, res) => {

    if (req.url.indexOf('/versions') != -1 && req.method === 'GET') {
        const name = req.url.replace('/versions/', '');
        if (name == undefined) {
            res.statusCode = 400;
            res.end('Bad request');
        }

        const index = repoVersions.findIndex(repo => repo.name == name);
        if (index == -1) {
            res.statusCode = 404;
            res.end('Not found');
        }
        else {
            res.statusCode = 200;
            res.end(repoVersions[index].version.toString());
        }
    }

    if (req.url.indexOf('/versions') != -1 && req.method === 'POST') {
        const name = req.url.replace('/versions/', '');
        let body = "";
        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {
            const indexEquals = body.indexOf('=');
            const newVersion = body.substring(indexEquals + 1, body.length);
            if (name == undefined || newVersion == undefined || newVersion == "") {
                res.statusCode = 400;
                res.end("Bad request");
            }

            const index = repoVersions.findIndex(repo => repo.name == name);
            if (index == -1) {
                res.statusCode = 404;
                res.end("Not found");
            }
            else {
                repoVersions[index].version = new String(newVersion);
                res.statusCode = 200;
                res.end("OK");
            }

            const data = JSON.stringify(repoVersions);
            fs.writeFileSync(FILE, data);
        });
    }
});

server.listen(PORT, function () {
    console.log(`IDSign.Versioning listening on port ${PORT}`);
});
