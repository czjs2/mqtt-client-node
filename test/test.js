const mosca = require('mosca');
const P = require('bluebird');
const Service = require('../index').service;
const App = require('../index').app;

const service = new Service('aaaa','bbbb');
const app1 = new App('aaaa1','bbbb1');
const app2 = new App('aaaa2','bbbb2');
const gateway1 = new App('aaaaa1','bbbbb1');
const gateway2 = new App('aaaaa1','bbbbb1');
const message = {
    iotId: 'asdfgh',
    attribute: 'gggggg',
    payload: {
        value: Math.random().toString(36)
    }
};

describe('server', function() {
    it('localhost server start', function(done) {
        var server = new mosca.Server({});	//here we start mosca
        server.on('ready', () => {
            done();
        });
    });
});

describe('service connect', function() {
    it('service connect', function (done) {
        service.connect('mqtt://localhost').then(() => {
            done();
        });
    });
});

describe('app connect', function() {
    it('app1 connect', function (done) {
        app1.connect('mqtt://localhost').then(() => {
            done();
        });
    });

    it('app2 connect', function(done) {
        app2.connect('mqtt://localhost').then(() => {
            done();
        });
    });
});

describe('gateway connect', function() {
    it('gateway1 connect', function(done) {
        gateway1.connect('mqtt://localhost').then(() => {
            done();
        });
    });

    it('gateway2 connect', function(done) {
        gateway2.connect('mqtt://localhost').then(() => {
            done();
        });
    });
});

describe('update', function() {
    it('update(gateway1 -> service)', function(done) {
        service.removeAllListeners('$update');
        service.on('$update',(result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('value is difference'));
            }
        });

        gateway1.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload
        });
    });

    it('update(gateway1 -> service error)', function(done) {
        service.removeAllListeners('$update');
        service.on('$update',(result) => {
            if (result.error) {
                done();
            }
            else {
                done(new Error('must error'));
            }
        });

        gateway1.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            error: 'error'
        });
    });
});

describe('soeIotAttrs', function() {
    it('soeIotAttrs status', function(done) {
        service.removeAllListeners('$update');
        service.on('$update',(result) => {
            if (result.options.type == 's') {
                done();
            }
            else {
                done(new Error('type is not s'));
            }
        });

        app1.soeIotAttrs({
            attrs: {
                "1":{   //属性
                    type: "s", //数据类型 状态或是事件型
                    payload: 'bbb'  //值内容
                }
            },
            params: {iotId: 'aaaa'}
        })
    });

    it('soeIotAttrs event', function(done) {
        service.removeAllListeners('$update');
        service.on('$update',(result) => {
            if (result.options.type == 'e') {
                done();
            }
            else {
                done(new Error('type is not e'));
            }
        });

        app1.soeIotAttrs({
            attrs: {
                "1":{   //属性
                    type: "e", //数据类型 状态或是事件型
                    payload: 'bbb'  //值内容
                }
            },
            params: {iotId: 'aaaa'}
        })
    });
});

describe('notify', function() {
    it('notify(service -> app1)', function(done) {
        app1.removeAllListeners('$notify');
        app1.on('$notify',(result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('value is difference'));
            }
        });

        service.notify({
            tar: app1.appToken,
            src: service.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload
        });
    });
});

describe('req->rreq->rresp->resp', function() {
    it('req', function(done) {
        service.removeAllListeners('$req');
        service.on('$req',(result) => {
            service.resp(result);
        });

        app1.req({
            tar: app1.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload
        }).then((result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('req failed'));
            }
        }).catch((e) => {
            done(new Error(e));
        });
    });

    it('req error', function(done) {
        service.removeAllListeners('$req');
        service.on('$req',(result) => {
            result.error = 'error';
            service.resp(result);
        });

        app1.req({
            tar: app1.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload
        }).then((result) => {
            done(new Error('must error'));
        }).catch((e) => {
            done();
        });
    });

    it('rreq', function(done) {
        app2.removeAllListeners('$rreq');
        app2.on('$rreq',(result) => {
            app2.rresp(result);
        });

        service.rreq({
            tar: app2.appToken,
            src: service.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload
        }).then((result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('req failed'));
            }
        }).catch((e) => {
            done(new Error(e));
        });
    });

    it('req->rreq->rresp->resp', function(done) {
        app2.removeAllListeners('$rreq');
        service.removeAllListeners('$req');

        service.on('$req',(result) => {
            service.rreq(result).then((obj) => {
                obj.messageId = result.messageId;
                service.resp(obj);
            });
        });

        app2.on('$rreq',(result) => {
            app2.rresp(result);
        });

        app1.req({
            tar: app2.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            options: {timeout: 10000}
        }).then((result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('req failed'));
            }
        }).catch((e) => {
            console.log(e);
        });
    });

    it('req->rreq->rresp->resp error', function(done) {
        app2.removeAllListeners('$rreq');
        service.removeAllListeners('$req');

        service.on('$req',(result) => {
            service.rreq(result).then((obj) => {
                obj.messageId = result.messageId;
                service.resp(obj);
            });
        });

        app2.on('$rreq',(result) => {
            result.error = 'error2';
            app2.rresp(result);
        });

        app1.req({
            tar: app2.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload
        }).then((result) => {
            done(new Error('must error'));
        }).catch((e) => {
            done();
        });
    });

    it('req->rreq->rresp->resp 100second', function(done) {
        app2.removeAllListeners('$rreq');
        service.removeAllListeners('$req');

        service.on('$req',(result) => {
            service.rreq(result).then((obj) => {
                obj.messageId = result.messageId;
                service.resp(obj);
            });
        });

        app2.on('$rreq',(result) => {
            app2.rresp(result);
        });

        let count = 0;
        for(var i=0;i<100;i++)
        {
            app1.req({
                tar: app2.appToken,
                channel: '$iot',
                params: {iotId: message.iotId, attribute: message.attribute},
                payload: message.payload
            }).then((result) => {
                if (result.payload.value == message.payload.value) {
                    count += 1;
                    if (count == 99) {
                        done();
                    }
                }
                else {
                    done(new Error('req failed'));
                }
            });
        }
    });
});

describe('finish', function() {
    it('service finish', function(done) {
        service.mqttClient.end(true,() => {
            done();
        })
    });

    it('app1 finish', function(done) {
        app1.mqttClient.end(true,() => {
            done();
        })
    });

    it('app2 finish', function(done) {
        app2.mqttClient.end(true,() => {
            done();
        })
    });

    it('gateway1 finish', function(done) {
        gateway1.mqttClient.end(true,() => {
            done();
        })
    });

    it('gateway2 finish', function(done) {
        gateway2.mqttClient.end(true,() => {
            done();
        })
    });
});