import BroadcastMessage from "../index.js";

const broadcastMessage = new BroadcastMessage({
  channelId: "test001",
  // targetOrigin: '*',
  // transportType: 'localStorage',
  allowLocalBroadcast: true,
  emitOriginalMessage: false,
  debug: false,
});

broadcastMessage.addEventListener("message", function (event) {
  console.log(`[BroadcastMessage-Event][onMessage]`, event.data)
});

export function setupCounter(element) {
  let counter = 0;
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `发送消息 [ count:${counter} ]`;

    broadcastMessage.postMessage(`${Date.now()} - ${counter}`);
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
