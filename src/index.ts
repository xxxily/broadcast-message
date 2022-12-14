/*!
 * @name         BroadcastMessage.js
 * @description  基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/11/07 09:26
 * @github       https://github.com/xxxily
 */

import { parseURL, stringifyToUrl } from './utils/url'

export interface BmOpts {
  targetOrigin?: string
  transportType?: string
  inTrustedDomainPages?: boolean
  trustedDomainPages?: string
  allowLocalBroadcast?: boolean
  channelId?: string | number
  debug?: boolean
  emitOriginalMessage?: boolean
}

export interface BmMsg extends BmOpts {
  data?: any
  type?: 'BroadcastMessage' | 'Internal-BroadcastMessage' | string
  windowId?: string | number
  origin?: string
  referrer?: string
  timeStamp?: number
  [prop: string]: any
}

export interface BmEvent extends Event {
  data?: BmMsg | any
  [prop: string]: any
}

export interface BmListener {
  (evt: BmEvent): void
}

export interface BmReadyHandler {
  (evt: boolean): void
}

class BroadcastMessage {
  public readonly debug: boolean
  private readonly targetOrigin: string
  private readonly transportType: string
  private readonly inTrustedDomainPages: boolean
  private readonly allowLocalBroadcast: boolean
  private readonly channelId: string
  private readonly instanceId: string
  private readonly emitOriginalMessage: boolean
  private readyTime: number
  private messageWindow: Window | null
  private trustedDomainPages: string
  private __hasRegisterPostMessageListener__: boolean | undefined
  private __BroadcastChannelInstance__: BroadcastChannel | undefined
  private __hasRegisterStorageListener__: boolean | undefined
  private __readyHandler__: BmReadyHandler[] | undefined
  private _readyStartTime_: number | undefined
  private _isReady_: boolean
  private __messageListener__: BmListener[]
  private __internalMessageListener__: BmListener[]
  private __hasInternalMessageListener__: boolean | undefined
  private __hasMessageListener__: boolean | undefined
  private _message_cache_: any

  constructor(opts: BmOpts = {}) {
    /**
     * 指定消息发送的目标域，规则跟postMessage的targetOrigin一样
     * 但不同的是支持定义数组形式的targetOrigin，从而实现批量跨域数据发送
     * 当然如果是"*"的话就是给任意运行了本插件的页面发送数据
     */
    this.targetOrigin = opts.targetOrigin || location.origin

    /**
     * 指定数据中转传输使用的传输类型，可选值：BroadcastChannel、localStorage
     * 不指定的话，优先使用BroadcastChannel，在不兼容BroadcastChannel的浏览器下使用localStorage
     */
    this.transportType = opts.transportType || 'BroadcastChannel'

    /**
     * 标识当前脚本是否处于可信域的页面上运行
     * 如果是，当前页面作为可信域的中介页嵌入到具体运行环境中
     */
    this.inTrustedDomainPages = opts.inTrustedDomainPages || false

    // this.trustedDomainPages = 'https://h5player.anzz.top/demo/postMessage.html'
    this.trustedDomainPages = opts.trustedDomainPages || ''

    /**
     * 允许既是消息的发送页，也可以是消息的接收页，从而做到同源同页收发消息
     * postMessage、BroadcastChannel和storage事件都是必须一个页面发送，另一个页面接收
     */
    this.allowLocalBroadcast = opts.allowLocalBroadcast || false

    this.channelId = String(opts.channelId || '*')

    /**
     * 实例id，当onMessage的handler被重复调用时，很可能是同名的channelId的多个实例导致的
     * 所以加上实例id方便问题排查
     */
    this.instanceId = this.channelId + '_' + (window.performance ? performance.now() : Date.now())

    this.debug = opts.debug || false
    this.emitOriginalMessage = opts.emitOriginalMessage || false
    this.messageWindow = window

    /* BroadcastMessage初始化就绪耗时 */
    this.readyTime = 0

    this._isReady_ = false
    this.__messageListener__ = []
    this.__internalMessageListener__ = []

    this.init()
  }

