import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function useUser() {
  //useQuery 같은 거 fetching을 캐싱
  const { data, error } = useSWR("/api/users/me");
  const router = useRouter();

  useEffect(() => {
    if (data && !data.ok) {
      router.replace("/enter");
    }
  }, [data, router]);

  // const [user, setUser] = useState();
  // const router = useRouter();
  // useEffect(() => {
  //   fetch("/api/users/me")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       //push는 브라우저에서 옮긴 히스토리가 남음
  //       if (!data.ok) {
  //         return router.replace("/enter");
  //       }
  //       setUser(data.profile);
  //     });
  // }, [router]);

  return { user: data?.profile, isLoading: !data && !error };
}
