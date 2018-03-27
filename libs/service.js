const P = require('bluebird');
const _ = require('lodash');
const sender  = require('./sender');
const BaseNode = require('./baseNode');

class Service extends BaseNode {

    constructor(appToken, appScrect, options = {}) {
        options = _.isObject(options) ? options : {};
        const {channel,subscribePatterns} = options;
        options.subscribePatterns = subscribePatterns || [
            `/+/+/${channel || '+'}/$update/#`,
            `/+/+/${channel || '+'}/$rresp/#`,
            `/+/+/${channel || '+'}/$req/#`
        ];
        super(appToken, appScrect, options);
        this.channel = channel;
    }

    init(appToken, appScrect, options = {}) {
        options = _.isObject(options) ? options : {};
        super.init(appToken, appScrect, options);
        const {channel,subscribePatterns} = options;
        this.channel = channel;
        this.subscribePatterns = subscribePatterns || [
            `/+/+/${channel || '+'}/$update/#`,
            `/+/+/${channel || '+'}/$rresp/#`,
            `/+/+/${channel || '+'}/$req/#`
        ];
    }

    /**
     * service监听req，发送rreq.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} src eg.'bbbb'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object/string} payload eg.{}
     * @param {object} options eg.{timeout: 1000}
     * @return {Promise}.
     */
    rreq({tar, src, channel, params, payload, options}) {
        channel = channel || this.channel;
        let validateError = this.validate({tar, src, channel , params});
        if (validateError) {
            return P.reject(validateError);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendRequest(this, tar, src, channel, '$rreq', customTopic, payload, options);
    }

    /**
     * service监听rresq,发送resp响应.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} src eg.'bbbb'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {string} messageId eg.'aaa'
     * @param {object/string} payload eg.{}
     * @param {string} error eg.'error'
     * @return {Promise}.
     */
    resp({tar, src, channel, params, messageId, payload, error}) {
        channel = channel || this.channel;
        let validateError = this.validate({tar, src, channel, params});
        if (validateError) {
            return P.reject(validateError);
        }
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${messageId}`;
        return sender.sendBroadcast(this, tar, src, channel, '$resp', customTopic, payload, error);
    }

    /**
     * service发送notify通知.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} src eg.'bbbb'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object/string} payload eg.{}
     * @param {string} error eg.'error'
     * @param {object} options eg.{type: s}
     * @param {object} mqttOptions eg.{qos: 0, retain: 0}
     * @return {Promise}.
     */
    notify({tar, src, channel, params, payload, error, options},mqttOptions = {qos: 0, retain: 0}) {
        channel = channel || this.channel;
        let validateError = this.validate({tar, src, channel, params});
        if (validateError) {
            return P.reject(validateError);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendBroadcast(this, tar, src, channel, '$notify', customTopic, payload, error, options, mqttOptions);
    };
}

module.exports = Service;