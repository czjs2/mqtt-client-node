import BaseNode from './baseNode';

class App extends BaseNode {

    req(target, attribute, payload) {
        return this.sendRequest(target, '$iot', '$req', attribute, payload);
    }

    update(channel, attribute, payload) {
        this.sendBroadcast(channel, '$update', attribute, payload);
    };
}