import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brandLight font-body">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <p className="font-serifTitle text-xl font-bold text-brandBlue">{siteConfig.siteName}</p>
          <div className="flex items-center gap-3 text-sm">
            <a className="font-semibold text-brandBlue" href="/dashboard">
              Biblioteca
            </a>
            <a className="rounded-full border border-brandBlue px-3 py-1 font-semibold text-brandBlue" href="/login">
              Sair
            </a>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
