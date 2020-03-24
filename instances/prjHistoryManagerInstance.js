const env_consts = require('../env_consts');

const PrjHistoryManagerBuilder = require("../model/prjHistoryManagerBuilder");
let prjHistoryManager = new PrjHistoryManagerBuilder(env_consts.PROJECTS_FOLDER)
    .fromFolderPath()
    .build();

module.exports = prjHistoryManager;
