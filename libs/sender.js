const P = require('bluebird');

class Sender {

    /**
     * 发送请求.
     *
     * @param {EventEmitter} mqttNode eg.'baseNode'
     * @param {string} src eg.'appToken'
     * @param {string} tar eg.'appToken'
     * @param {string} channel eg.'$iot'
     * @param {string} cmd eg.'$req'
     * @param {string} customTopic eg.'/aaaa/bbbb'
     * @param {object} payload eg.{}
     * @param {object} options eg.{retain: false}
     * @return {Promise}.
     */
    sendRequest(mqttNode, src, tar, channel, cmd, customTopic, payload, options = {}) {
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

            let topic = `/${src}/${tar}/${channel}/${cmd}`;
            topic += customTopic;
            topic += `/${uuid}`;

            mqttNode.mqttClient.publish(topic, JSON.stringify({payload:payload}), options,(err) => {
                if (err) {
                    reject(err);
                }
            });
        })
    };

    /**
     * 发送广播.
     *
     * @param {EventEmitter} mqttNode eg.'baseNode'
     * @param {string} src eg.'appToken'
     * @param {string} tar eg.'appToken'
     * @param {string} channel eg.'$iot'
     * @param {string} cmd eg.'$req'
     * @param {string} customTopic eg.'/aaaa/bbbb'
     * @param {object} payload eg.{}
     * @param {object} options eg.{retain: false}
     * @return {Promise}.
     */
    sendBroadcast(mqttNode, src, tar, channel, cmd, customTopic, payload, options = {}) {
        return new P((resolve, reject) => {
            let topic = `/${src}/${tar}/${channel}/${cmd}`;
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

module.exports = new Sender();