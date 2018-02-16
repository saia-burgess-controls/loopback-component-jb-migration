const Task = require('./Task');

const TaskQueue = module.exports = class TaskQueue extends Task {

    constructor(name, version, tasks = []) {
        super(name, version);
        this.tasks = tasks;
    }

    async run(dependencies = {}, result = {}) {
        return this.tasks.reduce(
            (pending, current, index) => pending
                .then(result => current.run(dependencies, result))
                .catch((error) => {
                    const logger = dependencies.logger;
                    if (logger) {
                        logger.error(error);
                    }
                    error.taskIndex = index;
                    return Promise.reject(error);
                }),
            Promise.resolve(result),
        );
    }

    async revert() {
        return this.revertFrom(this.tasks.length - 1);
    }

    async revertFrom(index) {
        return this
            .tasks
            .slice(0, index + 1)
            .reverse()
            .reduce(
                (pending, current) => pending.then(() => current.revert()),
                Promise.resolve(),
            );
    }

    add(task) {
        this.tasks.push(task);
    }

    find(callback){
        return this.tasks.find(callback);
    }
};

TaskQueue.Task = Task;