  init() {
    /* 给trustedDomainPages的URL补充相关参数 */
    if (this.trustedDomainPages) {
      const urlInfo = parseURL(this.trustedDomainPages)
      urlInfo.params.channelId = this.channelId
      urlInfo.params.instanceId = this.instanceId

      this.trustedDomainPages = stringifyToUrl(urlInfo)
    }

    this.__registerMessageWindow__()

    /* 如果标识了脚本处于可信域中运行，且已经被嵌入到iframe中，则注册相关监听器 */
    if (this.inTrustedDomainPages && window.top && window !== window.top.window) {
      this.__registerPostMessageListener__()
      this.__registerStorageMessageListener__()
      this.__registerBroadcastChannelListener__()
      this.__sendMessageToParentWindow__('initReady')
    }
  }

  getTrustedDomain() {
    if (this.trustedDomainPages) {
      return parseURL(this.trustedDomainPages).origin
    } else {
      return location.origin
    }
  }

  /**
   * 给messageWindow的父页面发送消息，用来传递某些状态，例如告诉父页面：messageWindow初始化完成了，可以开始进行数据通信
   * @param {String} msg
   * @returns
   */
  __sendMessageToParentWindow__(msg: any) {
    if (window.parent === window || !msg) {
      return
    }

    const channelId = window.__broadcastMessageChannelId__ || this.channelId
    const instanceId = window.__broadcastMessageInstanceId__ || this.instanceId

    window.parent.postMessage(
      {
        data: msg,
        channelId,
        instanceId,
        type: 'Internal-BroadcastMessage',
      },
      '*'
    )
  }

  __registerMessageWindow__() {
    if (this.messageWindow !== window) {
      return
    }

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    iframe.src = this.trustedDomainPages
    iframe.className = 'broadcast-message-iframe'
    document.body.appendChild(iframe)
    this.messageWindow = iframe.contentWindow

    /**
     * 当存在trustedDomainPages时，trustedDomainPages应该引入该脚本，且执行初始化逻辑，否则将是无效的trustedDomainPages
     * 如果创建的是空白iframe，则需要将
     * __registerPostMessageListener__、__registerStorageMessageListener__、__registerBroadcastChannelListener__
     * 的代码逻辑注入到iframe里
     */
    if (!this.inTrustedDomainPages && !this.trustedDomainPages && this.messageWindow && this.messageWindow.document) {
      const document = this.messageWindow.document
      if (!document.body) {
        const body = document.createElement('body')
        body.innerHTML = '<h1>Broadcast-Message-page</h1>'
        document.documentElement.appendChild(body)
      }

      document.open()
      document.write(`
        <script>
        function ${this.__registerPostMessageListener__};
        function ${this.__registerStorageMessageListener__};
        function ${this.__registerBroadcastChannelListener__};
        function ${this.__sendMessageToParentWindow__};
        function init () {
          if (window.__hasInit__) { return false; }
          window.__broadcastMessageChannelId__ = "${this.channelId}";
          window.__broadcastMessageInstanceId__ = "${this.instanceId}";
          __registerPostMessageListener__();
          __registerStorageMessageListener__();
          __registerBroadcastChannelListener__();
          __sendMessageToParentWindow__('initReady');
          window.__hasInit__ = true ;
        }

        document.addEventListener("DOMContentLoaded", init);
        window.addEventListener("load", init)
        setTimeout(init, 100)
        </script>
      `)
      document.close()
    }
  }

