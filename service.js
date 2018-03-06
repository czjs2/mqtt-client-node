import BaseNode from './baseNode';

class Service extends BaseNode {

    rreq(target, attribute, payload) {
        return this.sendRequest(target, '$iot', '$rreq', attribute, payload);
    }

    notify(channel, attribute, payload) {
        this.sendBroadcast(channel, '$notify', attribute, payload);
    };
}