import { useState, useCallback } from "react";

export function useSuccess(timeout = 3000) {
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);

    if (timeout > 0) {
      setTimeout(() => {
        setSuccess(null);
      }, timeout);
    }
  }, [timeout]);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  return {
    success,
    showSuccess,
    clearSuccess,
  };
}
