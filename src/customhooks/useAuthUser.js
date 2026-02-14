"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/config/browser-client";

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getUser();

        if (error) {
          setError(error);
        } else {
          setUser(data?.user || null);
        }
      } catch (err) {
        console.log(err);

        setError(err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  return { user, loading, error };
}
