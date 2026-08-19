import { supabase, isSupabaseConfigured } from "./supabase";

const VISITOR_KEY = "aim_visitor_id_v1";

export function getVisitorId() {
  let id = sessionStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function createVisitorPresence(onState) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      update: async () => {},
      destroy: async () => {},
      channel: null,
    };
  }

  const visitorId = getVisitorId();
  let current = {
    visitorId,
    page: "home",
    service: null,
    stage: "Ana Sayfa",
    updatedAt: new Date().toISOString(),
  };

  const channel = supabase.channel("aim-live-visitors", {
    config: {
      presence: { key: visitorId },
    },
  });

  async function update(patch = {}) {
    current = {
      ...current,
      ...patch,
      visitorId,
      updatedAt: new Date().toISOString(),
    };
    try {
      await channel.track(current);
    } catch (e) {
      console.error("Presence track error:", e);
    }
  }

  channel
    .on("presence", { event: "sync" }, () => {
      onState?.(channel.presenceState());
    })
    .on("presence", { event: "join" }, () => {
      onState?.(channel.presenceState());
    })
    .on("presence", { event: "leave" }, () => {
      onState?.(channel.presenceState());
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(current);
        onState?.(channel.presenceState());
      }
    });

  return {
    channel,
    update,
    destroy: async () => {
      try { await channel.untrack(); } catch {}
      try { await supabase.removeChannel(channel); } catch {}
    },
  };
}

export function flattenPresence(state = {}) {
  return Object.values(state)
    .flat()
    .filter(Boolean)
    .map(item => ({
      visitorId: item.visitorId || item.presence_ref || "unknown",
      page: item.page || "unknown",
      service: item.service || null,
      stage: item.stage || "Bilinmiyor",
      updatedAt: item.updatedAt || null,
    }));
}

export function liveStats(visitors = []) {
  const count = (fn) => visitors.filter(fn).length;
  return {
    total: visitors.length,
    home: count(v => v.page === "home"),
    hgs: count(v => v.service === "hgs" && v.page === "service"),
    km: count(v => v.service === "km" && v.page === "service"),
    hasar: count(v => v.service === "hasar" && v.page === "service"),
    request: count(v => v.page === "request"),
    success: count(v => v.page === "success"),
  };
}
