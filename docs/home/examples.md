# 使用

## 同域下基本使用示例  

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = { channelId: 'demo', allowLocalBroadcast: true }
const broadcastMessage = new BroadcastMessage(bmOpts)

/* 注册接收消息事件 */
broadcastMessage.addEventListener("message", event => {
  console.log(`[BroadcastMessage-Event]`, event.data)
})

/* 发送消息 */
broadcastMessage.postMessage(`[demo] ${Date.now()}`)
```

## 指定使用`localStorage`来中转消息  

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = { channelId: 'localStorage-demo', allowLocalBroadcast: true, transportType: 'localStorage' }
const broadcastMessage = new BroadcastMessage(bmOpts)

/* 注册接收消息事件 */
broadcastMessage.addEventListener("message", function (event) {
  console.log(`[BroadcastMessage-Event]`, event.data)
})

/* 发送消息 */
broadcastMessage.postMessage(`[localStorage-demo] ${Date.now()}`)
```

`PS: 一般不建议手动指定transportType类型，broadcast-message默认会根据浏览器的支持情况自动选择BroadcastChannel还是localStorage，另外你应该了解的是：BroadcastChannel的通信效率比localStorage高`

## 跨域下基本使用示例  

假设：  

- 域名A是消息接收方  
- 域名B是消息发送方  

域名A的代码示例：

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = { 
  channelId: 'cross-domain-demo', 
  
  /* 必须使用可信域下的broadcast-message页来进行消息的中转，后面会介绍如何自定义可信域页面地址 */
  trustedDomainPages: 'https://broadcast-message.anzz.top/dist/pages/broadcast-message.html',

  /* 指定接收来自哪个域名发送过来的消息，*表示信任所有域名的消息，生产环境推荐必须指定具体域名 */
  // targetOrigin: "https:anzz.top"
  targetOrigin: "*"
}

const broadcastMessage = new BroadcastMessage(bmOpts)

/* 注册接收消息事件 */
broadcastMessage.addEventListener("message", event => {
  console.log(`[BroadcastMessage-Event]`, event.data)
})
```

域名B的代码示例：

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = {
  channelId: 'cross-domain-demo', 
  
  /* 可信域消息中转页的地址必须和域名A定义的一致 */
  trustedDomainPages: 'https://broadcast-message.anzz.top/dist/pages/broadcast-message.html',
}
const broadcastMessage = new BroadcastMessage(bmOpts)

/* 发送消息 */
broadcastMessage.postMessage(`[cross-domain-demo] ${Date.now()}`)
```

附注：当进行跨域通信时，需先确认域名A和域名B的页面都已加载，且都完成了broadcast-message的初始化工作，才能开始通信，否则会出现消息发送出去了，但接收方还没准备好等情况，导致消息通信失败

## 自定义可信域页面

对于有跨域通信需求的项目，加载一个可信域的页面作为消息中转页是必不可少的。默认可以使用项目的自带可信域页面：  
<https://broadcast-message.anzz.top/dist/pages/broadcast-message.html>  

但出于下面的原因你可能需要自定义可信域页面

- 需要更快更稳定的可信域页面
- 项目对第三方网址有严格的限定
- 封装内部使用的跨域消息通信库

自定义可信域页面代码示例如下：

```javascript
import BroadcastMessage from 'broadcast-message'
new BroadcastMessage({
  /* 只需标识当前脚本运行在可信域页面内即可 */
  inTrustedDomainPages: true,
})
```

将初始化了`inTrustedDomainPages`选项的页面发布出去，即可获得一个自定义可信域页面  

附注：为了让自定义可信域页面更快地加载，你应该务必不要掺杂其他无关逻辑进去，它只作为消息中转页面存在，并不需要其他额外内容  
