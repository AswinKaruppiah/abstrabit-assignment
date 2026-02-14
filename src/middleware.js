import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 Protect homepage
  if (pathname === "/" && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚫 Prevent logged user from seeing login
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
