import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Profile",
  description: "Complete your Van Bakset account details before checkout.",
};

export default function CompleteProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
