class Common {

    constructor(mqttNode) {
        this.mqttNode = mqttNode;
    }

    getUUID(){
        return Math.random().toString(36).substr(2, 8);
    }

    sendRequest(target, channel, cmd, attribute, payload, options) {
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

            let topic = `/${this.mqttNode.appToken}/${target}/${channel}/${cmd}`;
            if (channel == '$iot') {
                topic += `/${payload.iotId}/${attribute}/${uuid}`;
            }
            else {
                topic += `/${uuid}`;
            }
            this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);

        })
    };

    sendResponse(target, channel, cmd, attribute, messageId, payload, options) {
        let topic = `/${this.mqttNode.appToken}/${target}/${channel}/${cmd}`;
        if (channel == '$iot') {
            topic += `/${payload.iotId}/${attribute}/${messageId}`;
        }
        else {
            topic += `/${messageId}`;
        }
        this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };

    sendBroadcast(channel, cmd, attribute, payload, options) {
        let topic = `/${this.mqttNode.appToken}/${this.mqttNode.appToken}/${channel}/${cmd}`;
        if (channel == '$iot') {
            topic += `/${payload.iotId}/${attribute}`;
        }
        this.mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };
}

module.exports = Common;