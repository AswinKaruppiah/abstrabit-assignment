"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/config/browser-client";

export default function HomeOverview({ initialData }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("bookmark")
      .insert([
        {
          title: name,
          url: age,
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Insert error:", error.message);
      return;
    }

    setName("");
    setAge("");
  };

  // ✅ Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("bookmark").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      return;
    }

    // remove deleted item from UI
    setProfiles((prev) => prev.filter((item) => item.id !== id));
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("bookmark")
      .select("*")
      .order("inserted_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }

    setProfiles(data);
  };

  useEffect(() => {
    let channel;

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("bookmark")
        .select("*")
        .order("inserted_at", { ascending: false });

      if (!error) {
        setProfiles(data);
      }

      channel = supabase
        .channel("bookmark-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmark",
          },
          (payload) => {
            // Handle different events
            if (payload.eventType === "INSERT") {
              setProfiles((prev) => [payload.new, ...prev]);
            }
            if (payload.eventType === "UPDATE") {
              setProfiles((prev) =>
                prev.map((b) => (b.id === payload.new.id ? payload.new : b)),
              );
            }
            if (payload.eventType === "DELETE") {
              console.log(payload);

              setProfiles((prev) =>
                prev.filter((b) => b.id !== payload.old.id),
              );
            }
          },
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen flex-col flex items-center justify-center text-7xl">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-medium text-slate-800 bg-blue-100 py-2 px-4 border border-blue-500 rounded capitalize">
          {user?.user_metadata?.full_name ?? "user"}
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <button type="submit">Done</button>
        </form>
        {profiles?.length === 0 ? (
          <p>No data yet</p>
        ) : (
          profiles?.map((item, i) => (
            <div key={item.id} className="p-4 border rounded bg-slate-100">
              <h2>{i + 1}</h2>
              <p>
                <strong>Name:</strong> {item.title}
              </p>
              <p>
                <strong>Age:</strong> {item.url}
              </p>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          ))
        )}
        <button
          onClick={handleSignOut}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
