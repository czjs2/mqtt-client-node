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

    req(target, channel, id, attribute, payload) {
        let common = new Common(this);
        return common.sendRequest(this.appToken, target, channel, '$req', id, attribute, payload);
    }

    rresp(target, channel, id, attribute, messageId, payload) {
        let common = new Common(this);
        common.sendResponse(this.appToken, target, channel, '$rresp', id, attribute, messageId, payload);
    }

    update(channel, id, attribute, payload) {
        let common = new Common(this);
        common.sendBroadcast(channel, '$update', id, attribute, payload);
    };
}

module.exports = App;