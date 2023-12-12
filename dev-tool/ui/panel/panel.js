let widgets = {};
let renderTimeout;

// Create a connection to the background script
const backgroundPageConnection = browser.runtime.connect({
  name: "panel",
});

// Send an init message back
backgroundPageConnection.postMessage({
  name: "init",
  tabId: browser.devtools.inspectedWindow.tabId,
});

// Listen for messages from background script
backgroundPageConnection.onMessage.addListener((request) => {
  console.log(request);
  switch (request.messageType) {
    case "rendered":
      widgets[request.payload.widgetId] = request.payload.count;
      break;
    case "removed":
      delete widgets[request.payload.widgetId];
      break;
    case "hydrate-state":
      widgets = { ...widgets, ...request.payload };
      break;
  }

  render();
});

function handleReset(widgetId) {
  console.log(widgetId);
  backgroundPageConnection.postMessage({
    name: "from-tool:reset",
    widgetId,
    tabId: browser.devtools.inspectedWindow.tabId,
  });
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
      button.addEventListener("click", () => handleReset(widgetId));
      container.appendChild(button);
    });
  }, 50);
}
