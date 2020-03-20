const fs = require('fs');
const path = require('path');

const PrjHistoryManagerBuilder = require("../../model/prjHistoryManagerBuilder");
const TEST_PROJECT_NAME = "test";
const TEST_VERSION = "1.0.0";

// custom errors
const MissingProjectError = require('../../model/exceptions/missingProjectError');
const ProjectAlreadyExistsError = require('../../model/exceptions/projectAlreadyExistsError');
const VersionAlreadyExistsError = require('../../model/exceptions/versionAlreadyExistsError');
const MissingVersionError = require('../../model/exceptions/missingVersionError');

function getPrjHistoryManager(customConfigs) {
    let prjHistoryManagerBuilder = new PrjHistoryManagerBuilder(process.env.PROJECTS_FOLDER)
        .fromFolderPath();
    
    for (let customConfig of customConfigs) {
        prjHistoryManagerBuilder.fromJson(customConfig.prjName, customConfig.prjHistory);
    }   

    return prjHistoryManagerBuilder.build();
}

beforeEach(() => {
    const jsonPath = path.join(process.env.PROJECTS_FOLDER, TEST_PROJECT_NAME + ".csv");

    if (fs.existsSync(jsonPath))
        fs.unlinkSync(jsonPath);
});

describe('doesProjectExist', () => {
    test('project does not exist, should return false', () => {
        let phm = getPrjHistoryManager([]);

        expect(phm.doesProjectExist(TEST_PROJECT_NAME)).toBeFalsy();
    });

    test('project exists, should return true', () => {
        let phm = getPrjHistoryManager([
            {prjName: TEST_PROJECT_NAME, prjHistory: [{}]}
        ]);

        expect(phm.doesProjectExist(TEST_PROJECT_NAME)).toBeTruthy();
    });
});

describe('doesVersionExist', () => {
    test('project does not exist, should throw', () => {
        let phm = getPrjHistoryManager([]);

        expect(() => phm.doesVersionExist(TEST_PROJECT_NAME, TEST_VERSION)).toThrow(MissingProjectError);
    });

    test('version does not exist, should return false', () => {
        let phm = getPrjHistoryManager([
            {prjName: TEST_PROJECT_NAME, prjHistory: [{}]}
        ]);

        expect(phm.doesVersionExist(TEST_PROJECT_NAME, TEST_VERSION)).toBeFalsy();
    });

    test('version does exist, should return true', () => {
        let phm = getPrjHistoryManager([
            {
                prjName: TEST_PROJECT_NAME, prjHistory: [
                    {
                        "version": TEST_VERSION,
                        "tasks": []
                    }
                ]
            }
        ]);

        expect(phm.doesVersionExist(TEST_PROJECT_NAME, TEST_VERSION)).toBeTruthy();
    });
});

describe('getProjectVersionsHistory', () => {
    test('project does not exist, should throw', async () => {
        let phm = getPrjHistoryManager([]);

        await expect(phm.getProjectVersionsHistory(TEST_PROJECT_NAME)).rejects.toThrow(MissingProjectError);
    });

    test('return versions in reverse order', async () => {
        let versions = [
            {
                "version": TEST_VERSION,
                "tasks": []
            },
            {
                "version": "v2",
                "tasks": []
            }
        ];

        let phm = getPrjHistoryManager([
            {prjName: TEST_PROJECT_NAME, prjHistory: versions}
        ]);

        await expect(phm.getProjectVersionsHistory(TEST_PROJECT_NAME)).resolves
            .toEqual(versions.reverse());
    });
});

describe('getProjectLastVersion', () => {
    test('projectName does not exist, should throw', () => {
        let phm = getPrjHistoryManager([]);

        expect(() => phm.getProjectLastVersion(TEST_PROJECT_NAME)).toThrow();
    });
    
    test('projectName does exist, but no version, should return null', () => {
        let phm = getPrjHistoryManager([
            {prjName: TEST_PROJECT_NAME, prjHistory: [{}]}
        ]);

        expect(phm.getProjectLastVersion(TEST_PROJECT_NAME)).toBe(null);
    });

    test('projectName does exist and has a version, should return the version', () => {
        let phm = getPrjHistoryManager([
            {
                prjName: TEST_PROJECT_NAME, prjHistory: [
                    {
                        "version": "firstversion",
                        "tasks": []
                    },
                    {
                        "version": TEST_VERSION,
                        "tasks": []
                    }
                ]
            }
        ]);

        expect(phm.getProjectLastVersion(TEST_PROJECT_NAME)).toBe(TEST_VERSION);
    });
});