const fetch = require('node-fetch');

jest.mock('../../instances/prjHistoryManagerInstance');
const prjHistoryManager = require('../../instances/prjHistoryManagerInstance');

const app = require('../../index');
const env_consts = require('../../env_consts');

// custom errors
const MissingProjectError = require('../../model/exceptions/missingProjectError');
const ProjectAlreadyExistsError = require('../../model/exceptions/projectAlreadyExistsError');
const VersionAlreadyExistsError = require('../../model/exceptions/versionAlreadyExistsError');
const MissingVersionError = require('../../model/exceptions/missingVersionError');

const TEST_PROJECT_NAME = "test";
const TEST_VERSION = "1.0.0";

beforeAll(async () => {
    await app.server_starting;
});

beforeEach(() => {
    jest.resetAllMocks();
})

function mockManagerFunction(mockFun, behaviour) {
    return mockFun.mockImplementationOnce(() => {
        if (behaviour !== null && behaviour.prototype instanceof Error)
            throw new behaviour();
        else
            return behaviour;
    });
}

function genericCallApi(specificRoute, options) {
    return fetch(`http://${env_consts.HOST}:${env_consts.PORT}/${TEST_PROJECT_NAME}${specificRoute}`, options);
}

describe('getProjectLastVersion', () => {
    let callApi = async () => await genericCallApi('/versions/last', {
        method: 'GET'
    });

    test('project does not exist, should return 404', async () => {
        mockManagerFunction(prjHistoryManager.getProjectLastVersion, MissingProjectError);

        let res = await callApi();
        expect(res.status).toBe(404);
    });

    test('project does exist but no version, should return 200 with empty string', async () => {
        mockManagerFunction(prjHistoryManager.getProjectLastVersion, null);

        let res = await callApi();
        expect(res.status).toBe(200);
        let textResponse = await res.text();
        expect(textResponse).toBe("");
    });

    test('version does exist, should return 200 with version', async () => {
        mockManagerFunction(prjHistoryManager.getProjectLastVersion, TEST_VERSION);

        let res = await callApi();
        expect(res.status).toBe(200);
        let textResponse = await res.text();
        expect(textResponse).toBe(TEST_VERSION);
    });
});

describe('addNewVersion', () => {
    let callApi = async (body) => await genericCallApi('/versions', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });

    let correctBody = {
        "version": TEST_VERSION,
        "tasks": [
            {
                "taskId": 1234,
                "commits": [
                    "commitmsg1"
                ]
            }
        ]
    };

    let incorrectBody = {
        "version": TEST_VERSION
    }

    test('project does not exist, should return 200', async () => {
        mockManagerFunction(prjHistoryManager.doesProjectExist, false);
        let mockedAddnewProject = mockManagerFunction(prjHistoryManager.addNewProject, null);
        mockManagerFunction(prjHistoryManager.addNewVersion, null);
        
        let res = await callApi(correctBody);

        expect(res.status).toBe(200);
        expect(mockedAddnewProject).toHaveBeenCalledTimes(1);
    });

    test('project does exist, should return 200', async () => {
        mockManagerFunction(prjHistoryManager.doesProjectExist, true);
        let mockedAddnewProject = mockManagerFunction(prjHistoryManager.addNewProject, null);
        mockManagerFunction(prjHistoryManager.addNewVersion, null);

        let res = await callApi(correctBody);

        expect(res.status).toBe(200);
        expect(mockedAddnewProject).toHaveBeenCalledTimes(0);
    });

    test('version already exists, should return 400', async () => {
        mockManagerFunction(prjHistoryManager.doesProjectExist, true);
        mockManagerFunction(prjHistoryManager.addNewProject, null);
        mockManagerFunction(prjHistoryManager.addNewVersion, VersionAlreadyExistsError);
        
        let res = await callApi(correctBody);

        expect(res.status).toBe(400);
    });

    test('body is wrongly formatted, should return 400', async () => {
        mockManagerFunction(prjHistoryManager.doesProjectExist, true);
        let mockedAddNewProject = mockManagerFunction(prjHistoryManager.addNewProject, null);
        let mockedAddNewVersion = mockManagerFunction(prjHistoryManager.addNewVersion, null);
        
        let res = await callApi(incorrectBody);

        expect(res.status).toBe(400);
        expect(mockedAddNewProject).toHaveBeenCalledTimes(0);
        expect(mockedAddNewVersion).toHaveBeenCalledTimes(0);
    });
});

describe('deleteVersion', () => {
    let callApi = async (version) => await genericCallApi(`/versions/${version}`, {
        method: 'DELETE'
    });

    test('project does not exist, should return 404', async () => {
        mockManagerFunction(prjHistoryManager.deleteVersion, MissingProjectError);

        let res = await callApi(TEST_VERSION);
        expect(res.status).toBe(404);
    });

    test('version does not exist, should return 404', async () => {
        mockManagerFunction(prjHistoryManager.deleteVersion, MissingVersionError);

        let res = await callApi(TEST_VERSION);
        expect(res.status).toBe(404);
    });

    test('version does exist, should return 200 with version', async () => {
        mockManagerFunction(prjHistoryManager.deleteVersion, TEST_VERSION);

        let res = await callApi(TEST_VERSION);
        expect(res.status).toBe(200);
    });
});

afterAll(() => {
    app.server.close();
});