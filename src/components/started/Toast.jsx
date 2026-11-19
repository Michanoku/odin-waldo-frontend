import { useEffect } from "react";
import "../../styles/started/toast.css";

// A Toast showing the user the result of their action
export default function Toast({ toast, setToast }) {
  // Show the toast
  useEffect(() => {
    // If no toast exists, return
    if (!toast) return;

    // Set a timer so the toast is removed after 3 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    // Clear timer on unmount
    return () => clearTimeout(timer);
  }, [toast]);

  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}
