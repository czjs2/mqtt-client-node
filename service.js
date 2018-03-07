import BaseNode from './baseNode';
import Common from 'common';

class Service extends BaseNode {

    constructor(appToken, appScrect) {
        super(appToken, appScrect);
        this.subscribePatterns = [
            `/+/+/+/$update/#`,
            `/+/+/+/$rresp/#`,
            `/+/+/+/$req/#`
        ];
    }

    rreq(target, channel, attribute, payload) {
        let common = new Common(this);
        return common.sendRequest(target, channel, '$rreq', attribute, payload);
    }

    resp(target, channel, attribute, messageId, payload) {
        let common = new Common(this);
        common.sendResponse(target, channel, '$resp', attribute, messageId, payload);
    }

    notify(channel, attribute, payload) {
        let common = new Common(this);
        common.sendBroadcast(channel, '$notify', attribute, payload);
    };
}