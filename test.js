const mosca = require('mosca');
const Service = require('./service');
const App = require('./app');
const _ = require('lodash');
const P = require('bluebird');

const service1 = new Service('aaaa1','bbbb1');
const app1 = new App('aaaa1','bbbb1');
const app2 = new App('aaaa2','bbbb2');
const app3 = new App('aaaa3','bbbb3');
const message = {
    iotId: 'aaaaa',
    attribute: 'bbbbb',
    payload: {
        value: 'test'
    }
};

describe('server', function() {
    it('server start', function(done) {
        var server = new mosca.Server({});	//here we start mosca
        server.on('ready', () => {
            done();
        });
    });

    it('service1 connect', function(done) {
        service1.connect('mqtt://localhost').then(() => {
            done();
        });
    });

    it('app1 connect', function(done) {
        app1.connect('mqtt://localhost').then(() => {
            done();
        });
    });

    it('app2 connect', function(done) {
        app2.connect('mqtt://localhost').then(() => {
            done();
        });
    });

    it('app3 connect', function(done) {
        app3.connect('mqtt://localhost').then(() => {
            done();
        });
    });
});

describe('update', function() {
    it('update(app -> service)', function(done) {
        service1.on('$update',(payload) => {
            if (payload.tar == service1.appToken && payload.params.iotId == message.iotId && payload.params.attribute == message.attribute) {
                done();
            }
            else {
                done(new Error('update failed'));
            }
        });

        app1.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            options: {}
        });
    });
});

describe('notify', function() {
    it('notify(service -> one app)', function(done) {
        app1.on('$notify',(payload) => {
            if (payload.tar == service1.appToken && payload.params.iotId == message.iotId && payload.params.attribute == message.attribute) {
                done();
            }
            else {
                done(new Error('notify failed'));
            }
        });

        service1.notify({
            target: app1.appToken,
            src: app1.appToken,
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            options: {}
        });
    });
    it('notify(service -> more app)', function(done) {
        service1.on('$update',(payload) => {
            service1.notify({
                target: payload.tar,
                src: service1.appToken,
                channel: '$iot',
                params: {iotId: payload.iotId, attribute: payload.attribute},
                payload: payload.payload,
                options: {}
            });
        });

        app1.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            options: {}
        });
        app2.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            options: {}
        });
        app3.update({
            channel: '$iot',
            params: {iotId: message.iotId, attribute: message.attribute},
            payload: message.payload,
            options: {}
        });

        app1.on('$notify',(payload) => {
            if (payload.tar == app1.appToken && payload.params.iotId == message.iotId && payload.params.attribute == message.attribute) {
                console.log('notify app1 success');
            }
            else {
                console.log('notify app1 failed');
            }
        });
        app2.on('$notify',(payload) => {
            if (payload.tar == app2.appToken && payload.params.iotId == message.iotId && payload.params.attribute == message.attribute) {
                console.log('notify app2 success');
            }
            else {
                console.log('notify app2 failed');
            }
        });
        app3.on('$notify',(payload) => {
            if (payload.tar == app3.appToken && payload.params.iotId == message.iotId && payload.params.attribute == message.attribute) {
                console.log('notify app3 success');
            }
            else {
                console.log('notify app3 failed');
            }
        });

        done();
    });
});

describe('req->rreq->rresp->resp', function() {
    it('req->rreq->rresp->resp', function(done) {
        service1.on('$req',(payload) => {
            service1.rreq({
                target: payload.src,
                src: payload.tar,
                channel: '$iot',
                params: {iotId: payload.params.iotId, attribute: payload.params.attribute},
                payload: payload.payload
            }).then((result) => {
                service1.resp({
                    target: result.src,
                    src: result.tar,
                    channel: '$iot',
                    params: {iotId: result.params.iotId, attribute: result.params.attribute, messageId: payload.params.messageId},
                    payload: result.payload
                })
            });
        });

        app2.on('$rreq',(payload) => {
            app2.rresp({
                target: payload.src,
                channel: '$iot',
                params: payload.params,
                payload: payload.payload
            });
        });

        let count = 0;
        for(var i=0;i<100;i++)
        {
            app1.req({
                target: app2.appToken,
                channel: '$iot',
                params: {iotId: message.iotId, attribute: message.attribute},
                payload: {random: Math.random().toString(36)}
            }).then((payload) => {
                if (payload.tar == app1.appToken && payload.params.iotId == message.iotId && payload.params.attribute == message.attribute) {
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