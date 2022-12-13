/*!
 * @name         BroadcastMessage.js
 * @description  基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/11/07 09:26
 * @github       https://github.com/xxxily
 */
export interface BmOpts {
    targetOrigin?: string;
    transportType?: string;
    inTrustedDomainPages?: boolean;
    trustedDomainPages?: string;
    allowLocalBroadcast?: boolean;
    channelId?: string | number;
    debug?: boolean;
    emitOriginalMessage?: boolean;
}
export interface BmMsg extends BmOpts {
    data?: any;
    type?: 'BroadcastMessage' | 'Internal-BroadcastMessage' | string;
    windowId?: string | number;
    origin?: string;
    referrer?: string;
    timeStamp?: number;
    [prop: string]: any;
}
export interface BmEvent extends Event {
    data?: BmMsg | any;
    [prop: string]: any;
}
export interface BmListener {
    (evt: BmEvent): void;
}
export interface BmReadyHandler {
    (evt: boolean): void;
}
declare class BroadcastMessage {
    readonly debug: boolean;
    private readonly targetOrigin;
    private readonly transportType;
    private readonly inTrustedDomainPages;
    private readonly allowLocalBroadcast;
    private readonly channelId;
    private readonly instanceId;
    private readonly emitOriginalMessage;
    private readyTime;
    private messageWindow;
    private trustedDomainPages;
    private __hasRegisterPostMessageListener__;
    private __BroadcastChannelInstance__;
    private __hasRegisterStorageListener__;
    private __readyHandler__;
    private _readyStartTime_;
    private _isReady_;
    private __messageListener__;
    private __internalMessageListener__;
    private __hasInternalMessageListener__;
    private __hasMessageListener__;
    private _message_cache_;
    constructor(opts?: BmOpts);
    init(): void;
    getTrustedDomain(): string;
    /**
     * 给messageWindow的父页面发送消息，用来传递某些状态，例如告诉父页面：messageWindow初始化完成了，可以开始进行数据通信
     * @param {String} msg
     * @returns
     */
    __sendMessageToParentWindow__(msg: any): void;
    __registerMessageWindow__(): void;
    __registerPostMessageListener__(): void | boolean;
    __registerBroadcastChannelListener__(): any;
    __registerStorageMessageListener__(): void | boolean;
    postMessage(message: any, messageType?: string): void | boolean;
    onMessage(handler: BmListener): void | boolean;
    offMessage(handler: BmListener): void;
    postMessageToInternal(message: any): void;
    /**
     * 侦听来自messageWindow的内部通信信息，主要用于脚本内部逻辑的状态传递和数据同步等，一般来说业务层无需监听内部消息
     */
    onInternalMessage(handler: BmListener): void | boolean;
    offInternalMessage(handler: BmListener): void;
    addEventListener(type: string, listener: BmListener): void | boolean;
    removeEventListener(type: string, listener: BmListener): void | boolean;
    ready(handler: BmReadyHandler): void | boolean | Promise<any>;
    close(): void;
}
export default BroadcastMessage;
