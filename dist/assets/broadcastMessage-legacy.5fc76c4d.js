;
(function () {
  System.register(['./index-legacy.303605fc.js'], function (exports, module) {
    'use strict';

    var BroadcastMessage;
    return {
      setters: [module => {
        BroadcastMessage = module.B;
      }],
      execute: function () {
        /* 作为可信域页面进行注册 */
        new BroadcastMessage({
          inTrustedDomainPages: true,
          allowLocalBroadcast: true,
          emitOriginalMessage: true
        });
      }
    };
  });
})();
