const P = require('bluebird');

class Common {

    constructor(mqttNode) {
        this.mqttNode = mqttNode;
    }

    getUUID(){
        return Math.random().toString(36).substr(2, 8);
    }

    sendRequest(src, target, channel, cmd, id, attribute, payload, options = {}) {
        return new P((resolve, reject) => {
            let uuid = this.getUUID();

            let to = () => {
                this.mqttNode.removeAllListeners(uuid);
                reject({reason:'timeout'});
            };

            this.mqttNode.on(uuid,(payload) => {
                if(timer){
                    clearTimeout(timer);
                }

                this.mqttNode.removeAllListeners(uuid);
                resolve(payload);
            });
            let timer = setTimeout(to,options.timeout||5000);

            let topic = `/${src}/${target}/${channel}/${cmd}`;
            if (channel == '$iot') {
                topic += `/${id}/${attribute}/${uuid}`;
            }
            else {
                topic += `/${id}/${uuid}`;
            }
            this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);

        })
    };

    sendResponse(src, target, channel, cmd, id, attribute, messageId, payload, options = {}) {
        let topic = `/${src}/${target}/${channel}/${cmd}`;
        if (channel == '$iot') {
            topic += `/${id}/${attribute}/${messageId}`;
        }
        else {
            topic += `/${id}/${messageId}`;
        }
        this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };

    sendBroadcast(channel, cmd, id, attribute, payload, options = {}) {
        let topic = `/${this.mqttNode.appToken}/${this.mqttNode.appToken}/${channel}/${cmd}`;
        if (channel == '$iot') {
            topic += `/${id}/${attribute}`;
        }
        else {
            topic += `/${id}`;
        }
        this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };
}

module.exports = Common;