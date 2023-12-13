import { useEffect } from "react";

function postMessage(action, data) {
  window.postMessage({
    extension: "blog-ext",
    source: "application",
    action,
    data,
  });
}

export default function Counter({ count, onChange, name }) {
  const widgetId = `counter-${name}`;

  // Listen to messages from the content script
  function handleMessage(event) {
    const message = event.data;

    // Only accept messages that we know are ours
    if (message?.extension !== "blog-ext" || message?.source !== "content") {
      return;
    }

    const messageWidgetId = message.data.widgetId;
    const messageAction = message.action;
    if (messageWidgetId === widgetId && messageAction === "reset") {
      onChange(0);
    }
  }

  useEffect(() => {
    postMessage("rendered", { widgetId, count });
    window.addEventListener("message", handleMessage);

    return () => {
      postMessage("removed", { widgetId });
      window.removeEventListener("message", handleMessage);
    };
  });

  return (
    <div id={widgetId}>
      <button onClick={() => onChange(count - 1)}>Decrement</button>
      <button onClick={() => onChange(0)}>Reset</button>
      <button onClick={() => onChange(count + 1)}>Increment</button>
    </div>
  );
}
