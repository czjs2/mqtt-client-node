const _ = require('lodash');

class Topic {

    constructor() {
        this.topicRule = {
            $iot: ['iotId','attribute'],
            $circle: ['circleId']
        };
    }

    //topic解析器
    parser(channel, topicParser) {
        let rule = this.topicRule[channel];
        let result = {};

        _.each(rule,(item, index) => {
            result[item] = topicParser[index];
        });
        result.messageId = rule ? topicParser[rule.length] : undefined;

        return result;
    }

    //topic组合
    combination(channel, payload) {
        let rule = this.topicRule[channel];
        let result = '';

        _.each(rule, (item) => {
            if (payload[item]) {
                result += `/${payload[item]}`;
            }
        });

        return result;
    }

}

module.exports = Topic;