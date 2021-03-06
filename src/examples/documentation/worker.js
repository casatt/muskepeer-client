/**********************************************
 * COMMUNICATION BLOCK START
 **********************************************/

self.addEventListener('message', function (e) {

    if (!e.data.cmd) {
        return;
    }

    switch (e.data.cmd.toLowerCase()) {
        case 'pause':
            break;
        case 'resume':
            break;
        case 'start':
            start();
            break;
        case 'stop':
            self.close();
            break;
        case 'job' :
            //e.data.job
            break;
        case 'file' :
            //e.data.fileInfo
            //e.data.file
            break;
        case 'result' :
            //e.data.result
            break;
        default:
            break;
    }
});

/**********************************************
 * COMMUNICATION BLOCK END
 **********************************************/


function start() {


    // Post a result with a related job
    self.postMessage({
            type: 'result:push',
            data: {
                job: {
                    uuid: job.uuid
                },
                result: {
                    a: 10,
                    b: 'Foo'
                }
            }
        }
    );

    // Post a result without a related job
    self.postMessage({
            type: 'result:push',
            data: {
                result: {
                    a: 10,
                    b: 'Foo'
                }
            }
        }
    );

    self.postMessage({ type: 'result:pull', data: {uuid: '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3'}});

    self.postMessage({ type: 'job:push', data: { a: 10, b: 20, c: 50} });

    self.postMessage({ type: 'job:pull', data: {uuid: 'c25945fcf5508f52661464831d54de84a228bad76a9474222fb2aa1d7a7d5850'}});
    self.postMessage({ type: 'job:pull' });

    self.postMessage({ type: 'file:pull', data: {url: 'https://example.org/file.pdf'} });
    self.postMessage({ type: 'file:pull', data: {name: 'webstorm', type: 'localUrl', offset: 0} });
    self.postMessage({ type: 'file:pull', data: {name: 'webstorm', type: 'blob', offset: 1234} });
    self.postMessage({ type: 'file:pull', data: {name: 'webstorm', type: 'dataUrl'} });
    self.postMessage({ type: 'file:pull', data: {name: 'webstorm', type: 'path'} });
    self.postMessage({ type: 'file:pull', data: {name: 'webstorm', type: 'arrayBuffer'} }); // Transferrable Object


    self.postMessage({ type: 'file:push', data: {} });


}
