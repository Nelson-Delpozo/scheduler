import { useNavigate, useFetcher } from "@remix-run/react";
import { useEffect } from "react";

const DisableBackForward = () => {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    // Listener for popstate event
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      // Perform a logout when the user hits the back button
      fetcher.submit(null, { method: "post", action: "/logout" });
    };

    // Push a new state to ensure the initial load has a history entry
    window.history.pushState(null, "", window.location.href);

    // Add event listener for popstate
    window.addEventListener("popstate", handlePopState);

    // Cleanup function to remove the event listener on unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [fetcher, navigate]);

  return null;
};

export default DisableBackForward;
