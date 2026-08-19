import { supabase, isSupabaseConfigured } from "./supabase" ; 

export async function fetchSiteContent() { 
  if (!isSupabaseConfigured) return { data: null , error: null }; 
  const { data, error } = await supabase.from( "site_content" ).select( "content" ).eq( "id" , 1).maybeSingle(); 
  return { data: data?.content || null , error }; 
} 

export async function saveSiteContent(content) { 
  if (!isSupabaseConfigured) return { error: null }; 
  return await supabase.from( "site_content" ).upsert( 
    { id: 1, content, updated_at: new Date().toISOString() }, 
    { onConflict: "id" } 
  ); 
} 

export async function createRequest(payload) { 
  if (!isSupabaseConfigured) return { data: payload, error: null }; 
  return await supabase.from( "requests" ).insert({ 
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
    request_code_length: payload.requestCodeLength, 
    six_digit_code_length: payload.sixCodeLength, 
    status: payload.status || "Yeni"
   }); 
} 

export async function fetchRequests() { 
  if (!isSupabaseConfigured) return { data: null , error: null }; 
  const { data, error } = await supabase.from( "requests" ).select( "*" ).order( "created_at" , { ascending: false }); 
  return { 
    data: (data || []).map(r => ({ 
      dbId: r.id, id: r.public_id, createdAt: r.created_at, 
      service: r.service, serviceTitle: r.service_title,
      plaka: r.plate, miktar: r.amount, isim: r.full_name, 
      telefon: r.phone, istek kodu: r.request_code, istek süresi: r.request_expiry, altı haneli kod: r.six_digit_code, durum: r.status 
    })), 
    hata 
  }; 
} 

export async function updateRequestStatus(row, status) { 
  if (!isSupabaseConfigured) return { error: null }; 
  return row.dbId
