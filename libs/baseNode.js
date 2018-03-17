const EventEmitter = require('events');
const vm = require('vm');

const mqtt = require('mqtt');
const _ = require('lodash');
const P = require('bluebird');
const Topic = require('./topic');

class node extends EventEmitter {

    constructor(appToken, appScrect, subscribePatterns) {
        super();
        this.appToken = appToken;
        this.appScrect = appScrect;
        this.mqttClient = null;
        this.subscribePatterns = subscribePatterns || [`/${appToken}/#`];
        this.topic = new Topic();
    }

    /**
     * 验证器,验证tar, src, channel, params的值是否是空的
     */
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

    /**
     * 连接mqtt总线
     *
     * @param {string} address eg.'mqtt://localhost'
     * @param {object} options eg.{}
     * @return {Promise}.
     */
    connect(address, options = {}) {
        return new P((resolve,reject) => {
            options.username = this.appToken;
            options.password = this.appScrect;

            this.mqttClient = mqtt.connect(address, options);
            this.mqttClient.on('message',(topic, message) => {
                let topicParser = topic.split('/');

                let src = topicParser[1];
                let tar = topicParser[2];
                let channel = topicParser[3];
                let cmd = topicParser[4];

                let script = new vm.Script(" msg = " + message.toString());
                let obj = {};
                try{
                    script.runInNewContext(obj);
                }
                catch (e){
                    console.log(e);
                }

                let msg = obj.msg || {};

                let data = _.extend({
                    src: src,
                    tar: tar,
                    channel: channel,
                    cmd: cmd
                }, msg);

                _.pullAt(topicParser,[0,1,2,3,4]);
                let result = this.topic.parser(data, topicParser);

                if (cmd == '$resp' || cmd == '$rresp') {
                    this.emit(result.messageId, result);
                }
                this.emit(channel, result);
                this.emit(cmd, result);
                this.emit(channel+'-'+cmd, result);
            });

            this.mqttClient.on('connect',(e) => {
                this.mqttClient.subscribe(this.subscribePatterns);
                resolve(this);
            });

            this.mqttClient.on('reconnect',(e) => {
                this.emit('mqttReconnect');
            });

            this.mqttClient.on('error',(e) => {
                if (e.code == 5) {
                    this.emit('noAuth');
                }
                this.emit('mqttError',e);
            });
        })
    }

    /**
     * mqttClient结束进程
     *
     * @param {bool} force eg.true/false
     * @param {function} cb eg.()=>{}
     */
    end(force, cb) {
        if (this.mqttClient) {
            this.mqttClient.end(force, cb);
        }
    }
}

module.exports = node;