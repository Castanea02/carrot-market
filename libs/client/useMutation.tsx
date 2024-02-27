import { useState } from "react";

interface useMutationState {
  loading: boolean;
  data?: object;
  error?: object;
}

type useMutationResult = [(data: any) => void, useMutationState]; //return data 타입 정의

/**url을인자로 받음 */
export default function useMutation(url: string): useMutationResult {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<undefined | any>(undefined);
  const [error, setError] = useState<undefined | any>(undefined);

  function mutation(data: any) {
    setLoading(true);
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json().catch(() => {}))
      .then((json) => setData(json))
      .catch(setError)
      .finally(() => setLoading(false));
  }

  return [mutation, { loading, data, error }];
}
