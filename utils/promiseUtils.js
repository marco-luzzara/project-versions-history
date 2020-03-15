module.exports = {
    /**
     * 
     * @param {function} promiseFun function to promisify
     * @param {any} funArgs params to pass to promFun
     */
    promisify: function(promFun, ...funArgs) {
        return new Promise((resolve, reject) => {
            try {
                resolve(promFun.apply(null, funArgs));
            }
            catch (exc) {
                reject(exc);
            }
        });
    }
}