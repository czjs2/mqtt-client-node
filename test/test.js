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

            service.on('$req',(result) => {
                service.rreq(result).then((obj) => {
                    obj.messageId = result.messageId;
                    service.resp(obj);
                });
            });
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
            payload: message.payload,
            options: {}
        });
    });
});

describe('soeIotAttrs', function() {
    it('soeIotAttrs', function(done) {
        service.on('$event',(result) => {
            if (result.payload == 'bbb') {
                done();
            }
            else {
                done(new Error('payload is difference'));
            }
        });

        app1.soeIotAttrs({
            attrs: {
                "1":{   //属性
                    "type": "s", //数据类型 状态或是事件型
                    payload: 'aaa'  //值内容
                },
                "2":{   //属性
                    type: "e", //数据类型 状态或是事件型
                    payload: 'bbb'  //值内容
                },
            },
            params: {iotId: 'aaaa'},
            options: {}
        })
    });
});

describe('notify', function() {
    it('notify(service -> app1)', function(done) {
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
            payload: message.payload,
            options: {}
        });
    });

    it('notify(service -> app1 and app2)', function(done) {
        app1.on('$notify',(result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('value is difference'));
            }
        });
        app2.on('$notify',(result) => {
            if (result.payload.value == message.payload.value) {
                done();
            }
            else {
                done(new Error('value is difference'));
            }
        });

        service.on('$update',(result) => {
            if (result.payload.value == message.payload.value) {
                service.notify({
                    tar: result.payload.appToken,
                    src: result.src,
                    channel: '$iot',
                    params: result.params,
                    payload: result.payload,
                    options: {}
                });
            }
            else {
                done(new Error('value is difference'));
            }
        });

        gateway1.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: {value: message.payload.value, appToken: app1.appToken},
            options: {}
        });
        gateway2.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: {value: message.payload.value, appToken: app2.appToken},
            options: {}
        });
    });
});

describe('req->rreq->rresp->resp', function() {
    it('req->rreq->rresp->resp', function(done) {
        app2.on('$rreq',(result) => {
            app2.rresp(result);
        });

        app1.req({
            tar: app2.appToken,
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
        });
    });

    it('req->rreq->rresp->resp 100second', function(done) {
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