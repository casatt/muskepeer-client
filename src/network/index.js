/**
 *
 * @module Network
 *
 */

define(['q', 'lodash', 'storage/index', 'project', 'settings', 'musketeer-module', './collections/nodes', './collections/peers', './model/peer'],

    function (Q, _, storage, project, settings, MusketeerModule, nodes, peers, Peer) {

        var _module = new MusketeerModule();

        // Detect network change
        // http://www.html5rocks.com/en/mobile/workingoffthegrid/
        window.addEventListener('offline', networkConnectivityStateChangeHandler);
        window.addEventListener('online', networkConnectivityStateChangeHandler);

        function networkConnectivityStateChangeHandler(e) {
            if (e.type === 'online') {
                logger.warn('Device is online!');
            }
            else {
                logger.warn('Device is offline!');
            }
        }

        function peerOfferHandler(data) {
            var peer = peers.getPeerByUuid(data.targetPeerUuid);

            if (!peer) {
                peer = new Peer({uuid: data.targetPeerUuid, nodes: [data.nodeUuid], isSource: true});
                peers.add(peer);
            }

            peer.answerOffer(data);
        }

        function peerAnswerHandler(data) {
            var peer = peers.getPeerByUuid(data.targetPeerUuid);
            peer.acceptConnection(data);
        }


        return _module.extend({

            isOnline: window.navigator.onLine,

            nodes: nodes,
            peers: peers,

            start: function () {

                //no need to do anything more if we are not online
                if (!_module.isOnline) return;

                //peer listeners
                nodes.on('peer:offer', peerOfferHandler);
                nodes.on('peer:answer', peerAnswerHandler);

                //get all nodes related to this project via proectUuid
                storage.findAndReduceByObject('nodes', {filterDuplicates: true}, {projectUuid: project.uuid}).
                    then(function (nodeData) {
                        //creates objects of type model/node
                        nodes.update(nodeData);
                    })
                    .then(nodes.connect)
                    .then(nodes.authenticate)
                    .then(nodes.getRelatedPeers)
                    .then(function (peerData) {
                        //creates objects of type model/peer
                        peers.update(peerData);
                    })
                    .then(peers.connect)
                    .done(function () {
                        logger.log('Network start complete')
                    });

            },

            stop: function () {

            },

            /**
             * Send data to all nodes and peers
             * @param key
             * @param data
             */
            broadcast: function (key, data) {
            }


        });
    });