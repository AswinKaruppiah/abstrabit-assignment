"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/config/browser-client";
import Navbar from "./Navbar";
import { useAuthUser } from "@/customhooks/useAuthUser";
import Link from "next/link";
import toast from "react-hot-toast";

export default function HomeOverview({ initialData }) {
  const { user, loading, error } = useAuthUser();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  const [bookmarkError, setBookmarkError] = useState(null);
  const [bookmarLoading, setBookmarLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("User not logged in");
      return;
    }

    try {
      setBookmarLoading(true);
      const { error } = await supabase
        .from("bookmark")
        .insert([
          {
            title,
            url,
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      toast.success("Bookmark added successfully");
      setTitle("");
      setUrl("");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBookmarLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("bookmark").delete().eq("id", id);
      if (error) {
        throw error;
      }

      setProfiles((prev) => prev.filter((item) => item.id !== id));

      toast.success("Deleted successfully");
    } catch (error) {
      toast.error(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!user) return;

    let channel;

    const setup = async () => {
      if (!user) {
        toast.error("User not logged in");
        return;
      }

      setBookmarkLoading(true);
      const { data, error } = await supabase
        .from("bookmark")
        .select("*")
        .order("inserted_at", { ascending: false });

      if (!error) {
        setProfiles(data);
      }
      setBookmarkLoading(false);

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
              setProfiles((prev) =>
                prev.filter((b) => b.id !== payload.old.id),
              );
            }
          },
        )
        .subscribe((status) => {});
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="space-y-4">
          <h1 className="text-6xl py-6 text-center">Add Your Own Bookmarks</h1>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center justify-center gap-2"
          >
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 w-full pl-2 focus:outline-blue-400 rounded-md text-sm max-w-96 border-black/10 border-2"
            />
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="h-10 w-full pl-2 focus:outline-blue-400 rounded-md text-sm max-w-96 border-black/10 border-2"
            />
            <button
              type="submit"
              disabled={bookmarLoading || loading}
              className="py-2 mt-2 px-6 bg-black/5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bookmarLoading ? "Loading..." : "Add"}
            </button>
          </form>
          <div>
            <h2 className="text-3xl py-6">BookMarks</h2>
            <BookMarkGrid
              bookmarks={profiles}
              handleDelete={handleDelete}
              loading={bookmarkLoading}
              error={bookmarkError}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const BookMarkGrid = ({ bookmarks = [], handleDelete, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 w-full rounded-2xl bg-black/20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (bookmarks?.length <= 0) {
    return (
      <div className="text-center">
        <h4 className="text-5xl font-medium mt-10 opacity-70">
          No Bookmarks Yet
        </h4>
      </div>
    );
  }

  if (bookmarks?.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ">
        {bookmarks?.map((item, i) => (
          <div
            key={item.id}
            className="flex justify-between w-full overflow-hidden rounded-2xl shadow bg-white border border-gray-200"
          >
            <div className="p-4 pl-5 flex-1 min-w-0">
              <h5 className="text-lg font-semibold truncate capitalize">
                {item.title}
              </h5>
              <Link
                href={item.url}
                target="_blank"
                className="block truncate underline text-blue-500"
              >
                {item.url}
              </Link>
            </div>
            <div
              onClick={() => handleDelete(item.id)}
              className="py-4 group cursor-pointer px-4 flex items-center border-l border-gray-300 hover:bg-red-100 transition-all"
            >
              <button>
                <DeleteIcon className="size-5 text-gray-600 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

const DeleteIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
      fill="currentColor"
      {...props}
    >
      <path d="M 20.5 4 A 1.50015 1.50015 0 0 0 19.066406 6 L 14.640625 6 C 12.803372 6 11.082924 6.9194511 10.064453 8.4492188 L 7.6972656 12 L 7.5 12 A 1.50015 1.50015 0 1 0 7.5 15 L 8.2636719 15 A 1.50015 1.50015 0 0 0 8.6523438 15.007812 L 11.125 38.085938 C 11.423352 40.868277 13.795836 43 16.59375 43 L 31.404297 43 C 34.202211 43 36.574695 40.868277 36.873047 38.085938 L 39.347656 15.007812 A 1.50015 1.50015 0 0 0 39.728516 15 L 40.5 15 A 1.50015 1.50015 0 1 0 40.5 12 L 40.302734 12 L 37.935547 8.4492188 C 36.916254 6.9202798 35.196001 6 33.359375 6 L 28.933594 6 A 1.50015 1.50015 0 0 0 27.5 4 L 20.5 4 z M 14.640625 9 L 33.359375 9 C 34.196749 9 34.974746 9.4162203 35.439453 10.113281 L 36.697266 12 L 11.302734 12 L 12.560547 10.113281 A 1.50015 1.50015 0 0 0 12.5625 10.111328 C 13.025982 9.4151428 13.801878 9 14.640625 9 z M 11.669922 15 L 36.330078 15 L 33.890625 37.765625 C 33.752977 39.049286 32.694383 40 31.404297 40 L 16.59375 40 C 15.303664 40 14.247023 39.049286 14.109375 37.765625 L 11.669922 15 z"></path>
    </svg>
  );
};
