"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost"
      type="button"
      onClick={async () => {
        await fetch("/api/v1/biller/login", { method: "DELETE" });
        router.push("/login");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
