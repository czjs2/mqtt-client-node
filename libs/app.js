const BaseNode = require('./baseNode');
const sender = require('./sender');
const P = require('bluebird');
const _ = require('lodash');

class App extends BaseNode {

    constructor(appToken, appScrect, options = {}) {
        options = _.isObject(options) ? options : {};
        const {channel,subscribePatterns} = options;
        options.subscribePatterns = subscribePatterns || [
            `/${appToken}/+/${channel || '+'}/$resp/#`,
            `/${appToken}/+/${channel || '+'}/$rreq/#`,
            `/${appToken}/+/${channel || '+'}/$notify/#`
        ];
        super(appToken, appScrect, options);
        this.channel = channel;
    }

    init(appToken, appScrect, options = {}) {
        options = _.isObject(options) ? options : {};
        super.init(appToken, appScrect, options);
        const {channel,subscribePatterns} = options;
        this.channel = channel;
        this.subscribePatterns  = subscribePatterns || [
            `/${appToken}/+/${channel || '+'}/$resp/#`,
            `/${appToken}/+/${channel || '+'}/$rreq/#`,
            `/${appToken}/+/${channel || '+'}/$notify/#`
        ];
    }

    /**
     * 发送req请求到service.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object/string} payload eg.{}
     * @param {object} options eg.{timeout: 1000}
     * @return {Promise}.
     */
    req({tar, channel, params, payload, options}) {
        channel = channel || this.channel;
        let validateError = this.validate({src:"#",tar, channel, params});
        if (validateError) {
            return P.reject(validateError);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendRequest(this, this.appToken, tar, channel, '$req', customTopic, payload, options).then((result) => {
            if (result.error) {
                return P.reject(result.error);
            }
            else {
                return P.resolve(result);
            }
        });
    }

    /**
     * 发送rresp请求到service.
     *
     * @param {string} tar eg.'aaaa'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {string} messageId eg.'aaa'
     * @param {object/string} payload eg.{}
     * @param {object/string} error eg.'error'
     * @return {Promise}.
     */
    rresp({tar, channel, params, messageId, payload, error}) {
        channel = channel || this.channel;
        let validateError = this.validate({src:"#",tar, channel, params});
        if (validateError) {
            return P.reject(validateError);
        }
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${messageId}`;
        return sender.sendBroadcast(this, this.appToken, tar, channel, '$rresp', customTopic, payload, error);
    }

    /**
     * 上报数据到service.
     *
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object} payload eg.{}
     * @param {string} error eg.'error'
     * @param {object/string} options eg.{type: s}
     * @param {object} mqttOptions eg.{qos: 0, retain: 0}
     * @return {Promise}.
     */
    update({channel, params, payload, error, options}, mqttOptions = {qos: 0, retain: 0}) {
        channel = channel || this.channel;
        let validateError = this.validate({tar: "#",src:"#", channel, params});
        if (validateError) {
            return P.reject(validateError);
        }
        let customTopic = this.topic.combination(channel, params);
        return sender.sendBroadcast(this, this.appToken, this.appToken, channel, '$update', customTopic, payload, error, options, mqttOptions);
    };

    /**
     * iot设备上报数据到service.
     *
     * @param {string} attrs eg.{1: {type: 's', payload: 'aaa'}}
     * @param {object} params eg.{iotId: 'aaa'}
     * @param {object} mqttOptions eg.{qos: 0, retain: 0}
     * @return {Promise}.
     */
    soeIotAttrs({attrs, params},mqttOptions) {
        _.each(attrs, (item, key) => {
            this.update({channel: '$iot', params: {iotId: params.iotId, attribute: key}, payload: item.payload, options: {type: item.type}},mqttOptions);
        });
    };
}

module.exports = App;