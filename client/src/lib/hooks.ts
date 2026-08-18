import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export const useFetch = <T>(path: string) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    api<T>(path)
      .then(setData)
      .catch((err) => setError((err as Error).message));
  }, [path]);

  useEffect(reload, [reload]);

  return { data, error, reload };
}
