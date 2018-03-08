const BaseNode = require('./baseNode');
const Common  = require('./common');

class Service extends BaseNode {

    constructor(appToken, appScrect) {
        super(appToken, appScrect);
        this.subscribePatterns = [
            `/+/+/+/$update/#`,
            `/+/+/+/$rresp/#`,
            `/+/+/+/$req/#`
        ];
    }

    rreq(target, src, channel, params, payload) {
        let common = new Common(this);
        let customTopic = this.topic.combination(channel, params);
        return common.sendRequest(target, src, channel, '$rreq', customTopic, payload);
    }

    resp(target, src, channel, params, payload) {
        let common = new Common(this);
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${params.messageId}`;
        common.sendBroadcast(target, src, channel, '$resp', customTopic, payload);
    }

    notify(channel, params, payload) {
        let common = new Common(this);
        let customTopic = this.topic.combination(channel, params);
        common.sendBroadcast(this.appToken, this.appToken, channel, '$notify', customTopic, payload);
    };
}

module.exports = Service;