import BaseNode from './baseNode';
import Common from 'common';

class Service extends BaseNode {

    constructor(appToken, appScrect) {
        super(appToken, appScrect);
        this.subs = [
            `/${appToken}/+/$iot/$update/+/+`,
            `/${appToken}/+/$iot/$rresp/+/+/+`
        ];
    }

    rreq(target, attribute, payload) {
        let common = new Common(this);
        return common.sendRequest(target, '$iot', '$rreq', attribute, payload);
    }

    notify(channel, attribute, payload) {
        let common = new Common(this);
        common.sendBroadcast(channel, '$notify', attribute, payload);
    };
}