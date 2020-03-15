const fs = require('fs');
const path = require('path');

const PrjHistoryManagerBuilder = require("../../model/prjHistoryManagerBuilder");
const CSV_NAME = "test";

function getPrjHistoryManager(customConfigs) {
    let prjHistoryManagerBuilder = new PrjHistoryManagerBuilder(process.env.PROJECTS_FOLDER)
        .fromFolderPath();
    
    for (let customConfig of customConfigs) {
        prjHistoryManagerBuilder.fromJson(customConfig.prjName, customConfig.prjHistory);
    }   

    return prjHistoryManagerBuilder.build();
}

beforeEach(() => {
    const jsonPath = path.join(process.env.PROJECTS_FOLDER, CSV_NAME + ".csv");

    if (fs.existsSync(jsonPath))
        fs.unlinkSync(jsonPath);
});

describe('doesProjectExist', () => {
    test('project does not exist, should return false', () => {
        let phm = getPrjHistoryManager([]);

        expect(phm.doesProjectExist("test")).toBeFalsy();
    });

    test('project exists, should return true', () => {
        let phm = getPrjHistoryManager([
            {prjName: CSV_NAME, prjHistory: [{}]}
        ]);

        expect(phm.doesProjectExist("test")).toBeTruthy();
    });
})

describe('getProjectLastVersion', () => {
    test('projectName does not exist, should throw', () => {
        let phm = getPrjHistoryManager([]);

        expect(() => phm.getProjectLastVersion("test")).toThrow();
    });
    
    test('projectName does exist, but no version, should return null', () => {
    });

    test('projectName does exist and has a version, should return the version', () => {
    });
});