  __registerPostMessageListener__(): void | boolean {
    const self = this
    if (self.__hasRegisterPostMessageListener__) {
      return false
    }

    /* 一定要处于iframe才会注册PostMessageListener */
    if (window.top === window) {
      return false
    }

    /* 创建个随机的windowID，用于确定消息来源是否同属于一个windwo发出的 */
    window.__windowId__ = String((Date.now() - Math.random() * 100000).toFixed(2))

    if (!window.__broadcastMessageChannelId__) {
      /* 对于使用trustedDomainPages的情况，通过url参数来传递ChannelId和instanceId */
      try {
        const urlInfo = parseURL(location.href)
        if (urlInfo.params.channelId && urlInfo.params.instanceId) {
          window.__broadcastMessageChannelId__ = urlInfo.params.channelId
          window.__broadcastMessageInstanceId__ = urlInfo.params.instanceId
        } else {
          throw new Error('URL缺失相关参数')
        }
      } catch (e) {
        console.error(`[registerPostMessageListener][${location.origin}] 获取broadcastMessageChannelId失败`, e)
      }
    }

    /* 消息中转传输的iframe */
    function messageIframe() {
      let messageIframe = document.querySelector('#message-transport-iframe') as HTMLIFrameElement

      if (messageIframe) {
        return messageIframe
      }

      messageIframe = document.createElement('iframe')
      messageIframe.id = 'message-transport-iframe'
      messageIframe.style.display = 'none'
      messageIframe.style.visibility = 'hidden'
      document.body.appendChild(messageIframe)
      return messageIframe
    }

    /**
     * 通过当前页的子iframe来执行消息传送逻辑，这样当前页面的window对象才会接收到到storage事件或BroadcastChannel消息
     * 如果直接执行消息传送逻辑，则还需要创建个子iframe来接受storage事件或BroadcastChannel的消息，会导致导致需要更多层级的数据传递
     */
    function transportMessage(event: MessageEvent<any>) {
      /* 给将要中转传输的数据补充相关信息字段 */
      const message = event.data
      message.windowId = window.__windowId__

      // message.debug && console.log(`[transportMessage][iframe][${location.origin}]`, messageEvent)
      // 消息被消费了就会导致后面的逻辑没法执行，所以不能打印event
      message.debug && console.log(`[transportMessage][iframe][${location.origin}]`)

      const iframeWindow = messageIframe().contentWindow

      if (!iframeWindow) {
        throw new Error(`[transportMessage][iframe]用于消息中转的iframe不存在，检测是否意外删除了`)
      }

      const broadcastChannelUsable = iframeWindow.BroadcastChannel && iframeWindow.BroadcastChannel.prototype.postMessage

      /* 优先使用BroadcastChannel进行消息传递 */
      if (broadcastChannelUsable && message.transportType !== 'localStorage') {
        const bcInstance = iframeWindow.__BroadcastChannelInstance__ || new iframeWindow.BroadcastChannel('__BroadcastChannelMessage__')
        iframeWindow.__BroadcastChannelInstance__ = iframeWindow.__BroadcastChannelInstance__ || bcInstance
        bcInstance.postMessage(message)
      } else {
        iframeWindow.localStorage.setItem('__BroadcastMessage__', JSON.stringify(message))
      }
    }

    messageIframe()

    /* 处理从window.parent传过来的内部消息 */
    function internalBroadcastMessageHandler(event: any): void | boolean {
      const message = event.data

      if (!message) {
        return false
      }

      if (message.data === 'readyTest') {
        window.__broadcastMessageReadyInfo__ = message

        const sendMessageToParentWindow = self.__sendMessageToParentWindow__ || window.__sendMessageToParentWindow__
        if (sendMessageToParentWindow instanceof Function) {
          /* 发送握手成功消息 */
          sendMessageToParentWindow('ready')
        }
      }
    }

    /* 注册postMessage的侦听事件，并将接收到的数据交给消息中转传输逻辑传送出去或进行内部处理 */
    window.addEventListener(
      'message',
      (event): void | boolean => {
        const message = event.data
        if (!message || !message.type) {
          return false
        }

        if (message.type === 'BroadcastMessage') {
          transportMessage(event)
        } else if (message.type === 'Internal-BroadcastMessage') {
          internalBroadcastMessageHandler(event)
        }
      },
      true
    )
    this.__hasRegisterPostMessageListener__ = true
  }

