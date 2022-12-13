# broadcast-message选项

`new BroadcastMessage(opts)` 中的opts是一个对象它包含的选项和具体说明如下：

## channelId

指定BroadcastMessage的消息频道id，不同BroadcastMessage实例，只要channelId一致即可通信  
默认的channelId为"*" , 这意味着在不指定频道id的情况下，各个实例的消息都会发往同一个频道上

```javascript
new BroadcastMessage({
  channelId: '*',
})
```

## allowLocalBroadcast

允许既是消息的发送页，也可以是消息的接收页，从而做到同源同页收发消息  
postMessage、BroadcastChannel和storage事件都是必须一个页面发送，另一个页面接收  
而BroadcastMessage允许同页面收发消息，只需将allowLocalBroadcast设为true即可  

```javascript
new BroadcastMessage({
  allowLocalBroadcast: false,
})
```

## emitOriginalMessage

给 broadcastMessage.addEventListener("message", function (event) {}) 事件派发原始消息对象  
默认情况下，broadcastMessage.postMessage(msg) 中的 msg 等于接收到的 event.data，但其实为了能准确派送消息，
msg会被包装成有很多辅助参数的对象，如果你需要这些辅助参数信息，可以将emitOriginalMessage设为true

则收到的event.data将是如下的对象实体：  

```javascript
event.data = {
   data: msg,                   // 消息本体
   type: 'BroadcastMessage',    // 消息类型，默认为BroadcastMessage，其他类型，则是自定义消息或内部消息
   origin: '',                  // 消息来源的域名地址
   targetOrigin: '',            // 消息目标源的域名地址
   referrer: '',                // 消息来自哪个页面
   timeStamp: '',               // 消息发出时的时间戳
   transportType: '',           // 中转消息的载体类型，只可能为BroadcastMessage和localStorage
   allowLocalBroadcast: false,  // 该消息是否允许被同页面的BroadcastMessage实例接收到
   channelId: '*',              // 消息所属的频道id
   instanceId: 'xx_xx',         // 消息所属BroadcastMessage实例id
   debug: false                 // 是否为开启了调试选项的消息
}
```

```javascript
new BroadcastMessage({
  emitOriginalMessage: false,
})
```

## targetOrigin

指定消息发送的目标域，规则跟postMessage的targetOrigin一样  
但不同的是支持定义数组形式的targetOrigin，从而实现批量跨域数据发送  
当然如果是"*"的话就是给任意运行了本插件的页面发送数据
默认为 `location.origin`，即只可以在同域名的页面之间进行通信  

