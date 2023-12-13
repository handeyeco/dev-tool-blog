const connections = {};
const latestState = {};

function formatMessage(action, data) {
  return {
    extension: "blog-ext",
    source: "background",
    action,
    data,
  };
}

/**
 * Listen to messages from the dev tools panel,
 * and either respond or foward them to the content script
 */
browser.runtime.onConnect.addListener((port) => {
  function extensionListener(message) {
    // Only accept messages that we know are ours
    if (message?.extension !== "blog-ext" || message?.source !== "panel") {
      return;
    }

    // Listen for the panel to connect, save a reference to it
    // and hydrate its state
    if (message.action === "init") {
      connections[message.data.tabId] = port;
      port.postMessage(
        formatMessage("hydrate-state", latestState[message.data.tabId])
      );
      return;
    }

    // forward everything else
    browser.tabs.sendMessage(
      message.data.tabId,
      formatMessage(message.action, message.data)
    );
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener((port) => {
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

/**
 * Listen to messages from the content script,
 * save data for when/if the dev tools panel connects,
 * and forward messages to the dev tools panel
 */
browser.runtime.onMessage.addListener((message, sender) => {
  // Only accept messages that we know are ours
  if (message?.extension !== "blog-ext" || message?.source !== "content") {
    return;
  }

  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    const tabId = sender.tab.id;

    // store state for when dev tool panel connects
    if (message.action === "rendered") {
      if (!latestState[tabId]) {
        latestState[tabId] = {};
      }

      latestState[tabId][message.data.widgetId] = message.data.count;
    } else if (message.action === "removed") {
      if (!latestState[tabId]) {
        return;
      }

      delete latestState[tabId][message.data.widgetId];
    }

    // foward messages
    if (tabId in connections) {
      connections[tabId].postMessage(
        formatMessage(message.action, message.data)
      );
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
});
