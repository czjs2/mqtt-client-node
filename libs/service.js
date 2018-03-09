const P = require('bluebird');
const _ = require('lodash');
const common  = require('./common');
const BaseNode = require('./baseNode');

class Service extends BaseNode {

    constructor(appToken, appScrect, channel) {
        super(appToken, appScrect);
        this.subscribePatterns = [
            `/+/+/${channel || '+'}/$update/#`,
            `/+/+/${channel || '+'}/$rresp/#`,
            `/+/+/${channel || '+'}/$req/#`
        ];
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
        let error = this.validate({target, src, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return common.sendRequest(this, target, src, channel, '$rreq', customTopic, payload);
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
        let error = this.validate({target, src, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${params.messageId}`;
        return common.sendBroadcast(this, target, src, channel, '$resp', customTopic, payload);
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
        let error = this.validate({target, src, channel, params});
        if (error) {
            return P.reject(error);
        }
        let customTopic = this.topic.combination(channel, params);
        return common.sendBroadcast(this, target, src, channel, '$notify', customTopic, payload, options);
    };

    //验证target, src, channel, params的值是否是空的
    validate({target, src, channel, params}) {
        let error = '';
        if (!target) {
            error = 'target is undefined';
            return error;
        }
        if (!src) {
            error = 'src is undefined';
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

module.exports = Service;