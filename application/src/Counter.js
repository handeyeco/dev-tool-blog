import { useEffect } from "react";
import sendToExtension from "./sendToExtension";

export default function Counter({ count, onChange, name }) {
  const widgetId = `counter-${name}`;

  useEffect(() => {
    sendToExtension("rendered", {
      widgetId,
      count,
    });

    function handleMessage(message) {
      console.log("In application");
      console.log(message);

      const messageWidgetId = message?.data?.widgetId;
      const messageAction = message?.data?.messageAction;
      console.log({ messageWidgetId, messageAction });
      if (messageWidgetId === widgetId && messageAction === "from-tool:reset") {
        onChange(0);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      sendToExtension("removed", {
        widgetId,
      });

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
