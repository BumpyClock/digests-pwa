// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Settings from "./pages/settings";
import Feed from "./components/Feed/Feed";
import ReaderViewWrapper from "./components/ReaderView/ReaderViewWrapper";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // Index route (for /)
        element: <Feed />
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/readerview/*",
        element: <ReaderViewWrapper />,
      },
    ]
  },
]);

if (/Digest-electron\/\d+\.\d+\.\d+/.test(navigator.userAgent)) {
  document.body.style.backgroundColor = "transparent !important";
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
console.log("Registering service worker");
serviceWorkerRegistration
  .register()
  .then(() => {
    // Check for the service worker registration failure flag
    const swRegistrationFailed = localStorage.getItem("swRegistrationFailed");
    if (swRegistrationFailed === "true") {
      alert(
        "Service worker registration failed. Some features may not work as expected."
      );
      localStorage.removeItem("swRegistrationFailed");
    }
  })
  .catch((err) => {
    console.error("ServiceWorker registration failed in index.js:", err);
    localStorage.setItem("swRegistrationFailed", "true");
  });