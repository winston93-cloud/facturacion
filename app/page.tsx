import { redirect } from "next/navigation";

// 2026-04-28: Entrada rápida al flujo principal (login).

export default function Home() {
  redirect("/login");
}
