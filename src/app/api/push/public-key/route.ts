import { NextResponse } from "next/server";
import { getVapidPublicKey, isWebPushConfigured } from "@/lib/push/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isWebPushConfigured();
  return NextResponse.json({
    configured,
    storageConfigured: isSupabaseAdminConfigured(),
    publicKey: configured ? getVapidPublicKey() : null,
  });
}
