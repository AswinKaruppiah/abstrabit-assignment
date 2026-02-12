import { createClient } from "@/config/server-client";
import GoogleLoginPage from "@/sections/Login";

export default async function page() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return <GoogleLoginPage />;
}
