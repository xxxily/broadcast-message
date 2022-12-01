import { test, expect } from "@playwright/test";

const iframeHtml = `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>broadcast-message</title>
  </head>
  <body>
  </body>
</html>
`;

const pageUrl = "http://localhost:5173/";
test.beforeEach(async ({ page }) => {
  await page.goto(pageUrl);
});

test.describe("同域", () => {
  const bmOpts = {
    channelId: "End-to-End-Testing",
    // targetOrigin: '*',
    // transportType: 'localStorage',
    allowLocalBroadcast: true,
    emitOriginalMessage: true,
    debug: false,
  };

  const evaluateFunc = (bmOpts) => {
    return new Promise((resolve, reject) => {
      const broadcastMessage = new window.BroadcastMessage(bmOpts);

      broadcastMessage.addEventListener("message", function (event) {
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
    const result = await page.evaluate(evaluateFunc, bmOpts);

    expect(result.channelId).toBe("End-to-End-Testing");
    expect(result.data).toBe("testMsg");
  });

  test("使用localStorage传送消息", async ({ page }) => {
    bmOpts.channelId = "End-to-End-Testing_localStorage";
    bmOpts.transportType = "localStorage";

    const result = await page.evaluate(evaluateFunc, bmOpts);

    expect(result.channelId).toBe("End-to-End-Testing_localStorage");
    expect(result.transportType).toBe("localStorage");
    expect(result.data).toBe("testMsg");
  });

  test("跨TAB消息发送", async ({ page }) => {
    bmOpts.targetOrigin = "*";
    bmOpts.allowLocalBroadcast = false;

    const context = page.context();
    const page2 = await context.newPage();
    await page2.goto(`${pageUrl}?tab=true`);

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
    trustedDomainPages: 'https://www.baidu.com/broadcast-message/index.html',
    // targetOrigin: '*',
    // transportType: 'localStorage',
    allowLocalBroadcast: true,
    emitOriginalMessage: true,
    debug: false,
  };

  test("跨域消息发送", async ({ page }) => {
    bmOpts.trustedDomainPages = "https://www.baidu.com/broadcast-message/index.html";
    bmOpts.targetOrigin = "*";
    bmOpts.allowLocalBroadcast = false;

    page.on("frameattached", async (frame) => {
      // const content = await frame.content();
      console.log("[frameattached]", frame.url());
    });

    page.on("framenavigated", async (frame) => {
      // const content = await frame.content();
      console.log("[framenavigated]", frame.url());

      if (frame.url().startsWith("https://www.baidu.com/broadcast-message/")) {
        const content = await frame.content();
        console.log(`[framenavigated][${frame.url()}]`, content);
        await frame.setContent(iframeHtml);
        await frame.addScriptTag({
          path: "dist/BroadcastMessage.iife.js",
        });

        // const content = await frame.content();
        await page.evaluate((bmOpts) => {
          console.log(`[${frame.url()}]`, content);
        }, bmOpts);
      }
    });

    await page.goto("https://www.baidu.com/");
    await page.addScriptTag({
      path: "dist/BroadcastMessage.iife.js",
      // type: 'module',
    });

    const result = await page.evaluate((bmOpts) => {
      console.log("[broadcastMessage]", window.BroadcastMessage);
      const broadcastMessage = new window.BroadcastMessage(bmOpts);
      broadcastMessage.postMessage("testMsg");
    }, bmOpts);
  });
});
