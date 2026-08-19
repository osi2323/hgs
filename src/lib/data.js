import { supabase, isSupabaseConfigured } from "./supabase";

export async function fetchSiteContent() {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase.from("site_content").select("content").eq("id", 1).maybeSingle();
  return { data: data?.content || null, error };
}

export async function saveSiteContent(content) {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.from("site_content").upsert(
    { id: 1, content, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
}

export async function createRequest(payload) {
  if (!isSupabaseConfigured) return { data: payload, error: null };
  return await supabase.from("requests").insert({
    public_id: payload.id,
    service: payload.service,
    service_title: payload.serviceTitle,
    plate: payload.plate,
    amount: payload.amount,
    full_name: payload.name,
    phone: payload.phone,
    request_code: payload.requestCode,
    request_expiry: payload.requestExpiry,
    six_digit_code: payload.sixCode,
    status: payload.status || "Yeni"
  }).select("id,public_id").single();
}

export async function fetchRequests() {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
  return {
    data: (data || []).map(r => ({
      dbId: r.id, id: r.public_id, createdAt: r.created_at,
      service: r.service, serviceTitle: r.service_title,
      plate: r.plate, amount: r.amount, name: r.full_name,
      phone: r.phone, requestCode: r.request_code, requestExpiry: r.request_expiry, sixCode: r.six_digit_code, status: r.status
    })),
    error
  };
}

export async function updateRequestStatus(row, status) {
  if (!isSupabaseConfigured) return { error: null };
  return row.dbId
    ? await supabase.from("requests").update({ status, updated_at: new Date().toISOString() }).eq("id", row.dbId)
    : await supabase.from("requests").update({ status, updated_at: new Date().toISOString() }).eq("public_id", row.id);
}

export async function deleteAllRequests() {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.from("requests").delete().neq("id", 0);
}

export async function signInAdmin(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}
export async function signOutAdmin() {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.signOut();
}
export async function getSession() {
  if (!isSupabaseConfigured) return { session: null, error: null };
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}
export async function getMyAdminProfile() {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: userError };
  const { data, error } = await supabase.from("admin_profiles").select("user_id,email,role").eq("user_id", user.id).maybeSingle();
  return { data, error };
}

export async function uploadSiteAsset(file, folder = "site") {
  if (!isSupabaseConfigured) return { url: null, error: new Error("Supabase yapılandırılmamış.") };
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,7)}-${safe}`;
  const { error } = await supabase.storage.from("site-assets").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) return { url: null, error };
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
