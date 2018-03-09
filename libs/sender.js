const P = require('bluebird');

class Common {

    sendRequest(mqttNode, appToken, tar, channel, cmd, customTopic, payload, options = {}) {
        return new P((resolve, reject) => {
            let uuid = Math.random().toString(36).substr(2, 8);

            let to = () => {
                mqttNode.removeAllListeners(uuid);
                reject({reason:'timeout'});
            };

            mqttNode.on(uuid,(payload) => {
                if(timer){
                    clearTimeout(timer);
                }

                mqttNode.removeAllListeners(uuid);
                resolve(payload);
            });
            let timer = setTimeout(to,options.timeout||5000);

            let topic = `/${appToken}/${tar}/${channel}/${cmd}`;
            topic += customTopic;
            topic += `/${uuid}`;

            mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options,(err) => {
                if (err) {
                    reject(err);
                }
            });
        })
    };

    sendBroadcast(mqttNode, appToken, tar, channel, cmd, customTopic, payload, options = {}) {
        return new P((resolve, reject) => {
            let topic = `/${appToken}/${tar}/${channel}/${cmd}`;
            topic += customTopic;
            mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    };
}

module.exports = new Common();