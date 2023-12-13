function formatMessage(action, data) {
  return {
    extension: "blog-ext",
    source: "content",
    action,
    data,
  };
}

// Listen to messages from the application,
// forward them to the background script
window.addEventListener("message", (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  const message = event.data;

  // Only accept messages that we know are ours
  if (message?.extension !== "blog-ext" || message?.source !== "application") {
    return;
  }

  browser.runtime.sendMessage(formatMessage(message.action, message.data));
});

// Listen to messages from the background script,
// forward them to the application
browser.runtime.onMessage.addListener((message) => {
  // Only accept messages that we know are ours
  if (message?.extension !== "blog-ext" || message?.source !== "background") {
    return;
  }

  window.postMessage(formatMessage(message.action, message.data));
});
