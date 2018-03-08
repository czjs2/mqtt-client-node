const mosca = require('mosca');
const Service = require('./service');
const App = require('./app');

var server = new mosca.Server({});	//here we start mosca

server.on('ready', () => {

    const service = new Service('appToken','appScrect');
    const app = new App('appToken','appScrect');

    app.connect('mqtt://localhost').then(() => {
        app.on('$notify',(payload) => {
            console.log('接收notify成功');
        });

        service.connect('mqtt://localhost').then(() => {
            console.log('发送notify');
            service.notify('$iot','iotId','attribute',{});
        });
    });

    const service2 = new Service('appToken2','appScrect2');
    const app2 = new App('appToken2','appScrect2');

    service2.connect('mqtt://localhost').then(() => {
        service2.on('$update',(payload) => {
            console.log('接收update成功');
        });

        app2.connect('mqtt://localhost').then(() => {
            console.log('发送update');
            app2.update('$iot','iotId','attribute',{});
        });
    });

    const service3 = new Service('appToken33','appScrect33');
    const app3 = new App('appToken3','appScrect3');
    const app4 = new App('appToken4','appScrect4');

    service3.connect('mqtt://localhost').then(() => {
        service3.on('$req',(payload) => {
            console.log('接受到req请求,确认目标来源'+payload.src);
            console.log('发送到rreq请求,目标'+payload.tar);
            service3.rreq(payload.tar,payload.src,payload.channel,payload.iotId,payload.attribute,payload.payload).then((result) => {
                console.log('收到返回参数,确认目标来源'+result.src);
                console.log('发送resp请求,目标'+result.tar);
                service3.resp(result.tar,result.tar,result.channel,result.iotId,result.attribute,payload.messageId,result.payload);
            });
        });

        app3.connect('mqtt://localhost').then(() => {
            console.log('发送req,目标appToken4');
            app3.req('appToken4','$iot','iotId','attribute',{}).then((payload) => {
                console.log('收到返回参数');
                console.log(payload);
            });
        });

        app4.connect('mqtt://localhost').then(() => {
            app4.on('$rreq',(payload) => {
                console.log('收到rreq请求,确认目标来源'+payload.src);
                console.log('发送rresp请求,目标'+payload.src);
                app4.rresp(payload.tar,payload.channel,payload.iotId,payload.attribute,payload.messageId,payload.payload);
            });
        });
    });
});