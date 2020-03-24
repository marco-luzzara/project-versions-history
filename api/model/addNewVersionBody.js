const AddNewVersionBodyError = require('./exceptions/addNewVersionBodyError');

class AddNewVersionBody {
    constructor(body) {
        if (typeof(body) !== 'object')
            throw new AddNewVersionBodyError('body must be an object');

        if (body.version === undefined || body.version === null)
            throw new AddNewVersionBodyError('body must have "version" property');
        this.version = body.version;

        if (body.tasks === undefined || body.tasks === null || !Array.isArray(body.tasks))
            throw new AddNewVersionBodyError('body must have "tasks" array');
        this.tasks = [];    

        body.tasks.forEach(task => {
            let newTask = {};
            if (task.taskId === undefined || task.taskId === null)
                throw new AddNewVersionBodyError('each task must have a "taskId" property');
            newTask.taskId = task.taskId;
            
            if (task.commits === undefined || task.commits === null || 
                !Array.isArray(task.commits) || task.commits.length === 0)
                throw new AddNewVersionBodyError('each task must have a non-empty "commits" array');
            newTask.commits = [];
            
            task.commits.forEach(commit => {
                if (commit === undefined || commit === null || typeof(commit) !== 'string')
                    throw new AddNewVersionBodyError('each commit must be a string');
                newTask.commits.push(commit);
            });

            this.tasks.push(newTask);
        });
    }
}

module.exports = AddNewVersionBody;