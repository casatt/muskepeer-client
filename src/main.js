require.config({
    paths: {
        'domready': 'lib/requirejs-domready/domReady',
        'lodash': 'lib/lodash/dist/lodash',
        'eventemitter2': 'lib/eventemitter2/lib/eventemitter2',
        'idbwrapper': 'lib/idbwrapper/idbstore',
        'jsrsasign': 'lib/jsrsasign/jsrsasign-latest-all-min',
        'mixing': 'lib/mixing/dist/mixing',
        'node-uuid': 'lib/node-uuid/uuid',
        'observe-js': 'lib/observe-js/src/observe',
        'q': 'lib/q/q',
        'sjcl': 'lib/sjcl/sjcl',
        'sockjs': 'lib/sockjs/sockjs'
    },
    shim: {
        'jsrsasign': {
            exports: 'KJUR'
        },
        'sjcl': {
            exports: 'sjcl'
        }
    }
});

require(['muskepeer-client', 'util/logger'], function (Muskepeer, Logger) {

    window.logger = Logger;

    logger.log('Client', 'Loading...');

    window.Muskepeer = Muskepeer.init();

    Muskepeer.start({
        project: 'https://muskepeer.net/examples/knn-digits/settings.json',
        nodes: [
            {
                host: 'node01-muskepeer.rhcloud.com',
                isSecure: true,
                port: 8443
            },
            {
                host: 'node02-muskepeer.rhcloud.com',
                isSecure: true,
                port: 8443
            }
        ]
    });


});

