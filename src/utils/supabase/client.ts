import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://iyzhmgyfxqpwchfdhvei.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5emhtZ3lmeHFwd2NoZmRodmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTU0NzAsImV4cCI6MjEwMDI5MTQ3MH0.FpCgjLlKbWsahvlxrFSmKyP3-4ajIvv5ffUKFK--12c";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
