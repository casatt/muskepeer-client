/**
 * @module Mediator
 * @class Mediator
 */

define(['computation/index', 'network/index', 'storage/index'],

    function (computation, network, storage) {

        var index = 0;
        return {

            /**
             * @method couple
             */
            couple: function () {

                /**
                 * Master Broadcast Messages
                 */

                network.on('grid:computation:start', computation.start);
                network.on('grid:computation:stop', computation.stop);

                /** DEBUGGING **/
                network.on('grid:database:clear', storage.db.clear);
                network.on('grid:filesystem:clear', storage.fs.clear);
                network.on('grid:client:reload', function (e) {
                    setTimeout(function () {
                        location.reload(true);
                    }, e.time);
                });


                /**
                 * Broadcast Messages
                 */
                network.on('broadcast:result:push', function (e) {
                    //logger.log('Mediator', 'result:push', e.data.uuid);
                    var hasChanged = computation.results.update(e.data);
                    if (hasChanged) {
                        network.peers.broadcast('result:push', e.data, e.target.uuid);
                    }
                });


                network.on('broadcast:job:push', function (e) {
                    //logger.log('Mediator', 'job:push', e.data.uuid);
                    var hasChanged = computation.jobs.update(e.data);
                    if (hasChanged) {
                        network.peers.broadcast('job:push', e.data, e.target.uuid);
                        computation.pushJobToAwaitingWorker(e.data);
                    }
                });

                network.on('broadcast:job:lock', function (e) {
                    var hasChanged = computation.jobs.lockJob(e.data);
                    if (hasChanged) {
                        network.peers.broadcast('job:lock', e.data, e.target.uuid);
                    }
                });

                network.on('broadcast:job:unlock', function (e) {
                    var hasChanged = computation.jobs.unlockJob(e.data);
                    if (hasChanged) {
                        network.peers.broadcast('job:unlock', e.data, e.target.uuid);
                    }
                });


                /**
                 *  List Requests
                 */

                network.on('node:list:pull', function (e) {
                    e.target.sendNodeList(network.nodes.getNodeUuidsAsArray());
                });

                network.on('peer:list:pull', function (e) {
                    e.target.sendPeerList(network.peers.getPeerUuidsAsArray());
                });

                network.on('file:list:pull', function (e) {
                    storage.getFileUuidsAsArray().then(function (list) {
                        e.target.sendFileList(list);
                    });
                });

                network.on('job:list:pull', function (e) {
                    storage.getJobUuidsAsArray().then(function (list) {
                        e.target.sendJobList(list);
                    });
                });

                network.on('result:list:pull', function (e) {
                    storage.getResultUuidsAsArray().then(function (list) {
                        e.target.sendResultList(list);
                    });
                });


                /**
                 *  List Answers
                 */

                network.on('node:list:push', function (e) {
                    //logger.log('Peer ' + peer.id, 'Result of node:sync', list.length);
                    e.target.getNodeByUuid(network.nodes.getMissingNodeUuidsAsArray(e.list));
                });

                network.on('peer:list:push', function (e) {
                    //logger.log('Peer ' + peer.id, 'Result of peer:sync', list.length);
                    e.target.getPeerByUuid(network.peers.getMissingPeerUuidsAsArray(e.list));
                });

                network.on('file:list:push', function (e) {
                    storage.getMissingFileUuidsAsArray(e.list).then(function (list) {
                        //logger.log('Peer ' + e.target.id, 'Result of file:sync', list.length);
                        e.target.getFileByUuid(list);
                    });
                });

                network.on('job:list:push', function (e) {
                    storage.getMissingJobUuidsAsArray(e.list).then(function (list) {
                        //logger.log('Peer ' + e.target.id, 'Result of job:sync', list.length);
                        e.target.getJobByUuid(list);
                    });
                });


                network.on('result:list:push', function (e) {
                    storage.getMissingResultUuidsAsArray(e.list).then(function (list) {
                        //logger.log('Peer ' + e.target.id, 'Result of result:sync', list.length);
                        e.target.getResultByUuid(list);
                    });
                });


                /**
                 * Requests
                 */

                network.on('node:pull', function (e) {
                    e.target.sendNode(network.nodes.getNodeByUuid(e.uuid).serialize());
                });

                network.on('peer:pull', function (e) {
                    e.target.sendPeer(network.peers.getPeerByUuid(e.uuid).serialize());
                });

                network.on('file:pull', function (e) {
                    // Not implemented yet!
                });

                network.on('job:pull', function (e) {
                    storage.db.read('jobs', e.uuid, {uuidIsHash: true}).then(function (job) {
                        e.target.sendJob(job);
                    });
                });

                network.on('result:pull', function (e) {
                    storage.db.read('results', e.uuid, {uuidIsHash: true}).then(function (result) {
                        e.target.sendResult(result);
                    });
                });


                /**
                 * Answers
                 */
                network.on('node:push', function (e) {
                    network.nodes.update(e.node);
                });

                network.on('peer:push', function (e) {
                    network.peers.update(e.peer);
                });

                network.on('file:push', function (e) {
                    // Not implemented yet!
                });

                network.on('job:push', function (e) {
                    computation.jobs.update(e.job);
                });

                network.on('result:push', function (e) {
                    computation.results.update(e.result);
                });


                /**
                 * Computational Events
                 */

                computation.on('job:lock', function (e) {
                    network.publish('job:lock', e);
                });
                computation.on('job:unlock', function (e) {
                    network.publish('job:unlock', e);
                });
                computation.on('job:push', function (e) {
                    network.publish('job:push', e);
                });
                computation.on('result:push', function (e) {
                    network.publish('result:push', e);
                });

            },

            /**
             * @method decouple
             */
            decouple: function () {
                network.removeAllListeners();
                computation.removeAllListeners();
            }
        };
    });