const _ = require('lodash');

class Topic {

    constructor() {
        this.topicRule = {
            $iot: ['iotId','attribute'],
            $circle: ['circleId']
        };
    }

    /**
     * topic解析器.
     *
     * @param {string} channel eg.'$iot'
     * @param {array} topicParser eg.['aaa', 'bbb']
     * @return {object}. eg.{iotId: 'aaa', attribute: 'bbb'}
     */
    parser(channel, topicParser) {
        let rule = this.topicRule[channel];
        let result = {};

        _.each(rule,(item, index) => {
            result[item] = topicParser[index];
        });
        result.messageId = rule ? topicParser[rule.length] : undefined;

        return result;
    }

    /**
     * topic拼接.
     *
     * @param {string} channel eg.'$iot'
     * @param {object} payload eg.{iotId: 'aaa', attribute: 'bbb'}
     * @return {string}. eg.'/aaa/bbb'
     */
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