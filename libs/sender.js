const P = require('bluebird');
const _ = require('lodash');

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
     * @param {object/string} payload eg.{}
     * @param {object} options eg.{timeout: 1000}
     * @return {Promise}.
     */
    sendRequest(mqttNode, src, tar, channel, cmd, customTopic, payload, options = {}) {
        return new P((resolve, reject) => {
            let uuid = Math.random().toString(36).substr(2, 8);

            let to = () => {
                mqttNode.removeAllListeners(uuid);
                reject('timeout');
            };

            mqttNode.on(uuid,(result) => {
                if(timer){
                    clearTimeout(timer);
                }

                mqttNode.removeAllListeners(uuid);
                resolve(result);
            });
            let timer = setTimeout(to,options.timeout||5000);

            let topic = `/${src}/${tar}/${channel}/${cmd}`;
            topic += customTopic;
            topic += `/${uuid}`;

            let data = {};
            data.payload = payload;
            if (!_.isEmpty(options)) {
                data.options = options;
            }

            mqttNode.mqttClient.publish(topic, JSON.stringify(data), {}, (err) => {
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
     * @param {object/string} payload eg.{}
     * @param {string} error eg.'error'
     * @param {object} options eg.{type: s}
     * @param {object} mqttOptions eg.{retain: false}
     * @return {Promise}.
     */
    sendBroadcast(mqttNode, src, tar, channel, cmd, customTopic, payload, error, options = {}, mqttOptions) {
        return new P((resolve, reject) => {
            let topic = `/${src}/${tar}/${channel}/${cmd}`;
            topic += customTopic;

            let data = error ? {error: error} : {payload: payload};
            if (!_.isEmpty(options)) {
                data.options = options;
            }

            mqttNode.mqttClient.publish(topic, JSON.stringify(data), mqttOptions, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    };
}

module.exports = new Sender();