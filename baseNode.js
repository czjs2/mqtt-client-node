const EventEmitter = require('events');
const vm = require('vm');

const mqtt = require('mqtt');
const _ = require('lodash');
const P = require('bluebird');

class node extends EventEmitter {

    constructor(appToken, appScrect) {
        super();

        let sysChannels = ['$iot','$circle'];

        this.appToken = appToken;
        this.appScrect = appScrect;
        this.channelList = {};
        this.mqttClient = null;

        _.each(sysChannels,(item) => {
            this.channelList[item] = {
                '$update':(data) => {this.broadcastParser(data.targetToken,item,'$update',data.attribute,data.payload)},
                '$notify':(data) => {this.broadcastParser(data.targetToken,item,'$notify',data.attribute,data.payload)}
            };
        });
    }

    connect(address, options) {
        return new P((resolve,reject) => {
            this.mqttClient = mqtt.connect(address);
            this.mqttClient.on('message',(topic,payload) => {
                let topicParser = topic.split('/');

                let targetToken = topicParser[0];
                let channel = topicParser[2];
                let cmd = topicParser[3];
                let attribute = topicParser[5];

                let script = new vm.Script(" msg = " + payload.toString());
                let obj = {};
                try{
                    script.runInNewContext(obj);
                }
                catch (e){

                }

                let msg = obj.msg || {};

                switch (cmd) {
                    case '$update':
                    case '$notify':
                        this.channelList[channel][cmd]({
                            targetToken: targetToken,
                            attribute: attribute,
                            payload: msg.payload
                        });
                        break;
                    case '$req':
                    case '$rreq':
                        this.emit(messageId, {
                            targetToken: targetToken,
                            channel: channel,
                            cmd: cmd,
                            attribute: attribute,
                            payload: msg.payload
                        });
                        break;
                    default:
                        break;
                }
            });

            this.mqttClient.on('connect',() => {
                this.mqttClient.subscribe(this.subs);
                resolve(this);
            });
        })
    }

    broadcastParser(targetToken, channel, cmd, attribute, payload) {
        if (targetToken && channel && cmd && attribute) {
            let uuid = targetToken+channel+cmd;
            this.emit(uuid, {
                targetToken: targetToken,
                channel: channel,
                cmd: cmd,
                attribute: attribute,
                payload: payload
            });
            this[channel] = {};
            this[channel][cmd] = {
                on: (callback) => {
                    this.on(uuid,(payload) => {
                        callback(payload);
                    });
                }
            }
        }
    }
}

module.exports = node;