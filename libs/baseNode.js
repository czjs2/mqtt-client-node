const EventEmitter = require('events');
const vm = require('vm');

const mqtt = require('mqtt');
const _ = require('lodash');
const P = require('bluebird');
const Topic = require('./topic');

class node extends EventEmitter {

    constructor(appToken, appScrect,subscribePatterns) {
        super();
        this.appToken = appToken;
        this.appScrect = appScrect;
        this.mqttClient = null;
        this.subscribePatterns = subscribePatterns || [`/${appToken}/#`];
        this.topic = new Topic();
    }

    //验证tar, src, channel, params的值是否是空的
    validate({tar, src, channel, params}) {
        let error = '';
        if (!tar) {
            error = 'tar is undefined';
            return error;
        }
        if (!src) {
            error = 'src is undefined';
            return error;
        }
        if (!channel) {
            error = 'channel is undefined';
            return error;
        }
        if (_.isEmpty(params)) {
            error = 'params is empty';
        }
        return error;
    }

    connect(address, options) {
        return new P((resolve,reject) => {
            this.mqttClient = mqtt.connect(address, {username: this.appToken, password: this.appScrect});
            this.mqttClient.on('message',(topic,payload) => {
                let topicParser = topic.split('/');

                let tarToken = topicParser[1];
                let srcToken = topicParser[2];
                let channel = topicParser[3];
                let cmd = topicParser[4];

                let script = new vm.Script(" msg = " + payload.toString());
                let obj = {};
                try{
                    script.runInNewContext(obj);
                }
                catch (e){
                    console.log(e);
                }

                let msg = obj.msg || {};

                let data = {
                    tar: tarToken,
                    src: srcToken,
                    channel: channel,
                    cmd: cmd,
                    payload: msg.payload
                };

                _.pullAt(topicParser,[0,1,2,3,4]);
                let result = this.topic.parser(channel, topicParser);
                _.extend(data, {params: result});

                if (cmd == '$resp' || cmd == '$rresp') {
                    this.emit(result.messageId, data);
                }
                this.emit(channel, data);
                this.emit(cmd, data);
                this.emit(channel+'-'+cmd, data);
            });

            this.mqttClient.on('connect',() => {
                this.mqttClient.subscribe(this.subscribePatterns);
                resolve(this);
            });
        })
    }
}

module.exports = node;