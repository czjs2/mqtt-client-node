const EventEmitter = require('events');
const vm = require('vm');

const mqtt = require('mqtt');
const _ = require('lodash');
const P = require('bluebird');

class node extends EventEmitter{
    constructor(nodeId){
        super();
        this.nodeId = nodeId;
        this.RequestParser = {};
        this.BroadcastParsers = {};
    }

    init(brokerAddress){
        return new P((resolve,reject)=>{
            this.client = mqtt.connect(brokerAddress);
            this.client.on('message',(topic,payload)=>{
                let topicParser = topic.split('/');

                let channel = topicParser[0];
                let action = topicParser[1];
                let sender = topicParser[2];
                let uuid = topicParser[3] || topicParser[2];

                let script = new vm.Script(" msg = " + payload.toString());
                let obj = {};
                try{
                    script.runInNewContext(obj);
                }
                catch (e){

                }

                let msg = obj.msg || {} ;

                if(channel == this.nodeId){
                    if(action == '$Reponse'){
                        this.emit(uuid,msg.payload);
                    }
                    else {
                        if(this.RequestParser && this.RequestParser[action]){
                            let retTopic = sender+'/$Reponse/'+uuid;
                            this.RequestParser[action].call(this.RequestParser,msg.payload).then((response)=>{
                                this.client.publish(retTopic,JSON.stringify({payload:{data:response}}));
                            }).catch((e)=>{
                                this.client.publish(retTopic,JSON.stringify({payload:{reason:e.message||e}}));
                            })
                        }
                    }
                }
                else {
                    let bp = this.broadcastParser[channel]
                    if(bp){
                        bp[action].call(bp,msg.payload,msg.sender);
                    }
                }

            });


            this.client.on('connect',()=>{
                this.client.subscribe(this.nodeId+'/#');
                resolve(this);
            });
        })


    }

    addRequestParser(parser){
        if(_.isObject(parser)){
            this.RequestParser = parser;
        }
    }

    addBroadcastParser(channel,parser){
        if(channel && _.isObject(parser)){
            this.BroadcastParsers[channel] = parser;
            this.client.subscribe(channel+'/#')
        }
    }

    getUUID(){
        return Math.random().toString(36).substr(2, 8);
    }

    sendRequest(receiver,action,payload,options={}){

        return new P((resolve, reject) => {

            let uuid = this.getUUID();

            let to = ()=>{
                this.removeAllListeners(uuid);
                reject({reason:'timeout'})
            };


            this.on(uuid,(payload) =>{
                if(timer){
                    clearTimeout(timer);
                }

                this.removeAllListeners(uuid);
                if(payload.reason){
                    reject(payload.reason);
                }
                else {
                    resolve(payload.data);
                }

            });
            let timer = setTimeout(to,options.timeout||3000);
            this.client.publish(receiver+'/'+action+'/'+this.nodeId+'/'+uuid,JSON.stringify({payload:payload}));

        })
    }

    sendBroadcast(channel,action,payload){
        this.client.publish(channel+'/'+action,JSON.stringify({payload:payload}));
    }
}

module.exports = node;