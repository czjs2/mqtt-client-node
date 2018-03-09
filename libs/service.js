const P = require('bluebird');
const _ = require('lodash');
const sender  = require('./sender');
const BaseNode = require('./baseNode');

class Service extends BaseNode {

    constructor(appToken, appScrect, channel) {
        let subscribePatterns = [
            `/+/+/${channel || '+'}/$update/#`,
            `/+/+/${channel || '+'}/$rresp/#`,
            `/+/+/${channel || '+'}/$req/#`
        ];
        super(appToken, appScrect ,subscribePatterns);
        this.channel = channel;
    }

    /**
     * service监听req，发送rreq.
     *
     * @param {string} target eg.'aaaa'
     * @param {string} src eg.'bbbb'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object} payload eg.{}
     * @return {Promise}.
     */
    rreq({target, src, channel, params, payload}) {
        channel = channel || this.channel;
        let error = this.validate({target, src, channel , params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendRequest(this, target, src, channel, '$rreq', customTopic, payload);
    }

    /**
     * service监听rresq,发送resp响应.
     *
     * @param {string} target eg.'aaaa'
     * @param {string} src eg.'bbbb'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb', messageId: 'aaa'}
     * @param {object} payload eg.{}
     * @return {Promise}.
     */
    resp({target, src, channel, params, payload}) {
        channel = channel || this.channel;
        let error = this.validate({target, src, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${params.messageId}`;
        return sender.sendBroadcast(this, target, src, channel, '$resp', customTopic, payload);
    }

    /**
     * service发送notify通知.
     *
     * @param {string} target eg.'aaaa'
     * @param {string} src eg.'bbbb'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb', messageId: 'aaa'}
     * @param {object} payload eg.{}
     * @param {object} options eg.{retain: false}
     * @return {Promise}.
     */
    notify({target, src, channel, params, payload, options}) {
        channel = channel || this.channel;
        let error = this.validate({target, src, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendBroadcast(this, target, src, channel, '$notify', customTopic, payload, options);
    };


}

module.exports = Service;