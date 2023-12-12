export default function sendToExtension(messageType, payload) {
  window.postMessage(
    {
      source: "blog-ext",
      messageType,
      payload,
    },
    "*"
  );
}
