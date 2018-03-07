import BaseNode from './baseNode';
import Common from 'common';

class App extends BaseNode {

    constructor(appToken, appScrect) {
        super(appToken, appScrect);
        this.subscribePatterns = [
            `/${appToken}/+/+/$resp/#`,
            `/${appToken}/+/+/$rreq/#`,
            `/${appToken}/+/+/$notify/+/+`
        ];
    }

    req(target, channel, attribute, payload) {
        let common = new Common(this);
        return common.sendRequest(target, channel, '$req', attribute, payload);
    }

    rresp(target, channel, attribute, messageId, payload) {
        let common = new Common(this);
        common.sendResponse(target, channel, '$rresp', attribute, messageId, payload);
    }

    update(channel, attribute, payload) {
        let common = new Common(this);
        common.sendBroadcast(channel, '$update', attribute, payload);
    };
}