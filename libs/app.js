const BaseNode = require('./baseNode');
const sender = require('./sender');
const P = require('bluebird');
const _ = require('lodash');

class App extends BaseNode {

    constructor(appToken, appScrect, channel) {
        let subscribePatterns  = [
            `/${appToken}/+/${channel || '+'}/$resp/#`,
            `/${appToken}/+/${channel || '+'}/$rreq/#`,
            `/${appToken}/+/${channel || '+'}/$notify/#`
        ];
        super(appToken, appScrect,subscribePatterns);
        this.channel = channel;
    }

    /**
     * 发送req请求到service.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object} payload eg.{}
     * @return {Promise}.
     */
    req({tar, channel, params, payload}) {
        channel = channel || this.channel;
        let error = this.validate({src:"#",tar, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendRequest(this, this.appToken, tar, channel, '$req', customTopic, payload);
    }

    /**
     * 发送rresp请求到service.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb', messageId: 'aaa'}
     * @param {object} payload eg.{}
     * @return {Promise}.
     */
    rresp({src, channel, params, payload}) {
        channel = channel || this.channel;
        let error = this.validate({tar:"#",src, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${params.messageId}`;
        return sender.sendBroadcast(this, this.appToken, src, channel, '$rresp', customTopic, payload);
    }

    /**
     * 上报数据到service.
     *
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object} payload eg.{}
     * @param {object} options eg.{retain: false}
     * @return {Promise}.
     */
    update({channel, params, payload, options}) {
        channel = channel || this.channel;
        let error = this.validate({tar: this.appToken,src:"#", channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendBroadcast(this, this.appToken, this.appToken, channel, '$update', customTopic, payload, options);
    };

}

module.exports = App;