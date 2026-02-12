async function registerSW() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser");
  }

  const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const isHttps = location.protocol === "https:";

  if (!isLocalhost && !isHttps) {
    throw new Error("Service workers require HTTPS (or localhost)");
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      type: "classic",
    });

    console.log("✅ Service worker registered successfully");
    return registration;
  } catch (error) {
    console.error("❌ Service worker registration failed:", error);
    throw error;
  }
}
