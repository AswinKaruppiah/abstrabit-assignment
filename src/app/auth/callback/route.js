import { createClient } from "@/config/server-client";
import { NextResponse } from "next/server";
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth error:", error.message);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_failed`,
    );
  }

  const response = NextResponse.redirect(`${requestUrl.origin}/`);

  return response;
}