  __registerBroadcastChannelListener__(): any {
    if (!window.BroadcastChannel || !BroadcastChannel.prototype.postMessage) {
      console.error(`[BroadcastChannel][${location.origin}]`, '不支持BroadcastChannel')
      return false
    }

    if (this.__BroadcastChannelInstance__) {
      return true
    }

    const BroadcastChannelInstance = new BroadcastChannel('__BroadcastChannelMessage__')
    BroadcastChannelInstance.addEventListener('message', (event): void | boolean => {
      const message = event.data

      /* 校验数据字段 */
      if (!message || !message.windowId || !message.data) {
        return false
      }

      const channelId = window.__broadcastMessageChannelId__
      if (!message.channelId || (channelId && message.channelId !== channelId)) {
        message.debug && console.info('[transportMessage] channelId不存在或不匹配，禁止数据向上传递', channelId, message)
        return false
      }

      if (!message.allowLocalBroadcast && window.__windowId__ && window.__windowId__ === message.windowId) {
        message.debug && console.info('[BroadcastChannel-event] 消息源接收端和消息源的来源端一致，禁止数据向上传递')
        return false
      }

      /* 将接受到的事件数据通过postMessage传递回给上层的window */
      const targetOriginList = Array.isArray(message.targetOrigin) ? message.targetOrigin : [message.targetOrigin]
      targetOriginList.forEach((targetOrigin: string): void | boolean => {
        /* 检查当前的BroadcastMessage被哪个父页面嵌套，当父页面的地址和targetOrigin不匹配时，不向上传递数据 */
        const readyInfo = window.__broadcastMessageReadyInfo__ || null
        if (targetOrigin !== '*' && (!readyInfo || !readyInfo.referrer.startsWith(targetOrigin))) {
          if (message.instanceId !== readyInfo.instanceId) {
            message.debug &&
              console.warn(
                `[BroadcastChannel-event] 消息的targetOrigin和当前父页面的地址不匹配，取消数据向上传递，[targetOrigin]${targetOrigin} [parent page]${readyInfo.referrer}`
              )
          }
          return false
        }

        window.parent.postMessage(message, targetOrigin)
      })
    })

    this.__BroadcastChannelInstance__ = BroadcastChannelInstance
  }

  __registerStorageMessageListener__(): void | boolean {
    if (this.__hasRegisterStorageListener__) {
      return false
    }

    window.addEventListener('storage', (event): void | boolean => {
      let message: BmMsg | any = event.newValue

      /**
       * 空的newValue代表数据被删除，此时不应该传递给上层window
       * 如果不是由__BroadcastMessage__引起的事件也不应该传递给上层window
       */
      if (!message || event.key !== '__BroadcastMessage__') {
        return false
      }

      try {
        message = JSON.parse(message)
      } catch (e) {
        // BroadcastMessage的数据必须是可以JSON.parse解析的，否则说明数据格式不对
        // console.error('[storage-event][parse-error]', message, e)
        return false
      }

      /* 再次校验数据字段 */
      if (!message || !message.windowId || !message.data) {
        return false
      }

      const channelId = window.__broadcastMessageChannelId__
      if (!message.channelId || (channelId && message.channelId !== channelId)) {
        message.debug && console.error('[transportMessage] channelId不存在或不匹配，禁止数据向上传递', channelId, message)
        return false
      }

      message.debug && console.log(`[storage-event][iframe][${location.origin}]`, event)

      if (!message.allowLocalBroadcast && window.__windowId__ && window.__windowId__ === message.windowId) {
        message.debug && console.info('[storage-event] 消息源接收端和消息源的来源端一致，禁止数据向上传递')
        return false
      }

      /* 将接受到的事件数据通过postMessage传递回给上层的window */
      const targetOriginList = Array.isArray(message.targetOrigin) ? message.targetOrigin : [message.targetOrigin]
      targetOriginList.forEach((targetOrigin: string): void | boolean => {
        /* 检查当前的BroadcastMessage被哪个父页面嵌套，当父页面的地址和targetOrigin不匹配时，不向上传递数据 */
        const readyInfo = window.__broadcastMessageReadyInfo__ || {
          referrer: '',
        }
        if (targetOrigin !== '*' && !readyInfo.referrer.startsWith(targetOrigin)) {
          if (message.instanceId !== readyInfo.instanceId) {
            message.debug &&
              console.warn(
                `[storage-event] 消息的targetOrigin和当前父页面的地址不匹配，取消数据向上传递，[targetOrigin]${targetOrigin} [parent page]${readyInfo.referrer}`
              )
          }
          return false
        }

        window.parent.postMessage(message, targetOrigin)
      })
    })

    this.__hasRegisterStorageListener__ = true
  }

