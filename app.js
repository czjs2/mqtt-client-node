import BaseNode from './baseNode';
import Common from 'common';

class App extends BaseNode {

    constructor(appToken, appScrect) {
        super(appToken, appScrect);
        this.subs = [
            `/${appToken}/+/$iot/$resp/+/+/+`,
            `/${appToken}/+/$iot/$notify/+/+`
        ];
    }

    req(target, attribute, payload) {
        let common = new Common(this);
        return common.sendRequest(target, '$iot', '$req', attribute, payload);
    }

    update(channel, attribute, payload) {
        let common = new Common(this);
        common.sendBroadcast(channel, '$update', attribute, payload);
    };
}