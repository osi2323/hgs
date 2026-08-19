import { supabase, isSupabaseConfigured } from "./supabase";

const VISITOR_KEY = "aim_visitor_id_v2";

function getBaseVisitorId() {
  try {
    let id = sessionStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function createVisitorPresence({
  onState,
  onStatus,
  mode = "visitor",
} = {}) {
  if (!isSupabaseConfigured || !supabase) {
    onStatus?.("NOT_CONFIGURED");
    return {
      update: async () => {},
      destroy: async () => {},
      channel: null,
    };
  }

  const baseId = getBaseVisitorId();

  // Admin tracker and public visitor tracker must not share the same presence key.
  const presenceKey =
    mode === "admin"
      ? `admin-${baseId}-${Math.random().toString(36).slice(2, 7)}`
      : baseId;

  let current = {
    visitorId: presenceKey,
    page: mode === "admin" ? "admin" : "home",
    service: null,
    stage: mode === "admin" ? "Admin Canlı İzleme" : "Ana Sayfa",
    updatedAt: new Date().toISOString(),
  };

  let subscribed = false;

  const channel = supabase.channel("aim-live-visitors-v2", {
    config: {
      presence: { key: presenceKey },
    },
  });

  function emitState() {
    try {
      onState?.(channel.presenceState());
    } catch (err) {
      console.error("Presence state error:", err);
    }
  }

  async function update(patch = {}) {
    current = {
      ...current,
      ...patch,
      visitorId: presenceKey,
      updatedAt: new Date().toISOString(),
    };

    if (!subscribed) return;

    try {
      await channel.track(current);
    } catch (err) {
      console.error("Presence track error:", err);
      onStatus?.("TRACK_ERROR", err);
    }
  }

  try {
    channel
      .on("presence", { event: "sync" }, emitState)
      .on("presence", { event: "join" }, emitState)
      .on("presence", { event: "leave" }, emitState)
      .subscribe(async (status, err) => {
        onStatus?.(status, err);

        if (status === "SUBSCRIBED") {
          subscribed = true;
          try {
            await channel.track(current);
            emitState();
          } catch (trackErr) {
            console.error("Initial presence track error:", trackErr);
            onStatus?.("TRACK_ERROR", trackErr);
          }
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          subscribed = false;
        }
      });
  } catch (err) {
    console.error("Presence subscribe error:", err);
    onStatus?.("CHANNEL_ERROR", err);
  }

  return {
    channel,
    update,
    destroy: async () => {
      subscribed = false;
      try { await channel.untrack(); } catch {}
      try { await supabase.removeChannel(channel); } catch {}
    },
  };
}

export function flattenPresence(state = {}) {
  try {
    return Object.values(state || {})
      .flat()
      .filter(Boolean)
      .map((item) => ({
        visitorId: item.visitorId || item.presence_ref || "unknown",
        page: item.page || "unknown",
        service: item.service || null,
        stage: item.stage || "Bilinmiyor",
        updatedAt: item.updatedAt || null,
      }));
  } catch {
    return [];
  }
}

export function liveStats(visitors = []) {
  const count = (fn) => visitors.filter(fn).length;

  return {
    total: visitors.length,
    home: count((v) => v.page === "home"),
    hgs: count((v) => v.service === "hgs" && v.page === "service"),
    km: count((v) => v.service === "km" && v.page === "service"),
    hasar: count((v) => v.service === "hasar" && v.page === "service"),
    request: count((v) => v.page === "request"),
    success: count((v) => v.page === "success"),
  };
}
