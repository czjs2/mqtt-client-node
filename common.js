class Common {

    constructor(node) {
        this.node = node;
    }

    getUUID(){
        return Math.random().toString(36).substr(2, 8);
    }

    sendRequest(target, channel, cmd, attribute, payload, options) {
        return new P((resolve, reject) => {
            let uuid = this.getUUID();

            let to = () => {
                this.node.removeAllListeners(uuid);
                reject({reason:'timeout'});
            };

            this.node.on(uuid,(payload) => {
                if(timer){
                    clearTimeout(timer);
                }

                this.node.removeAllListeners(uuid);
                resolve(payload);
            });
            let timer = setTimeout(to,options.timeout||5000);

            let topic = `/${this.node.appToken}/${target}/${channel}/${cmd}`;
            if (channel == '$iot') {
                topic += `/${payload.iotId}/${attribute}/${uuid}`;
            }
            else {
                topic += `/${uuid}`;
            }
            this.node.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);

        })
    };

    sendBroadcast(channel, cmd, attribute, payload, options) {
        let topic = `/${this.node.appToken}/${this.node.appToken}/${channel}/${cmd}`;
        if (channel == '$iot') {
            topic += `/${payload.iotId}/${attribute}`;
        }
        this.node.mqttClient.publish(topic, JSON.stringify({payload:payload}), options);
    };
}