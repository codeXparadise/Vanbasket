import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Van Bakset profile, saved addresses, and order history.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