更多关于targetOrigin的详细说明，和相关的安全问题，参见：[postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

```javascript
new BroadcastMessage({
  targetOrigin: location.origin,
})
```

同时配置多个targetOrigin的示例：

```javascript
new BroadcastMessage({
  targetOrigin: ['https://domainA.xxx', 'https://domainB.xxx', ...],
})
```

## transportType

指定数据中转传输使用的传输类型，可选值：BroadcastChannel、localStorage  
不指定的话，优先使用BroadcastChannel，在不兼容BroadcastChannel的浏览器下使用localStorage  
无特需情况，不建议修改该项配置  

```javascript
new BroadcastMessage({
  transportType: 'BroadcastChannel',
})
```

## inTrustedDomainPages

标识BroadcastMessage实例是否处于可信域的页面上运行  
如果是，当前页面作为可信域的中介页嵌入到具体运行环境中  
该选项只在自定义可信域页面中使用，其他情况不要使用  

```javascript
new BroadcastMessage({
  inTrustedDomainPages: false,
})
```

## trustedDomainPages

指定作为消息中转的可信域页面地址，有需跨域通信需求才会用到该选项  
官方提供的可信域页面地址为：  
<https://broadcast-message.anzz.top/dist/pages/broadcast-message.html>  

需自定义可信域页面的，见[自定义可信域页面](/home/examples.md#自定义可信域页面)  

```javascript
new BroadcastMessage({
  trustedDomainPages: '',
})
```

## debug

标识是否开启调试选项  
当debug选项和emitOriginalMessage选项同时为true时，你在信息的接收端将能收到带有debug选项的信息，对于某些场景或许有所帮助

```javascript
new BroadcastMessage({
  debug: false,
})
```

## 完整选项

```javascript
const bmOpts = {
  /**
   * 指定BroadcastMessage的消息频道id，不同BroadcastMessage实例，只要channelId一致即可通信
   * 默认的channelId为"*" , 这意味着在不指定频道id的情况下，各个实例的消息都会发往同一个频道上
   */
  channelId: '*',

  /**
   * 允许既是消息的发送页，也可以是消息的接收页，从而做到同源同页收发消息
   * postMessage、BroadcastChannel和storage事件都是必须一个页面发送，另一个页面接收
   * 而BroadcastMessage允许同页面收发消息，只需将allowLocalBroadcast设为true即可
   */
  allowLocalBroadcast: false,

  /**
   * 给 broadcastMessage.addEventListener("message", function (event) {}) 事件派发原始消息对象
   * 默认情况下，broadcastMessage.postMessage(msg) 中的 msg 等于接收到的 event.data，但其实为了能准确派送消息，
   * msg会被包装成有很多辅助参数的对象，如果你需要这些辅助参数信息，可以将emitOriginalMessage设为true
   * 则收到的event.data将是如下的对象实体：
   * event.data = {
   *    data: msg,                   // 消息本体
   *    type: 'BroadcastMessage',    // 消息类型，默认为BroadcastMessage，其他类型，则是自定义消息或内部消息
   *    origin: '',                  // 消息来源的域名地址
   *    targetOrigin: '',            // 消息目标源的域名地址
   *    referrer: '',                // 消息来自哪个页面
   *    timeStamp: '',               // 消息发出时的时间戳
   *    transportType: '',           // 中转消息的载体类型，只可能为BroadcastMessage和localStorage
   *    allowLocalBroadcast: false,  // 该消息是否允许被同页面的BroadcastMessage实例接收到
   *    channelId: '*',              // 消息所属的频道id
   *    instanceId: 'xx_xx',         // 消息所属BroadcastMessage实例id
   *    debug: false                 // 是否为开启了调试选项的消息
   * }
   */
  emitOriginalMessage: false,

  /**
   * 指定消息发送的目标域，规则跟postMessage的targetOrigin一样
   * 但不同的是支持定义数组形式的targetOrigin，从而实现批量跨域数据发送
   * 当然如果是"*"的话就是给任意运行了本插件的页面发送数据
   * 默认为 `location.origin`，即只可以在同域名的页面之间进行通信
   */
  targetOrigin: location.origin,

  /**
   * 指定数据中转传输使用的传输类型，可选值：BroadcastChannel、localStorage
   * 不指定的话，优先使用BroadcastChannel，在不兼容BroadcastChannel的浏览器下使用localStorage
   * 无特需情况，不建议修改该项配置
   */
  transportType: 'BroadcastChannel',

  /**
   * 标识BroadcastMessage实例是否处于可信域的页面上运行
   * 如果是，当前页面作为可信域的中介页嵌入到具体运行环境中
   * 该选项只在自定义可信域页面中使用，其他情况不要使用
   */
  inTrustedDomainPages: false,

  /**
   * 指定作为消息中转的可信域页面地址，有需跨域通信需求才会用到该选项
   * 官方提供的可信域页面地址为：
   * https://broadcast-message.anzz.top/dist/pages/broadcast-message.html
   */
  trustedDomainPages: '',

  /* 标识是否开启调试选项 */
  debug: false,
}
```

精简掉注释后的：

```javascript
const bmOpts = {
  channelId: '*',
  allowLocalBroadcast: false,
  emitOriginalMessage: false,
  targetOrigin: location.origin,
  transportType: 'BroadcastChannel',
  inTrustedDomainPages: false,
  trustedDomainPages: '',
  debug: false,
}
new BroadcastMessage(bmOpts)
```
