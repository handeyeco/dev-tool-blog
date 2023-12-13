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

// Create a connection to the background script
const backgroundPageConnection = browser.runtime.connect({
  name: "panel",
});

// Listen for messages from background script
backgroundPageConnection.onMessage.addListener((request) => {
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

// Send an init message back to background script
// to request existing state
backgroundPageConnection.postMessage(
  formatMessage("init", { tabId: browser.devtools.inspectedWindow.tabId })
);

function handleClickReset(widgetId) {
  backgroundPageConnection.postMessage(
    formatMessage("reset", {
      widgetId,
      tabId: browser.devtools.inspectedWindow.tabId,
    })
  );
}

function render() {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }

  renderTimeout = setTimeout(() => {
    const container = document.getElementById("content");
    container.innerHTML = "";

    Object.entries(widgets).forEach(([widgetId, count]) => {
      const p = document.createElement("p");
      p.innerText = `id: ${widgetId} count: ${count}`;
      container.appendChild(p);

      const button = document.createElement("button");
      button.innerText = "Reset";
      button.addEventListener("click", () => handleClickReset(widgetId));
      container.appendChild(button);
    });
  }, 50);
}
