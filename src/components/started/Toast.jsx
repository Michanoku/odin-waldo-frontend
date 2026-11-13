import { useEffect } from "react";
import "../../styles/started/toast.css";

export default function Toast({toast, setToast}) {

useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}