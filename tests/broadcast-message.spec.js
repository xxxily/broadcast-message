import { test, expect } from "@playwright/test";

test.describe("同域", () => {
  let pageUrl = "http://localhost:5173/";

  test.beforeEach(async ({ page }) => {
    /* 测试本地页面 */
    // await page.goto(pageUrl);

    /* 注入到百度中进行测试 */
    pageUrl = "https://www.baidu.com/";
    await page.goto(pageUrl);
    await page.addScriptTag({
      path: "dist/BroadcastMessage.iife.js",
    });
  });

  let bmOpts = {};

  function setDefaultBmOpts(options) {
    bmOpts = {
      channelId: "End-to-End-Testing",
      // targetOrigin: '*',
      // transportType: 'localStorage',
      allowLocalBroadcast: true,
      emitOriginalMessage: true,
      debug: false,
    };
  }
  setDefaultBmOpts();

  const evaluateFunc = (bmOpts) => {
    return new Promise((resolve, reject) => {
      const broadcastMessage = new window.BroadcastMessage(bmOpts);

      broadcastMessage.addEventListener("message", event => {
        console.log(
          `[BroadcastMessage-Event][onMessage][End-to-End-Testing]`,
          event.data
        );
        resolve(event.data);
      });

      broadcastMessage.postMessage("testMsg");
    });
  };

  test("正常创建并发送信息", async ({ page }) => {
    setDefaultBmOpts();
    const result = await page.evaluate(evaluateFunc, bmOpts);

    expect(result.channelId).toBe("End-to-End-Testing");
    expect(result.data).toBe("testMsg");
  });

  test("使用localStorage传送消息", async ({ page }) => {
    setDefaultBmOpts();
    bmOpts.channelId = "End-to-End-Testing_localStorage";
    bmOpts.transportType = "localStorage";

    const result = await page.evaluate(evaluateFunc, bmOpts);

    expect(result.channelId).toBe("End-to-End-Testing_localStorage");
    expect(result.transportType).toBe("localStorage");
    expect(result.data).toBe("testMsg");
  });

  test("跨TAB消息发送", async ({ page }) => {
    setDefaultBmOpts();
    bmOpts.targetOrigin = "*";
    bmOpts.allowLocalBroadcast = false;

    const context = page.context();
    const page2 = await context.newPage();
    await page2.goto(`${pageUrl}?tab=true`);
    await page2.addScriptTag({
      path: "dist/BroadcastMessage.iife.js",
    });

    page2.evaluate((bmOpts) => {
      const broadcastMessage = new window.BroadcastMessage(bmOpts);
      broadcastMessage.postMessage("tab-msg");
    }, bmOpts);

    const result = await page.evaluate(evaluateFunc, bmOpts);
    expect(result.referrer).toBe(`${pageUrl}?tab=true`);
    expect(result.channelId).toBe("End-to-End-Testing");
    expect(result.data).toBe("tab-msg");
  });
});

test.describe("跨域", () => {
  const bmOpts = {
    channelId: "End-to-End-Testing-cross-domain",
    trustedDomainPages:
      "https://broadcast-message.anzz.top/dist/pages/broadcast-message.html",
    targetOrigin: "*",
    // transportType: 'localStorage',
    allowLocalBroadcast: false,
    emitOriginalMessage: true,
    debug: false,
  };

  test("跨域消息发送", async ({ page }) => {
    /* 发送消息的次数，必须为偶数 */
    const postMessageCount = 100;

    if (postMessageCount <= 0 || postMessageCount % 2 !== 0) {
      throw new Error("发送消息的次数，必须为正偶数");
    }

    /* 消息接收端 */
    const evaluateReceiveFunc = ({ bmOpts, postMessageCount }) => {
      return new Promise((resolve, reject) => {
        const broadcastMessage = new window.BroadcastMessage(bmOpts);
        const msgArr = [];

        broadcastMessage.addEventListener("message", event => {
          const data = event.data
          if (data.channelId !== "End-to-End-Testing-cross-domain") {
            return false;
          }

          msgArr.push(data.data);

          // console.log(
          //   `[BroadcastMessage-Event][onMessage][End-to-End-Testing-cross-domain]`,
          //   data,
          //   msgArr
          // );

          if (msgArr.length >= postMessageCount) {
            /* 计算接收到的数据和发送数据的顺序是否一致 */

            const tmpArr1 = msgArr.slice(0, postMessageCount / 2);
            const tmpArr2 = msgArr
              .slice(postMessageCount / 2, postMessageCount)
              .reverse();
            let isTrue = true;

            const resultVal = tmpArr1[0] + tmpArr2[0];
            tmpArr1.forEach((val, index) => {
              // console.log(val + tmpArr2[index], val, tmpArr2[index])
              if (val + tmpArr2[index] !== resultVal) {
                isTrue = false;
              }
            });

            if (isTrue) {
              resolve(isTrue);
            } else {
              reject(new Error("接收到的数据和发送数据的顺序不一致"));
            }
          }
        });
      });
    };

    /* 消息发送端 */
    const evaluateTransmitFunc = ({ bmOpts, postMessageCount }) => {
      const broadcastMessage = new window.BroadcastMessage(bmOpts);
      broadcastMessage.ready(() => {
        for (let i = postMessageCount; i > 0; i--) {
          broadcastMessage.postMessage(i);
        }

        console.log(`[broadcastMessage][ready]`, bmOpts, postMessageCount);
      });
    };

    await page.goto("https://www.baidu.com/");
    await page.addScriptTag({
      path: "dist/BroadcastMessage.iife.js",
    });

    const context = page.context();
    const page2 = await context.newPage();
    await page2.goto("https://sogou.com/");
    await page2.addScriptTag({
      path: "dist/BroadcastMessage.iife.js",
    });

    await page2.evaluate(evaluateTransmitFunc, { bmOpts, postMessageCount });
    const result = await page.evaluate(evaluateReceiveFunc, {
      bmOpts,
      postMessageCount,
    });
    expect(result).toBe(true);
  });
});

// const postMessageCount = 100;
// const msgArr = [];

// for (let i = postMessageCount; i > 0; i--) {
//   msgArr.push(Number(i));
// }

// if (msgArr.length >= postMessageCount) {
//   const tmpArr1 = msgArr.slice(0, postMessageCount / 2);
//   const tmpArr2 = msgArr
//     .slice(postMessageCount / 2, postMessageCount)
//     .reverse();
//   let isTrue = true;

//   const resultVal = tmpArr1[0] + tmpArr2[0];
//   tmpArr1.forEach((val, index) => {
//     // console.log(val + tmpArr2[index], val, tmpArr2[index])
//     if (val + tmpArr2[index] !== resultVal) {
//       isTrue = false;
//     }
//   });

//   console.log("----------", isTrue);
// }
