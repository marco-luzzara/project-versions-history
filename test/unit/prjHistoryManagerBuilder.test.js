const env_consts = require('../../env_consts');
const PrjHistoryManagerBuilder = require("../../model/prjHistoryManagerBuilder");

function getPrjHistoryManagerBuilder(customConfigs) {
    let prjHistoryManagerBuilder = new PrjHistoryManagerBuilder(env_consts.PROJECTS_FOLDER)
        .fromFolderPath();
    
    for (let customConfig of customConfigs) {
        prjHistoryManagerBuilder.fromJson(customConfig.prjName, customConfig.prjHistory);
    }   

    return prjHistoryManagerBuilder;
}

test('name is empty, should return false', () => {
    expect(() => getPrjHistoryManagerBuilder([
        {prjName: "", prjHistory: {}}
    ])).toThrow();
});

test('name is empty, should return false', () => {
    expect(() => getPrjHistoryManagerBuilder([
        {prjName: undefined, prjHistory: {}}
    ])).toThrow();
});

test('name is empty, should return false', () => {
    expect(() => getPrjHistoryManagerBuilder([
        {prjName: null, prjHistory: {}}
    ])).toThrow();
});