const EventEmitter = require('events');
const vm = require('vm');

const mqtt = require('mqtt');
const _ = require('lodash');
const P = require('bluebird');

class node extends EventEmitter {

    constructor(appToken, appScrect) {
        super();
        this.sysChannels = ['$iot','$circle'];

        this.appToken = appToken;
        this.appScrect = appScrect;
        this.channelList = {};
        this.mqttClient = null;
        this.subscribePatterns = [`/${appToken}/#`];
    }

    connect(address, options) {
        return new P((resolve,reject) => {
            this.mqttClient = mqtt.connect(address);
            this.mqttClient.on('message',(topic,payload) => {
                let topicParser = topic.split('/');

                let targetToken = topicParser[0];
                let srcToken = topicParser[1];
                let channel = topicParser[2];
                let cmd = topicParser[3];
                let messageId = topicParser[4] || '';

                let script = new vm.Script(" msg = " + payload.toString());
                let obj = {};
                try{
                    script.runInNewContext(obj);
                }
                catch (e){

                }

                let msg = obj.msg || {};

                let data = {
                    tar: targetToken,
                    src: srcToken,
                    channel: channel,
                    cmd: cmd,
                    messageId: messageId,
                    payload: msg.payload
                };

                if (cmd == '$resp' || cmd == '$rresp') {
                    this.emit(messageId, this.topicParser(data, topic));
                }
                this.emit(channel, this.topicParser(data, topic));
                this.emit(cmd, this.topicParser(data, topic));
                this.emit(channel+'/'+cmd, this.topicParser(data, topic));
            });

            this.mqttClient.on('connect',() => {
                this.mqttClient.subscribe(this.subscribePatterns);
                resolve(this);
            });
        })
    }

    topicParser(data, topic) {
        let topicParser = topic.split('/');
        switch (topicParser[2]) {
            case '$iot':
                data.iotId = topicParser[5];
                data.attribute = topicParser[6];
                return data;
                break;
            default:
                return {};
                break;
        }
    }
}

module.exports = node;