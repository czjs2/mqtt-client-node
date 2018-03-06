const EventEmitter = require('events');
const vm = require('vm');

const mqtt = require('mqtt');
const _ = require('lodash');
const P = require('bluebird');

class node extends EventEmitter {

    constructor(appToken, appScrect) {
        super();

        let sysChannels = ['$iot','$circle'];

        let type = ['sys','app','iot'];
        let pubsub = {
            sys:{
                notify:'pub',
                update:'sub'
            }
        };

        this.pubs = [];
        this.subs = [];
        this.appToken = appToken;
        this.appScrect = appScrect;
        this.channelList = {};
        this.mqttClient = null;

        _.each(sysChannels,(item)=>{
            this.channelList[item] = {
                '$update':(payload) => {this.sendBroadcast(item, '$update', payload.attribute, payload.payload)},
                '$notify':(payload) => {this.sendBroadcast(item, '$notify', payload.attribute, payload.payload)}
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

    initParser(channel,cmd,parser){
        this.channelList[channel][cmd] = parser;
    }

    getUUID(){
        return Math.random().toString(36).substr(2, 8);
    }

    sendRequest(target, channel, cmd, attribute, payload, options) {
        return new P((resolve, reject) => {
            let uuid = this.getUUID();

            let to = () => {
                this.removeAllListeners(uuid);
                reject({reason:'timeout'});
            };

            this.on(uuid,(payload) => {
                if(timer){
                    clearTimeout(timer);
                }

                this.removeAllListeners(uuid);
                resolve(payload);
            });
            let timer = setTimeout(to,options.timeout||5000);

            let topic = `/${this.appToken}/${target}/${channel}/${cmd}`;
            if (channel == '$iot') {
                topic += `/${payload.iotId}/${attribute}/${uuid}`;
            }
            else {
                topic += `/${uuid}`;
            }
            this.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);

        })
    };

    sendBroadcast(channel, cmd, attribute, payload, options) {
        let topic = `/${this.appToken}/${this.appToken}/${channel}/${cmd}`;
        if (channel == '$iot') {
            topic += `/${payload.iotId}/${attribute}`;
        }
        this.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };
}

module.exports = node;