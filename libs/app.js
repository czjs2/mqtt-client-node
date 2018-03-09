const BaseNode = require('./baseNode');
const common = require('./common');
const P = require('bluebird');
const _ = require('lodash');

class App extends BaseNode {

    constructor(appToken, appScrect, channel) {
        super(appToken, appScrect);
        this.subscribePatterns = [
            `/${appToken}/+/${channel || '+'}/$resp/#`,
            `/${appToken}/+/${channel || '+'}/$rreq/#`,
            `/${appToken}/+/${channel || '+'}/$notify/+/+`
        ];
        this.channel = channel;
    }

    /**
     * 发送req请求到service.
     *
     * @param {string} target eg.'aaaa'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb'}
     * @param {object} payload eg.{}
     * @return {Promise}.
     */
    req({target, channel, params, payload}) {
        let error = this.validate({target, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return common.sendRequest(this, this.appToken, target, channel, '$req', customTopic, payload);
    }

    /**
     * 发送rresp请求到service.
     *
     * @param {string} target eg.'aaaa'
     * @param {string} channel eg.'$iot'
     * @param {object} params eg.{iotId: 'aaa', attribute: 'bbb', messageId: 'aaa'}
     * @param {object} payload eg.{}
     * @return {Promise}.
     */
    rresp({target, channel, params, payload}) {
        let error = this.validate({target, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${params.messageId}`;
        return common.sendBroadcast(this, this.appToken, target, channel, '$rresp', customTopic, payload);
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
        let error = this.validate({target: this.appToken, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return common.sendBroadcast(this, this.appToken, this.appToken, channel, '$update', customTopic, payload, options);
    };

    //验证target, channel, params的值是否是空的
    validate({target, channel, params}) {
        let error = '';
        if (!target) {
            error = 'target is undefined';
            return error;
        }
        if (!channel) {
            error = 'channel is undefined';
            return error;
        }
        if (_.isEmpty(params)) {
            error = 'params is empty';
        }
        return error;
    }
}

module.exports = App;