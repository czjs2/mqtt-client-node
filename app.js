const BaseNode = require('./baseNode');
const Common = require('./common');

class App extends BaseNode {

    constructor(appToken, appScrect) {
        super(appToken, appScrect);
        this.subscribePatterns = [
            `/${appToken}/+/+/$resp/#`,
            `/${appToken}/+/+/$rreq/#`,
            `/${appToken}/+/+/$notify/+/+`
        ];
    }

    req(target, channel, params, payload) {
        let common = new Common(this);
        let customTopic = this.topic.combination(channel, params);
        return common.sendRequest(this.appToken, target, channel, '$req', customTopic, payload);
    }

    rresp(target, channel, params, payload) {
        let common = new Common(this);
        let customTopic = this.topic.combination(channel, params);
        customTopic += `/${params.messageId}`;
        common.sendBroadcast(this.appToken, target, channel, '$rresp', customTopic, payload);
    }

    update(channel, params, payload) {
        let common = new Common(this);
        let customTopic = this.topic.combination(channel, params);
        common.sendBroadcast(this.appToken, this.appToken, channel, '$update', customTopic, payload);
    };
}

module.exports = App;