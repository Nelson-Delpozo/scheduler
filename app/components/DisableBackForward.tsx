import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

const DisableBackForward = () => {
  const fetcher = useFetcher();

  useEffect(() => {
    // Push the current state into the history stack and replace it
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Check if the user is logged in (you can modify this check as needed based on your logic)
      if (window.location.pathname !== "/login") {
        // Force the user to log out if they try to navigate back
        fetcher.submit(null, { method: "post", action: "/logout" });
      } else {
        // If they are on the login page, prevent navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Listen for back/forward actions
    window.addEventListener("popstate", handlePopState);

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [fetcher]);

  return null;
};

export default DisableBackForward;
