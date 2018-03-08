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

    rreq(src, target, channel, id, attribute, payload) {
        let common = new Common(this);
        return common.sendRequest(src, target, channel, '$rreq', id, attribute, payload);
    }

    resp(src, target, channel, id, attribute, messageId, payload) {
        let common = new Common(this);
        common.sendResponse(src, target, channel, '$resp', id, attribute, messageId, payload);
    }

    notify(channel, id, attribute, payload) {
        let common = new Common(this);
        common.sendBroadcast(channel, '$notify', id, attribute, payload);
    };
}

module.exports = Service;