  postMessage(message: any, messageType?: string): void | boolean {
    /* 初始化未就绪前，把需要post出去的数据先预存起来，等Ready之后再发送出去 */
    if (!this._isReady_ && messageType !== 'Internal-BroadcastMessage') {
      if (!this._message_cache_) {
        this.ready(() => {
          if (Array.isArray(this._message_cache_)) {
            this._message_cache_.forEach((message) => {
              this.postMessage(message)
            })

            delete this._message_cache_
          }
        })
      }

      this._message_cache_ = this._message_cache_ || []
      this._message_cache_.push(message)
      return true
    }

    const data = {
      data: message,
      type: messageType || 'BroadcastMessage',
      origin: location.origin || (window.top && window.top.location.origin),
      targetOrigin: this.targetOrigin,
      referrer: location.href || (window.top && window.top.location.href),
      timeStamp: window.performance ? performance.now() : Date.now(),
      transportType: this.transportType,
      allowLocalBroadcast: this.allowLocalBroadcast,
      channelId: this.channelId,
      instanceId: this.instanceId,
      debug: this.debug,
    }

    if (!this.messageWindow || !this.messageWindow.postMessage) {
      this.debug && console.error('[messageWindow error] 无法发送message', data, this.messageWindow)
      return false
    }

    const trustedDomain = this.getTrustedDomain()
    this.messageWindow.postMessage(data, trustedDomain)
  }

  onMessage(handler: BmListener): void | boolean {
    this.__messageListener__ = this.__messageListener__ || []

    if (handler instanceof Function && !this.__messageListener__.includes(handler)) {
      this.__messageListener__.push(handler)
    }

    if (this.__hasMessageListener__) {
      return false
    }
    this.__hasMessageListener__ = true

    window.addEventListener(
      'message',
      (event: any): void | boolean => {
        /**
         * 此处是最终的消息出口
         * 属于数据安全的最后一道防线，也是最脆弱的防线
         * 需要对原始数据进行调整或和过滤后才能给handler使用
         * 数据传送上来之前应该尽可能避免无关的数据被传到这里
         **/

        const message = event.data
        const isBroadcastMessage = message && message.type === 'BroadcastMessage' && message.data && message.channelId && message.referrer

        /* 排除其它postMessage逻辑发送过来的无关数据 */
        if (!isBroadcastMessage) {
          return false
        }

        /**
         * 不同频道的数据在传送过来前就应该被取消掉，这里是为了加一道保险
         * 实际上非同源的不同频道的数据来到这里，说明数据已经不安全了，需完善脚本逻辑
         */
        if (this.channelId !== '*' && message.channelId !== this.channelId) {
          if (message.origin !== location.origin) {
            message.debug && console.error('[messageListener] 存在数据安全隐患，请完善脚本逻辑', this.channelId, event)
          }

          return false
        }

        const fakeEvent = {} as BmEvent

        try {
          for (const key in event) {
            let value = event[key]
            if (key === 'data' && !this.emitOriginalMessage) {
              value = message.data
            } else {
              if (key === 'type') {
                value = 'BroadcastMessage'
              }
            }

            Object.defineProperty(fakeEvent, key, {
              enumerable: key === 'data',
              writable: false,
              configurable: true,
              value: value,
            })
          }
        } catch (e) {}

        this.__messageListener__.forEach((handler) => {
          handler instanceof Function && handler(fakeEvent)
        })
      },
      true
    )
  }

