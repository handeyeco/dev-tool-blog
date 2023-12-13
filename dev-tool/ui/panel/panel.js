let widgets = {};
let renderTimeout;

function formatMessage(action, data) {
  return {
    extension: "blog-ext",
    source: "panel",
    action,
    data,
  };
}

/**
 * Create a connection to the background script
 */
const backgroundPageConnection = browser.runtime.connect({
  name: "panel",
});

/**
 * Listen for messages from background script
 */
backgroundPageConnection.onMessage.addListener((request) => {
  // Only accept messages that we know are ours
  if (message?.extension !== "blog-ext" || message?.source !== "background") {
    return;
  }

  switch (request.action) {
    case "rendered":
      widgets[request.data.widgetId] = request.data.count;
      break;
    case "removed":
      delete widgets[request.data.widgetId];
      break;
    case "hydrate-state":
      widgets = { ...widgets, ...request.data };
      break;
  }

  render();
});

/**
 * Send an init message back to background script
 * to request existing state
 */
backgroundPageConnection.postMessage(
  formatMessage("init", {
    tabId: browser.devtools.inspectedWindow.tabId,
  })
);

/**
 * Callback for UI button press
 */
function handleClickReset(widgetId) {
  backgroundPageConnection.postMessage(
    formatMessage("reset", {
      widgetId,
      tabId: browser.devtools.inspectedWindow.tabId,
    })
  );
}

/**
 * Panel UI renderer
 */
function render() {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }

  // debouncing since Counter's useEffect triggers a
  // "removed" message right before rerendering which
  // caused flickering
  renderTimeout = setTimeout(() => {
    const container = document.getElementById("content");
    container.innerHTML = "";

    Object.entries(widgets).forEach(([widgetId, count]) => {
      const p = document.createElement("p");
      p.innerText = `id: ${widgetId} count: ${count}`;
      container.appendChild(p);

      const button = document.createElement("button");
      button.innerText = `Reset ${widgetId}`;
      button.addEventListener("click", () => handleClickReset(widgetId));
      container.appendChild(button);
    });
  }, 50);
}
