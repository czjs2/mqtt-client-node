# mqtt-client-node

## 介绍
mqtt-client-node基于[MQTT](http://mqtt.org/)协议，按照定义的协议接入总线，实现订阅和发布的功能。使用mqtt-client-node需在智能网关后台
管理平台注册应用。

## 协议规则
topic: '/appToken/tar_appToken/channel/cmd/#'

| key        | value           |
| :------------- |:-------------|
| appToken | 应用的appToken |
| tar_appToken | 目标appToken |
| channel | 目前只有'$iot','$circle' |
| cmd | '$update','$notify','$req','$rreq','$resp','$rresp' |
| # | 自定义层，根据不同的channel产生不同的结果，列：channel='$iot'，自定义层可能为'/iotId/attribute/messageId'或'/iotId/attribute'。channel='$circle'，自定义层可能为'/circleId/messageId'或'/circleId' |

## 安装

```sh
npm install mqtt-client-node --save
```

## 例子
```javascript
const App = require('mqtt-client-node').app;
const app = new App('appToken','appScrect');
//如果你只想订阅有关$iot的消息
//const app = new App('appToken','appScrect','$iot');

app.connect('mqtt://localhost').then(() => {
  console.log('connect success');

  app.req({tar: 'tar_appToken', channel: '$iot', payload:{value: 'test'}}).then((result) => {
    console.log(result);
  });
});

const Service = require('mqtt-client-node').service;
const service = new Service('appToken','appScrect');

service.connect('mqtt://localhost').then(() => {
  console.log('connect success');

  service.notify({tar: 'tar_appToken', src: 'src_appToken', channel: '$iot', payload:{value: 'test'}}).then((result) => {
    console.log(result);
  });
});
```

## api
* <a href="#connect"><code>init()</code></a>
* <a href="#connect"><code>connect()</code></a>
* <a href="#req"><code>app.<b>req()</b></code></a>
* <a href="#rresp"><code>app.<b>rresp()</b></code></a>
* <a href="#update"><code>app.<b>update()</b></code></a>
* <a href="#soeIotAttrs"><code>app.<b>soeIotAttrs()</b></code></a>
* <a href="#rreq"><code>service.<b>rreq()</b></code></a>
* <a href="#resp"><code>service.<b>resp()</b></code></a>
* <a href="#notify"><code>service.<b>notify()</b></code></a>

<a name="init"></a>
### init(appToken, appScrect, [channel])
对连接mqtt总线验证的数据进行初始化。
* appToken 注册应用的appToken
* appScrect 注册应用的appScrect
* channel 需要订阅的对象$iot/$circle。这个是选择项。

<a name="connect"></a>
### connect(address, [options])
连接mqtt总线，address为总线地址。
* address 总线地址
* options 注册应用的appScrect。这个是选择项。

<a name="req"></a>
### app.req({tar, channel, params, [payload], [options]})
app向service发送请求，获取tar的返回的数据。
* tar 目标应用的appToken
* channel '$iot','$circle'
* params '$iot': {'iotId','attribute'}, '$circle': {'circleId'}
* payload 传输的数据体。这个是选择项。
* options {timeout: 1000}。这个是选择项。

<a name="rresp"></a>
### app.rresp({tar, channel, params, messageId, [payload], [error]})
app向service发送tar的需要的数据。
* tar 目标应用的appToken
* channel '$iot','$circle'
* params '$iot': {'iotId','attribute'}, '$circle': {'circleId'}
* messageId service发送rreq生成的messageId
* payload 传输的数据体。这个是选择项。
* error 错误信息 eg.'error message'。这个是选择项。

<a name="update"></a>
### app.update({channel, params, [payload], [error], [options]}, [mqttOptions])
app上报数据给service。
* channel '$iot','$circle'
* params '$iot': {'iotId','attribute'}, '$circle': {'circleId'}
* payload 传输的数据体。这个是选择项。
* options {type: 's'}。这个是选择项。
* mqttOptions mqtt.publish配置，见[mqtt.publish()](https://github.com/mqttjs/MQTT.js#publish)。这个是选择项。

<a name="soeIotAttrs"></a>
### app.soeIotAttrs({attrs, params}, [mqttOptions])
iot设备上报数据给service。
* attrs {1: {type: 's', payload: 'aaa'}}
* params {iotId: 'aaa'}
* mqttOptions mqtt.publish配置，见[mqtt.publish()](https://github.com/mqttjs/MQTT.js#publish)。这个是选择项。

<a name="rreq"></a>
### service.rreq({tar, src, channel, params, [payload], [options]})
service向tar发送rreq请求，获取tar的返回的数据。
* tar 目标应用的appToken
* src 发送req请求来源的appToken
* channel '$iot','$circle'
* params '$iot': {'iotId','attribute'}, '$circle': {'circleId'}
* payload 传输的数据体。这个是选择项。
* options {timeout: 1000}。这个是选择项。

<a name="resp"></a>
### service.resp({tar, src, channel, params, messageId, [payload], [error]})
service向tar发送src返回的数据。
* tar 目标应用的appToken
* src rreq接收返回数据来源的appToken
* channel '$iot','$circle'
* params '$iot': {'iotId','attribute'}, '$circle': {'circleId'}
* messageId 接收req来源的messageId
* payload 传输的数据体。这个是选择项。
* error 错误信息 eg.'error message'。这个是选择项。

<a name="notify"></a>
### service.notify({tar, src, channel, params, [payload], [error], [options]}, [mqttOptions])
service向tar发送通知。
* tar 目标应用的appToken
* src 来源的appToken
* channel '$iot','$circle'
* params '$iot': {'iotId','attribute'}, '$circle': {'circleId'}
* payload 传输的数据体。这个是选择项。
* error 错误信息 eg.'error message'。这个是选择项。
* options {type: 's'}。这个是选择项。
* mqttOptions mqtt.publish配置，见[mqtt.publish()](https://github.com/mqttjs/MQTT.js#publish)。这个是选择项。

## License
MIT
