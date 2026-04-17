import "server-only";

import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    return {
      setupMode: true,
      user: null
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase!.auth.getUser();

  if (error || !data.user) {
    redirect("/admin/login");
  }

  return {
    setupMode: false,
    user: data.user
  };
}
