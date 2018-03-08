const mosca = require('mosca');
const Service = require('./service');
const App = require('./app');
const _ = require('lodash');
const P = require('bluebird');

var server = new mosca.Server({});	//here we start mosca

// server.on('ready', () => {

describe('notify', function() {
    it('notify(service -> one app)', function(done) {
        const service = new Service('APrwcjzsk2z9avdgbm','34muv07nkfs60fjf5x4fz5iwifcnmgck');
        const app = new App('APrwcjzsk2z9avdgbm','34muv07nkfs60fjf5x4fz5iwifcnmgck');

        app.connect('mqtt://localhost').then(() => {
            app.on('$notify',(payload) => {
                if (payload.tar == app.appToken) {
                    done();
                }
                else {
                    done(new Error('no auth'));
                }
            });

            service.connect('mqtt://localhost').then(() => {
                service.notify('$iot',{iotId: 'aaaa', attribute: 'bbbb'},{});
            });
        });
    });
});

describe('update', function() {
    it('update(app -> service)', function(done) {
        const service = new Service('aaaaa','bbbbb');
        const app = new App('aaaaa','bbbbb');
        const message = {
            iotId: 'aaaaa',
            attribute: 'bbbbb',
            payload: {}
        };

        service.connect('mqtt://localhost').then(() => {
            service.on('$update',(payload) => {
                if () {
                    done();
                }
                else {
                    done(new Error('no auth'));
                }
            });

            app.connect('mqtt://localhost').then(() => {
                app.update('$iot', message.iotId, message.attribute, message.payload);
            });
        });
    });
});


    //
    // //notify(service -> 多个app)
    // let connectlength = 0;
    // for (var i=0;i<10;i++)
    // {
    //     const app = new App('appToken'+i,'appScrect'+i);
    //     app.connect('mqtt://localhost').then(() => {
    //         connectlength += 1;
    //         app.on('$notify',(payload) => {
    //             console.log('notify',payload.src == app.appToken);
    //         });
    //
    //         if (connectlength == 9) {
    //             const service = new Service('appToken0','appScrect0');
    //             service.connect('mqtt://localhost').then(() => {
    //                 service.notify('$iot','iotId','attribute',{});
    //             });
    //         }
    //     });
    // }



    // //req(app3->service3)
    // //rreq(service3->app4)
    // //rresp(app4->service3)
    // //resp(service3->app3)
    // const service3 = new Service('appToken3','appScrect3');
    // const app3 = new App('appToken3','appScrect3');
    // const app4 = new App('appToken4','appScrect4');
    // const resultArray = [];
    //
    // service3.connect('mqtt://localhost').then(() => {
    //     service3.on('$update',(payload) => {
    //         console.log('service3','update',payload.src == service3.appToken);
    //     });
    //
    //     service3.on('$req',(payload) => {
    //         if (payload.src == service3.appToken) {
    //             // console.log('service3: 接受到req请求,确认目标来源'+payload.src);
    //             // console.log('service3: 发送到rreq请求,目标'+payload.tar);
    //             service3.rreq(payload.tar,payload.src,payload.channel,payload.iotId,payload.attribute,payload.payload).then((result) => {
    //                 // console.log('service3: 收到返回参数,确认目标来源'+result.src);
    //                 // console.log('service3: 发送resp请求,目标'+result.tar);
    //                 if (result.tar == service3.appToken) {
    //                     service3.resp(result.tar,result.tar,result.channel,result.iotId,result.attribute,payload.messageId,result.payload);
    //                 }
    //                 else {
    //                     console.log('no auth');
    //                 }
    //             });
    //         }
    //         else {
    //             console.log('no auth');
    //         }
    //     });
    //
    //     app4.connect('mqtt://localhost').then(() => {
    //         app4.on('$rreq',(payload) => {
    //             // console.log('app4: 收到rreq请求,确认目标来源'+payload.tar);
    //             // console.log('app4: 发送rresp请求,目标'+payload.tar);
    //             app4.rresp(payload.tar,payload.channel,payload.iotId,payload.attribute,payload.messageId,payload.payload);
    //         });
    //
    //         app3.connect('mqtt://localhost').then(() => {
    //             // console.log('app3: 发送req,目标appToken4');
    //             for (var i=0;i<100;i++)
    //             {
    //                 app3.req('appToken4','$iot','iotId','attribute',{random: Math.random().toString(36)}).then((payload) => {
    //                     resultArray.push(payload.payload);
    //                     console.log('app3: 收到返回参数');
    //                     console.log(resultArray.length,payload.payload,payload.tar == app3.appToken);
    //                 });
    //             }
    //         });
    //     });
    // });
// });