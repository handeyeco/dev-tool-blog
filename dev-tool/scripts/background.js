const connections = {};
const latestState = {};

browser.runtime.onConnect.addListener(function (port) {
  // Listen for the panel to connect and save a reference to it
  function extensionListener(message, sender, sendResponse) {
    console.log(message);
    if (message.name === "init") {
      console.log("connected in background");
      connections[message.tabId] = port;
      port.postMessage({
        messageType: "hydrate-state",
        payload: latestState[message.tabId],
      });
      return;
    }

    if (message.name === "from-tool:reset") {
      console.log("made it to reset state");
      console.log(message, sender);
      browser.tabs.sendMessage(message.tabId, {
        messageAction: "from-tool:reset",
        widgetId: message.widgetId,
      });
    }
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    var tabs = Object.keys(connections);
    for (let i = 0; i < tabs.length; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// Receive message from content script and
// relay to the devTools page for the current tab
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Only listen to message for the Blog Extension
  if (request?.source !== "blog-ext") {
    return;
  }

  console.log("received in background");
  console.log(request);
  console.log(sender);

  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    const tabId = sender.tab.id;

    // store state for when dev tool panel connects
    if (request.messageType === "rendered") {
      if (!latestState[tabId]) {
        latestState[tabId] = {};
      }

      latestState[tabId][request.payload.widgetId] = request.payload.count;
    } else if (request.messageType === "removed") {
      if (!latestState[tabId]) {
        return;
      }

      delete latestState[tabId][request.payload.widgetId];
    }

    if (tabId in connections) {
      console.log("sending from background");
      connections[tabId].postMessage(request);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
});
