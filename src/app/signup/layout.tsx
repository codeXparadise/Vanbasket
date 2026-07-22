import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Van Bakset account to reserve harvests and manage orders.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
