window.addEventListener("message", (event) => {
  console.log(event.data);
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours
  if (
    typeof message !== "object" ||
    message === null ||
    (!!message.source && message.source !== "blog-ext")
  ) {
    return;
  }
  console.log("received in content");

  console.log("sending from content");
  browser.runtime.sendMessage(message);
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("in content");
  console.log(request);
  window.postMessage(request);
});
