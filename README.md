# mqtt-client-node

## 安装

```sh
npm install mqtt-client-node --save
```

## 例子
```javascript
const App = require('mqtt-client-node').app;
const app = new App('appToken','appScrect');

app.connect('mqtt://localhost').then(() => {
  console.log('connect success');
});

app.req({tar: 'tar_appToken', channel: '$iot', payload:{value: 'test'}}).then((result) => {
  console.log(result);
})
```

## api
* connect()
* app.req()
* app.rresp()
* app.update()
* service.rreq()
* service.resp()
* service.notify()

## License
MIT
