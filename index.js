const fs = require('fs');
const http = require('http');

const PORT = 9001;
const DIR = 'projects';

let repoVersions = new Map();

fs.readdirSync(DIR).forEach(file => {
    let rawdata = fs.readFileSync(`${DIR}/${file}`);
    repoVersions.set(file.split('.')[0], JSON.parse(rawdata));
});

const server = http.createServer((req, res) => {
    const pathParams = req.url.split('/');
    const repoNames = Array.from(repoVersions.keys());
    if (pathParams[2] == "versions" && pathParams[3] == "last" && pathParams.length == 4 && req.method === 'GET') {
        const name = req.url.replace('/versions/last', '').substr(1);
        if (name == undefined) {
            res.statusCode = 400;
            res.end('Bad request');
        }
        if (repoVersions.has(name)) {
            const repoFound = repoVersions.get(name);
            const lastVersion = JSON.stringify(repoFound[0]);

            res.statusCode = 200;
            res.end(lastVersion);
        }
        else {
            res.statusCode = 404;
            res.end('Not found');
        }
    } else if (pathParams[2] == "versions" && pathParams.length == 3 && req.method === 'GET') {
        const name = req.url.replace('/versions', '').substr(1);
        if (name == undefined) {
            res.statusCode = 400;
            res.end('Bad request');
        }
        if (repoVersions.has(name)) {
            let repoFound = repoVersions.get(name);

            const lastVersion = JSON.stringify(Object.keys(repoFound.versions)[0]) + ":" + JSON.stringify(Object.values(repoFound.versions)[0])

            res.statusCode = 200;
            res.end(lastVersion);
        }
        else {
            res.statusCode = 404;
            res.end('Not found');
        }

    } else if (pathParams[2] == "versions" && pathParams.length == 3 && req.method === 'PUT') {
        const name = req.url.replace('/versions', '').substr(1);

        if (name == undefined) {
            res.statusCode = 400;
            res.end('Bad request');
        }

        let body = "";
        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {
            if (repoVersions.has(name)) {
                const newVersion = JSON.parse(body);
                let repoFound = repoVersions.get(name);
                if (repoFound[0].version == newVersion.version) {
                    res.statusCode = 400;
                    res.end("Bad request, version already present");
                }
                else {
                    repoFound.unshift(newVersion);

                    res.statusCode = 200;
                    res.end(JSON.stringify(repoFound));

                    const data = JSON.stringify(repoFound);
                    fs.writeFileSync(`./projects/${name}.json`, data);
                }
            }
            else {
                res.statusCode = 404;
                res.end('Not found');
            }
        });
    } else if (repoNames.some((name) => name == pathParams[1]) && pathParams.length == 2 && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        const repoSearched = repoVersions.get(pathParams[1]);

        let resContent = "<html><body>";
        resContent += `<h3>${pathParams[1]}</h3>`;
        resContent += `<ul>`;
        repoSearched.forEach((details) => {
            resContent += `<li>Version <a href="#">${details.version}</a></li>`;
            resContent += `<ul>`
            details.tasks.forEach((task) => {
                resContent += `<li><a href='https://redmine.aliaslab.net/issues/${task.id}'>Task ${task.id}</a></li>`;
                resContent += `<ul>`;
                task.messages.forEach((msg) => {
                    resContent += `<li>${msg}</li>`
                })
                resContent += `</ul>`;
            })
            resContent += `</ul>`;
        })
        resContent += `</ul>`;

        resContent += "</body></html>";
        res.write(resContent);
        res.end();
    } else if (repoNames.some((name) => name == pathParams[1]) && pathParams.length == 3 && req.method === 'GET') {

        const repoSearched = repoVersions.get(pathParams[1]);
        if (repoSearched == undefined) {
            res.statusCode = 404;
            res.end('Not found, repository does not exist');
            return;
        }
        const versionIndex = repoSearched.findIndex((entry) => entry.version == pathParams[2]);
        if (versionIndex == -1) {
            res.statusCode = 404;
            res.end('Not found, version does not exist');
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        
        let resContent = "<html><body>";
        resContent += `<h3>${pathParams[1]}</h3>`;

        resContent += `<b>Version ${repoSearched[versionIndex].version}</b>`;
        resContent += `<ul>`
        repoSearched[versionIndex].tasks.forEach((task) => {
            resContent += `<li><a href='https://redmine.aliaslab.net/issues/${task.id}'>Task ${task.id}</a></li>`;
            resContent += `<ul>`;
            task.messages.forEach((msg) => {
                resContent += `<li>${msg}</li>`
            })
            resContent += `</ul>`;
        })
        resContent += `</ul>`;

        resContent += "</body></html>";
        res.write(resContent);
        res.end();

    } else {
        res.statusCode = 404;
        res.end("Not found");
    }
});

server.listen(PORT, function () {
    console.log(`IDSign.Versioning listening on port ${PORT}`);
});