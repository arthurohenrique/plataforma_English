import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string | undefined;

    if (!user || (role !== "admin" && role !== "professor")) {
      redirect("/dashboard");
    }
  } catch {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