  offMessage(handler: BmListener) {
    this.__messageListener__ = this.__messageListener__ || []

    const tempStorageListener: BmListener[] = []

    this.__messageListener__.forEach((item) => {
      if (item !== handler) {
        tempStorageListener.push(item)
      }
    })

    this.__messageListener__ = tempStorageListener
  }

  postMessageToInternal(message: any) {
    this.postMessage(message, 'Internal-BroadcastMessage')
  }

  /**
   * 侦听来自messageWindow的内部通信信息，主要用于脚本内部逻辑的状态传递和数据同步等，一般来说业务层无需监听内部消息
   */
  onInternalMessage(handler: BmListener): void | boolean {
    this.__internalMessageListener__ = this.__internalMessageListener__ || []
    if (handler instanceof Function && !this.__internalMessageListener__.includes(handler)) {
      this.__internalMessageListener__.push(handler)
    }

    if (this.__hasInternalMessageListener__) {
      return false
    }
    this.__hasInternalMessageListener__ = true

    window.addEventListener(
      'message',
      (event) => {
        const message = event.data
        const isInternalMessage =
          message && message.type === 'Internal-BroadcastMessage' && message.channelId === this.channelId && message.instanceId === this.instanceId

        /* 排除其它postMessage逻辑发送过来的无关数据 */
        if (!isInternalMessage) {
          return false
        }

        this.__internalMessageListener__.forEach((handler: BmListener) => {
          handler instanceof Function && handler(event)
        })

        return true
      },
      true
    )
  }

  offInternalMessage(handler: BmListener) {
    this.__internalMessageListener__ = this.__internalMessageListener__ || []

    const tempStorageListener: any = []

    this.__internalMessageListener__.forEach((item: any) => {
      if (item !== handler) {
        tempStorageListener.push(item)
      }
    })

    this.__internalMessageListener__ = tempStorageListener
  }

  addEventListener(type: string, listener: BmListener): void | boolean {
    if (type !== 'message') {
      return false
    }

    this.onMessage(listener)
  }

  removeEventListener(type: string, listener: BmListener): void | boolean {
    if (type !== 'message') {
      return false
    }

    this.offMessage(listener)
  }

  ready(handler: BmReadyHandler): void | boolean | Promise<any> {
    if (this._isReady_) {
      if (handler instanceof Function) {
        handler(true)
      }

      return true
    }

    if (!this.__readyHandler__) {
      this._readyStartTime_ = Date.now()

      this.__readyHandler__ = []

      const readyHandler = (event: any) => {
        const message = event.data

        if (message.data === 'initReady') {
          /**
           * 发送握手消息，测试是否真的ready
           * 这也是给messageWindow初始化成功后发的第一条信息，可以帮助messageWindow完善初始化信息
           */
          this.postMessageToInternal('readyTest')
        } else if (message.data === 'ready') {
          this._isReady_ = true

          if (this._readyStartTime_) {
            this.readyTime = Date.now() - this._readyStartTime_
          }

          delete this._readyStartTime_

          if (this.debug) {
            console.log(`[BroadcastMessage][ready] 耗时：${this.readyTime}`)
          }

          if (Array.isArray(this.__readyHandler__)) {
            this.__readyHandler__.forEach((handler) => {
              if (handler instanceof Function) {
                handler(true)
              }
            })
          }

          /* 解绑readyHandler */
          delete this.__readyHandler__
          this.offInternalMessage(readyHandler)
        }
      }

      this.onInternalMessage(readyHandler)
    }

    if (handler instanceof Function) {
      this.__readyHandler__.push(handler)
    } else {
      return new Promise((resolve) => {
        Array.isArray(this.__readyHandler__) && this.__readyHandler__.push(resolve)
      })
    }
  }

  close() {
    if (this.__BroadcastChannelInstance__ && this.__BroadcastChannelInstance__.close) {
      this.__BroadcastChannelInstance__.close()
    }

    if (this.messageWindow && this.messageWindow instanceof HTMLElement) {
      document.body.removeChild(this.messageWindow)
    }

    this.__messageListener__ = []
    this.__readyHandler__ = []
  }
}

export default BroadcastMessage
