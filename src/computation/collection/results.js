/**
 * @class Results
 * @module Results
 */


define(['q', 'storage/index', 'project', 'storage/model/cache'], function (Q, storage, project, Cache) {

        var module = {};


        /**
         * @method init
         */
        module.init = function () {
            logger.log('Results', 'init');

            module.cache = new Cache('results', project.computation.results.autoSaveIntervalTime, function (a, b) {
                return (a && b) && (a.isValid !== b.isValid || a.iteration !== b.iteration);
            });

            return module.cache.syncWithStorage();
        };

        /**
         * @property cache
         * @type {Array}
         */
        module.cache = null;


        /**
         * Adds a result to the storage. If its new will return true,
         * if it's an update it will return false;
         *
         * @method add
         * @param {Result} result
         * @return {Promise}
         */
        module.update = function (result) {

            // Read stored result
            var storedResult = module.cache.get(result);

            // Have seen this before
            if (storedResult) {

                // No need to update
                if (storedResult.isValid || storedResult.iteration >= project.computation.results.validation.iterations) {
                    return false;
                }

                // Increase iterations, then Update,
                result.iteration = storedResult.iteration + 1;

                // Already did enough iterations, result is now valid
                if (result.iteration >= project.computation.results.validation.iterations) {
                    result.isValid = true;
                }
            }

            // Update result
            return module.cache.set(result);

        };


        /**
         * @method clear
         * @return {Promise}
         */
        module.clear = function () {
            module.cache.flush();
            return storage.db.clear(['results']);
        };


        /**
         * @method getResultByUuid
         * @param {String} uuid
         * @return {Promise}
         */
        module.getResultByUuid = function (uuid) {
            return module.cache.get({uuid: uuid});
        };


        /**
         * @method isValid
         * @param result
         * @return {Boolean}
         */
        module.isValid = function (result) {
            return module.cache.get(result).isValid;
        };


        /**
         * @method allValid
         * @return {Boolean}
         */
        module.allValid = function () {
            var results = module.cache.filter();
            return results.length === project.computation.results.expected;

        };


        return module;

    }
)
;
