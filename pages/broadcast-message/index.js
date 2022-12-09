import BroadcastMessage from "../../src/index.ts";
/* 作为可信域页面进行注册 */
new BroadcastMessage({
  inTrustedDomainPages: true,
  allowLocalBroadcast: true,
  emitOriginalMessage: true,
})