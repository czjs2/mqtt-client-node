const P = require('bluebird');

class Common {

    constructor(mqttNode) {
        this.mqttNode = mqttNode;
    }

    getUUID(){
        return Math.random().toString(36).substr(2, 8);
    }

    sendRequest(appToken, target, channel, cmd, customTopic, payload, options = {}) {
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

            let topic = `/${appToken}/${target}/${channel}/${cmd}`;
            topic += customTopic;
            topic += `/${uuid}`;

            this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
        })
    };

    sendBroadcast(appToken, target, channel, cmd, customTopic, payload, options = {}) {
        let topic = `/${appToken}/${target}/${channel}/${cmd}`;
        topic += customTopic;
        this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };
}

module.exports = Common;