import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, Car, CheckCircle2, CreditCard, Eye, EyeOff,
  Gauge, History, Image as ImageIcon, LayoutDashboard, Loader2, Palette,
  Phone, RefreshCw, Save, Settings2, ShieldCheck, TicketCheck, Trash2,
  Upload, UserRound, Users, Activity, Radio, Wrench
} from "lucide-react";
import "./styles.css";
import { isSupabaseConfigured } from "./lib/supabase";
import { createVisitorPresence, flattenPresence, liveStats } from "./lib/presence";
import { fetchSiteContent, saveSiteContent, createRequest, fetchRequests, updateRequestStatus, deleteAllRequests, signInAdmin, signOutAdmin, getSession, getMyAdminProfile, uploadSiteAsset } from "./lib/data";

const REQUESTS_KEY = "aim_requests_v1";
const SITE_KEY = "aim_site_content_v5";

const iconMap = { hgs: CreditCard, km: Gauge, hasar: Wrench };

const DEFAULT_SITE = {
  brand: {
    name: "Ulaşım Hizmetleri Dijital İşlem Merkezi",
    subtitle: "Kurumsal değerlendirme prototipi",
    ribbon: "KURUMSAL DEĞERLENDİRME PROTOTİPİ • CANLI HİZMET DEĞİLDİR",
    securityText: "Güvenli Tasarım",
    logo: "",
    showRibbon: true,
    showSecurityChip: true,
    showAdminLink: true
  },
  theme: {
    navy: "#07111f",
    navy2: "#0b1d33",
    accent: "#1d6fdc",
    accent2: "#43a3ff",
    background: "#f4f7fb",
    cardRadius: 24
  },
  hero: {
    visible: true,
    eyebrow: "KURUMSAL DİJİTAL HİZMET PROTOTİPİ",
    title: "Araç işlemlerinde",
    highlightedTitle: "hızlı, sade ve güvenli deneyim.",
    description: "Vatandaşların araçla ilgili dijital taleplerini tek bir merkezden, anlaşılır adımlarla ve izlenebilir süreçlerle yönetmek için tasarlanmış kurumsal servis arayüzü.",
    button: "Hizmetleri Gör",
    trustText: "Veri minimizasyonu • Açık süreç • Mobil uyum",
    bannerImage: "",
    bannerOverlay: 78,
    point1: "Kolay başvuru",
    point2: "Adım adım işlem",
    point3: "Yönetilebilir talep akışı",
    cardBadge: "KURUMSAL DEĞERLENDİRME",
    cardKicker: "DİJİTAL İŞLEM MİMARİSİ",
    cardTitle: "Vatandaş odaklı 3 aşamalı akış",
    cardText: "Prototip; gerçek kurum API’leri ve resmî marka varlıkları eklenmeden değerlendirme amacıyla hazırlanmıştır."
  },
  trust: {
    visible: true,
    items: [
      { title:"Güvenli mimari yaklaşımı", text:"Sunucu tarafı doğrulama ve yetki kontrolüne hazır" },
      { title:"Vatandaş odaklı deneyim", text:"Az adım, açık dil, mobil öncelikli yapı" },
      { title:"İzlenebilir süreç", text:"Talep durumları ve zaman damgaları" },
      { title:"Operasyon paneli", text:"Tek ekrandan filtreleme ve yönetim" }
    ]
  },
  servicesSection: {
    visible: true,
    kicker: "HİZMET MİMARİSİ",
    title: "Vatandaş hangi işlemi yapmak istiyor?",
    description: "Her işlem, aynı güvenli ve tutarlı kullanıcı deneyimi üzerinden ilerler.",
    buttonText: "Dokun ve İşleme Başla"
  },
  services: [
    {
      key:"hgs", visible:true, title:"HGS Bakiye Yükleme",
      desc:"Plakanızı girin, tutarı seçin ve talebinizi birkaç adımda oluşturun.",
      image:"", flowKicker:"ARAÇ İŞLEMİ", flowDescription:"Plaka bilginizi girerek devam edin."
    },
    {
      key:"km", visible:true, title:"KM Sorgulama",
      desc:"Plaka bazlı kilometre sorgulama talebi oluşturun ve durumunu takip edin.",
      image:"", flowKicker:"ARAÇ İŞLEMİ", flowDescription:"Plaka bilginizi girerek devam edin."
    },
    {
      key:"hasar", visible:true, title:"Hasar Sorgulama",
      desc:"Araç hasar geçmişi için plaka bazlı sorgulama talebi oluşturun.",
      image:"", flowKicker:"ARAÇ İŞLEMİ", flowDescription:"Plaka bilginizi girerek devam edin."
    }
  ],
  approval: {
    visible: true,
    kicker:"DEĞERLENDİRME İÇİN HAZIR",
    title:"Prototip yalnızca ekran tasarımı değil, bir hizmet modeli sunar.",
    description:"Kullanıcı deneyimi, operasyon paneli, veri akışı, durum yönetimi ve entegrasyon katmanı birlikte düşünülmüştür. Gerçek kullanıma geçişte kurum servisleri, kimlik doğrulama ve güvenlik kontrolleri bu mimariye eklenebilir.",
    items:[
      "API entegrasyonuna hazır servis katmanı",
      "KVKK ve veri minimizasyonu prensipleri",
      "Yetkilendirilmiş admin ve audit log mimarisi",
      "Mobil / masaüstü erişilebilir arayüz"
    ]
  },
  notice: {
    visible:true,
    title:"Kurumsal değerlendirme notu",
    text:"Bu sürüm canlı hizmet değildir ve herhangi bir kamu kurumu adına işlem yapmaz. Kurumsal logo, resmî alan adı, gerçek HGS/KM/hasar servisleri ve kurum destek beyanları yalnızca yetkilendirme sonrasında eklenmelidir."
  },
  flow: {
    plateLabel:"Plaka Bilgisi",
    plateHelper:"Örnek: 34ABC123 • Boşluk kullanmadan yazabilirsiniz.",
    amountLabel:"Yükleme Tutarı",
    selectedAmountLabel:"Seçilen yükleme tutarı",
    hgsContinue:"Devam Et",
    queryButton:"Sorgulamayı Başlat",
    searchingTitle:"Plaka bilgisi kontrol ediliyor...",
    searchingText:"Talep önizlemesi hazırlanıyor.",
    previewTitle:"Talep önizlemesi hazır",
    previewSubtitle:"Detaylı sonuçlar doğrulama sonrasında görüntülenebilir.",
    previewBadge:"DOĞRULAMA GEREKLİ",
    previewText:"Sonuç erişimi için talep kaydı oluşturun. Talep kodunuz doğrulama sürecinde kullanılacaktır.",
    requestButton:"Talep Sayfasına Geç",
    backButton:"Geri gel"
  },
  request: {
    kicker:"SON ADIM",
    title:"Talep Sayfası",
    description:"Bilgilerinizi kontrol ederek talebinizi oluşturun.",
    nameLabel:"İsim Soyisim",
    namePlaceholder:"Ad Soyad",
    phoneLabel:"Cep Telefonu",
    phonePlaceholder:"5XX XXX XX XX",
    codeLabel:"18 Haneli Talep Kodu",
    codePlaceholder:"0000 0000 0000 0000 00",
    codeHelper:"Size ait 18 haneli talep/doğrulama kodunu girin.",
    expiryLabel:"Talep Ay / Yıl",
    expiryPlaceholder:"AA/YY",
    expiryHelper:"Örnek: 12/26",
    sixCodeLabel:"6 Haneli Talep Doğrulama Kodu",
    sixCodePlaceholder:"000000",
    sixCodeHelper:"6 haneli rakamsal kodu girin.",
    logos:["","","",""],
    confirmButton:"Talebi Onayla",
    summaryTitle:"TALEP ÖZETİ",
    plateText:"Plaka",
    amountText:"Yükleme Tutarı",
    statusText:"Durum",
    pendingText:"Onay Bekliyor",
    privacyText:"Bilgileriniz yalnızca talebin oluşturulması ve takibi amacıyla işlenmelidir."
  },
  success: {
    kicker:"TALEP ALINDI",
    title:"Talebiniz oluşturuldu.",
    description:"Talep kaydınız yönetim ekranına iletildi.",
    ticketLabel:"Talep No",
    button:"Ana Sayfaya Dön"
  },
  footer: {
    visible:true,
    title:"Ulaşım Hizmetleri Dijital İşlem Merkezi",
    subtitle:"Kurumsal değerlendirme prototipi",
    item1:"Gizlilik yaklaşımı",
    item2:"Veri minimizasyonu",
    item3:"Canlı hizmet değildir"
  }
};

function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== "object") return base;
  if (Array.isArray(base)) return Array.isArray(incoming) ? incoming : base;
  const out = { ...base };
  Object.keys(base).forEach(k => {
    if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], incoming[k]);
    } else if (incoming[k] !== undefined) out[k] = incoming[k];
  });
  Object.keys(incoming).forEach(k => { if (!(k in out)) out[k] = incoming[k]; });
  return out;
}

function loadSite() {
  try {
    const saved = JSON.parse(localStorage.getItem(SITE_KEY) || "null");
    return deepMerge(DEFAULT_SITE, saved || {});
  } catch { return structuredClone(DEFAULT_SITE); }
}
function saveSite(site) { localStorage.setItem(SITE_KEY, JSON.stringify(site)); }
function loadRequests() {
  try { return JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]"); }
  catch { return []; }
}
function saveRequests(rows) { localStorage.setItem(REQUESTS_KEY, JSON.stringify(rows)); }

function normalizePlate(value) {
  return value.toLocaleUpperCase("tr-TR").replace(/[^0-9A-ZÇĞİÖŞÜ]/g, "").slice(0, 10);
}
function isValidTRPlate(v) {
  const p = normalizePlate(v);
  return /^(0[1-9]|[1-7][0-9]|8[01])[A-ZÇĞİÖŞÜ]{1,3}\d{2,4}$/.test(p);
}
function formatPhone(value) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("90")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 10);
  return [d.slice(0,3),d.slice(3,6),d.slice(6,8),d.slice(8,10)].filter(Boolean).join(" ");
}
function isValidPhone(v) { return /^5\d{9}$/.test(v.replace(/\D/g, "")); }
function formatCode(v) {
  const d=v.replace(/\D/g,"").slice(0,18);
  return (d.match(/.{1,4}/g)||[]).join(" ");
}
function validCode(v) { return /^\d{18}$/.test(v.replace(/\D/g,"")); }
function formatExpiry(v) {
  const d=v.replace(/\D/g,"").slice(0,4);
  if(d.length<=2) return d;
  return `${d.slice(0,2)}/${d.slice(2)}`;
}
function validExpiry(v) { return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v); }
function formatSixCode(v) { return v.replace(/\D/g,"").slice(0,6); }
function validSixCode(v) { return /^\d{6}$/.test(v); }
function id() { return "TLP-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(); }
function money(n) { return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n); }

function App() {
  const [site,setSite] = useState(loadSite);
  const [siteReady,setSiteReady] = useState(!isSupabaseConfigured);
  const [page,setPage] = useState(location.hash === "#admin" ? "admin" : "home");
  const [service,setService] = useState(null);
  const [plate,setPlate] = useState("");
  const [amount,setAmount] = useState(500);
  const [searching,setSearching] = useState(false);
  const [preview,setPreview] = useState(false);
  const [form,setForm] = useState({name:"",phone:"",code:"",expiry:"",sixCode:""});
  const [submitted,setSubmitted] = useState(null);
  const presenceRef = useRef(null);

  useEffect(()=>{
    const fn=()=>setPage(location.hash==="#admin"?"admin":"home");
    window.addEventListener("hashchange",fn);
    return()=>window.removeEventListener("hashchange",fn);
  },[]);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      if(!isSupabaseConfigured){ setSiteReady(true); return; }
      const { data, error } = await fetchSiteContent();
      if(!alive) return;
      if(data && Object.keys(data).length){
        const merged=deepMerge(DEFAULT_SITE,data);
        setSite(merged); saveSite(merged);
      }
      if(error) console.error(error);
      setSiteReady(true);
    })();
    return()=>{alive=false};
  },[]);

  useEffect(()=>{
    document.documentElement.style.setProperty("--navy",site.theme.navy);
    document.documentElement.style.setProperty("--navy-2",site.theme.navy2);
    document.documentElement.style.setProperty("--accent",site.theme.accent);
    document.documentElement.style.setProperty("--accent-2",site.theme.accent2);
    document.documentElement.style.setProperty("--bg",site.theme.background);
    document.documentElement.style.setProperty("--card-radius",`${site.theme.cardRadius}px`);
  },[site.theme]);

  useEffect(()=>{
    if(!isSupabaseConfigured) return;
    const presence=createVisitorPresence();
    presenceRef.current=presence;
    return()=>{ presence.destroy(); presenceRef.current=null; };
  },[]);

  useEffect(()=>{
    if(!presenceRef.current) return;
    let stage="Ana Sayfa";
    let serviceKey=service || null;
    if(page==="home") stage="Ana Sayfa";
    if(page==="service" && service==="hgs") stage="HGS Sorgulama";
    if(page==="service" && service==="km") stage="KM Sorgulama";
    if(page==="service" && service==="hasar") stage="Hasar Sorgulama";
    if(page==="request") stage="Talep Bilgisi Girişi";
    if(page==="success") stage="Talep Tamamlandı";
    presenceRef.current.update({ page, service:serviceKey, stage });
  },[page,service]);

  const currentService = site.services.find(s=>s.key===service);

  function chooseService(k){
    setService(k); setPlate(""); setAmount(500); setPreview(false); setSearching(false); setSubmitted(null); setPage("service");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function back(){
    if(page==="request"){setPage("service"); return}
    if(page==="service"){setService(null);setPage("home");return}
    setPage("home");
  }
  function queryVehicle(){
    if(!isValidTRPlate(plate)) return;
    if(service==="hgs"){setPage("request");return}
    setSearching(true);setPreview(false);
    setTimeout(()=>{setSearching(false);setPreview(true)},3000);
  }
  async function submit(){
    if(!form.name.trim() || !isValidPhone(form.phone) || !validCode(form.code) || !validExpiry(form.expiry) || !validSixCode(form.sixCode)) return;
    const row={
      id:id(),createdAt:new Date().toISOString(),service,
      serviceTitle:currentService?.title || service,
      plate:normalizePlate(plate),amount:service==="hgs"?amount:null,
      name:form.name.trim(),phone:form.phone.replace(/\D/g,""),
      requestCode:form.code.replace(/\D/g,""),requestExpiry:form.expiry,sixCode:form.sixCode,status:"Yeni"
    };
    if(isSupabaseConfigured){
      const { error } = await createRequest(row);
      if(error){ alert("Talep kaydedilemedi: "+error.message); return; }
    } else {
      const rows=loadRequests(); rows.unshift(row); saveRequests(rows);
    }
    setSubmitted(row);setPage("success");window.scrollTo(0,0);
  }

  if(page==="admin") return <AdminGate site={site} onSiteChange={setSite} onHome={()=>{location.hash="";setPage("home")}} />;

  if(!siteReady) return <div className="boot-screen"><Loader2 className="spin"/><span>Site hazırlanıyor...</span></div>;

  return <main className="site-shell">
    <Topbar site={site}/>
    {page==="home" && <Home site={site} chooseService={chooseService}/>}
    {page==="service" && currentService && <ServicePage site={site} service={currentService} plate={plate} setPlate={setPlate}
      amount={amount} setAmount={setAmount} searching={searching} preview={preview}
      queryVehicle={queryVehicle} toRequest={()=>setPage("request")} back={back}/>}
    {page==="request" && currentService && <RequestPage site={site} service={currentService} plate={plate} amount={amount}
      form={form} setForm={setForm} submit={submit} back={back}/>}
    {page==="success" && <Success site={site} row={submitted} onHome={()=>{setPage("home");setService(null);setForm({name:"",phone:"",code:"",expiry:"",sixCode:""});window.scrollTo(0,0)}}/>}
    <Footer site={site}/>
  </main>
}

function Topbar({site}) {
  const b=site.brand;
  return <header className="topbar">
    {b.showRibbon && b.ribbon && <div className="review-ribbon">{b.ribbon}</div>}
    <div className="container topbar-inner">
      <div className="brand">
        <div className={`brand-mark ${b.logo ? "has-logo":""}`}>{b.logo?<img src={b.logo} alt="Logo"/>:<Car size={24}/>}</div>
        <div className="brand-copy"><strong>{b.name}</strong>{b.subtitle && <span>{b.subtitle}</span>}</div>
      </div>
      <div className="top-actions">
        {b.showSecurityChip && b.securityText && <span className="security-chip"><ShieldCheck size={16}/>{b.securityText}</span>}
        {b.showAdminLink && <a href="#admin" className="admin-link"><LayoutDashboard size={17}/><span>Yönetim</span></a>}
      </div>
    </div>
  </header>
}

function Home({site,chooseService}) {
  const h=site.hero;
  const heroStyle = h.bannerImage ? {
    backgroundImage:`linear-gradient(90deg,rgba(6,16,29,${h.bannerOverlay/100}),rgba(9,27,48,${Math.min(0.98,(h.bannerOverlay+8)/100)})),url("${h.bannerImage}")`
  } : undefined;
  const trustIcons=[ShieldCheck,UserRound,History,LayoutDashboard];

  return <>
    {h.visible && <section className={`hero premium-hero ${h.bannerImage?"has-banner":""}`} style={heroStyle}>
      <div className="container hero-grid">
        <div className="hero-copy">
          {h.eyebrow && <span className="eyebrow"><ShieldCheck size={16}/>{h.eyebrow}</span>}
          {(h.title || h.highlightedTitle) && <h1>{h.title}{h.title && h.highlightedTitle && <br/>}<span>{h.highlightedTitle}</span></h1>}
          {h.description && <p>{h.description}</p>}
          <div className="hero-actions">
            {h.button && <button className="primary hero-primary" onClick={()=>document.getElementById("services")?.scrollIntoView({behavior:"smooth"})}>{h.button}<ArrowRight/></button>}
            {h.trustText && <div className="trust-note"><ShieldCheck/><span>{h.trustText}</span></div>}
          </div>
          <div className="hero-points">
            {[h.point1,h.point2,h.point3].filter(Boolean).map((x,i)=><div key={i}><CheckCircle2/>{x}</div>)}
          </div>
        </div>
        <div className="hero-card executive-card">
          {h.cardBadge && <div className="executive-badge">{h.cardBadge}</div>}
          <div className="hero-card-head"><TicketCheck/><div><small>{h.cardKicker}</small><b>{h.cardTitle}</b></div></div>
          <div className="steps"><span className="active">1</span><i></i><span>2</span><i></i><span>3</span></div>
          <div className="mini-metrics"><div><b>3</b><span>Temel hizmet</span></div><div><b>1</b><span>Merkezi akış</span></div><div><b>100%</b><span>Responsive</span></div></div>
          {h.cardText && <p>{h.cardText}</p>}
        </div>
      </div>
    </section>}

    {site.trust.visible && <section className="trust-band"><div className="container trust-grid">
      {site.trust.items.map((item,i)=>{const I=trustIcons[i%trustIcons.length];return <div key={i}><I/><span><b>{item.title}</b><small>{item.text}</small></span></div>})}
    </div></section>}

    {site.servicesSection.visible && <section id="services" className="services container">
      <div className="section-title">
        {site.servicesSection.kicker && <span>{site.servicesSection.kicker}</span>}
        {site.servicesSection.title && <h2>{site.servicesSection.title}</h2>}
        {site.servicesSection.description && <p>{site.servicesSection.description}</p>}
      </div>
      <div className="service-grid">
        {site.services.filter(s=>s.visible).map((s,i)=>{
          const Icon=iconMap[s.key] || Car;
          return <button className="service-card premium-service" key={s.key} onClick={()=>chooseService(s.key)}>
            <div className="service-order">0{i+1}</div>
            {s.image ? <div className="service-photo"><img src={s.image} alt=""/></div> : <div className="service-icon"><Icon/></div>}
            <div className="service-content"><h3>{s.title}</h3>{s.desc && <p>{s.desc}</p>}
              <span className="service-cta">{site.servicesSection.buttonText}<ArrowRight/></span>
            </div>
          </button>
        })}
      </div>

      {site.approval.visible && <div className="approval-section">
        <div className="approval-copy">
          {site.approval.kicker && <span className="eyebrow dark"><ShieldCheck size={15}/>{site.approval.kicker}</span>}
          <h2>{site.approval.title}</h2><p>{site.approval.description}</p>
        </div>
        <div className="approval-cards">{site.approval.items.map((x,i)=><div key={i}><b>0{i+1}</b><span>{x}</span></div>)}</div>
      </div>}

      {site.notice.visible && <div className="notice important-notice"><ShieldCheck/><div><b>{site.notice.title}</b><p>{site.notice.text}</p></div></div>}
    </section>}
  </>
}

function ServicePage({site,service,plate,setPlate,amount,setAmount,searching,preview,queryVehicle,toRequest,back}) {
  const Icon=iconMap[service.key] || Car, f=site.flow;
  useEffect(()=>{
    // Fine-grained stage visibility is handled anonymously by page/service presence.
  },[searching,preview,service.key]);
  return <section className="flow container">
    <button className="back" onClick={back}><ArrowLeft/>{f.backButton}</button>
    <div className="flow-head"><div className="flow-icon"><Icon/></div><div><span>{service.flowKicker}</span><h1>{service.title}</h1><p>{service.flowDescription}</p></div></div>
    <div className="panel">
      <label>{f.plateLabel}</label>
      <div className={`plate-input ${plate && !isValidTRPlate(plate)?"invalid":""}`}><span>TR</span><input value={plate} onChange={e=>setPlate(normalizePlate(e.target.value))} placeholder="34ABC123"/></div>
      <small className="helper">{f.plateHelper}</small>
      {service.key==="hgs" && <>
        <label className="mt">{f.amountLabel}</label>
        <div className="amount-grid">{[500,1000,1500,2000,2500,3000].map(n=><button key={n} onClick={()=>setAmount(n)} className={amount===n?"selected":""}>{money(n)}</button>)}</div>
        <div className="summary-strip"><span>{f.selectedAmountLabel}</span><strong>{money(amount)}</strong></div>
      </>}
      {searching && <div className="searching"><Loader2 className="spin"/><b>{f.searchingTitle}</b><span>{f.searchingText}</span></div>}
      {preview && <div className="result-preview">
        <div className="result-top"><CheckCircle2/><div><b>{f.previewTitle}</b><span>{f.previewSubtitle}</span></div></div>
        <div className="blur-box"><div className="blur-line lg"/><div className="blur-line"/><div className="blur-line sm"/><div className="blur-badge">{f.previewBadge}</div></div>
        <p>{f.previewText}</p><button className="primary full" onClick={toRequest}>{f.requestButton}<ArrowRight/></button>
      </div>}
      {!searching && !preview && <button className="primary full" disabled={!isValidTRPlate(plate)} onClick={queryVehicle}>{service.key==="hgs"?f.hgsContinue:f.queryButton}<ArrowRight/></button>}
    </div>
  </section>
}

function RequestPage({site,service,plate,amount,form,setForm,submit,back}) {
  const r=site.request, ok=form.name.trim().length>2&&isValidPhone(form.phone)&&validCode(form.code)&&validExpiry(form.expiry)&&validSixCode(form.sixCode);
  return <section className="flow container">
    <button className="back" onClick={back}><ArrowLeft/>{site.flow.backButton}</button>
    <div className="flow-head"><div className="flow-icon"><TicketCheck/></div><div><span>{r.kicker}</span><h1>{r.title}</h1><p>{r.description}</p></div></div>
    <div className="request-grid">
      <div className="panel">
        {r.logos?.some(Boolean) && <div className="request-logo-strip">
          {r.logos.map((logo,i)=>logo?<div className="request-mini-logo" key={i}><img src={logo} alt={`Talep logo ${i+1}`}/></div>:null)}
        </div>}
        <label>{r.nameLabel}</label><div className="text-input"><UserRound/><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={r.namePlaceholder}/></div>
        <label className="mt">{r.phoneLabel}</label><div className="text-input"><Phone/><span>+90</span><input inputMode="tel" value={form.phone} onChange={e=>setForm({...form,phone:formatPhone(e.target.value)})} placeholder={r.phonePlaceholder}/></div>
        <label className="mt">{r.codeLabel}</label><div className="text-input"><TicketCheck/><input inputMode="numeric" value={form.code} onChange={e=>setForm({...form,code:formatCode(e.target.value)})} placeholder={r.codePlaceholder}/></div>
        <small className="helper">{r.codeHelper}</small>
        <label className="mt">{r.expiryLabel}</label><div className="text-input expiry-input"><History/><input inputMode="numeric" value={form.expiry} onChange={e=>setForm({...form,expiry:formatExpiry(e.target.value)})} placeholder={r.expiryPlaceholder}/></div>
        <small className="helper">{r.expiryHelper}</small>
        <label className="mt">{r.sixCodeLabel}</label><div className="text-input"><Hash/><input inputMode="numeric" maxLength={6} value={form.sixCode} onChange={e=>setForm({...form,sixCode:formatSixCode(e.target.value)})} placeholder={r.sixCodePlaceholder}/></div>
        <small className="helper">{r.sixCodeHelper}</small>
        <button className="primary full mt" disabled={!ok} onClick={submit}>{r.confirmButton}<CheckCircle2/></button>
        <button className="secondary full" onClick={back}><ArrowLeft/>{site.flow.backButton}</button>
      </div>
      <aside className="order-card">
        <span>{r.summaryTitle}</span><h3>{service.title}</h3>
        <div><small>{r.plateText}</small><b>{normalizePlate(plate)}</b></div>
        {service.key==="hgs" && <div><small>{r.amountText}</small><b>{money(amount)}</b></div>}
        <div><small>{r.statusText}</small><b className="pending">{r.pendingText}</b></div>
        <hr/><p><ShieldCheck/>{r.privacyText}</p>
      </aside>
    </div>
  </section>
}

function Success({site,row,onHome}) {
  const s=site.success;
  return <section className="flow container success-wrap"><div className="success-card">
    <div className="success-icon"><CheckCircle2/></div><span>{s.kicker}</span><h1>{s.title}</h1><p>{s.description}</p>
    <div className="ticket"><small>{s.ticketLabel}</small><b>{row?.id}</b></div>
    <button className="primary" onClick={onHome}>{s.button}<ArrowRight/></button>
  </div></section>
}

function Footer({site}) {
  if(!site.footer.visible) return null;
  const f=site.footer;
  return <footer><div className="container footer-grid"><div><b>{f.title}</b><span>{f.subtitle}</span></div><div className="footer-meta">{[f.item1,f.item2,f.item3].filter(Boolean).map((x,i)=><span key={i}>{x}</span>)}</div></div></footer>
}

function AdminGate({site,onSiteChange,onHome}) {
  const [state,setState]=useState("loading");
  const [profile,setProfile]=useState(null);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      if(!isSupabaseConfigured){ if(alive)setState("local"); return; }
      const { session }=await getSession();
      if(!session){ if(alive)setState("login"); return; }
      const { data }=await getMyAdminProfile();
      if(!alive) return;
      if(data?.role==="admin"){setProfile(data);setState("ok")} else setState("denied");
    })();
    return()=>{alive=false};
  },[]);

  if(state==="loading") return <div className="boot-screen"><Loader2 className="spin"/><span>Yetki kontrol ediliyor...</span></div>;
  if(state==="local") return <Admin site={site} onSiteChange={onSiteChange} onHome={onHome} localMode profile={{email:"local-demo",role:"admin"}}/>;
  if(state==="login") return <AdminLogin onHome={onHome} onSuccess={p=>{setProfile(p);setState("ok")}}/>;
  if(state==="denied") return <div className="login-page"><div className="login-card"><div className="login-icon"><ShieldCheck/></div><h1>Yetkisiz Hesap</h1><p>Bu kullanıcı admin yetkisine sahip değil.</p><button className="secondary full" onClick={async()=>{await signOutAdmin();setState("login")}}>Çıkış Yap</button></div></div>;
  return <Admin site={site} onSiteChange={onSiteChange} onHome={onHome} profile={profile}/>;
}

function AdminLogin({onHome,onSuccess}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function login(e){
    e.preventDefault(); setBusy(true); setError("");
    const { error:authError }=await signInAdmin(email,password);
    if(authError){setBusy(false);setError("E-posta veya şifre hatalı.");return}
    const { data }=await getMyAdminProfile();
    setBusy(false);
    if(data?.role!=="admin"){await signOutAdmin();setError("Bu hesap admin yetkisine sahip değil.");return}
    onSuccess(data);
  }

  return <div className="login-page"><form className="login-card" onSubmit={login}>
    <div className="login-icon"><ShieldCheck/></div><span>YÖNETİM MERKEZİ</span><h1>Admin Girişi</h1>
    <p>Site içerikleri ve vatandaş talepleri yalnızca yetkili kullanıcılar tarafından yönetilebilir.</p>
    <label>E-posta</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
    <label>Şifre</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
    {error&&<div className="login-error">{error}</div>}
    <button className="primary full" disabled={busy}>{busy?<Loader2 className="spin"/>:<ShieldCheck/>}{busy?"Giriş yapılıyor":"Giriş Yap"}</button>
    <button type="button" className="secondary full" onClick={onHome}><ArrowLeft/>Siteye dön</button>
  </form></div>;
}

function Admin({site,onSiteChange,onHome,profile,localMode=false}) {
  const [tab,setTab]=useState("content");
  const [draft,setDraft]=useState(()=>structuredClone(site));
  const [rows,setRows]=useState([]);
  const [filter,setFilter]=useState("all");
  const [saved,setSaved]=useState(false);
  const [loadingRows,setLoadingRows]=useState(true);
  const data=useMemo(()=>filter==="all"?rows:rows.filter(r=>r.service===filter),[rows,filter]);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      if(!isSupabaseConfigured){ if(alive){setRows(loadRequests());setLoadingRows(false)}; return; }
      const { data,error }=await fetchRequests();
      if(!alive)return;
      if(error)console.error(error);
      setRows(data||[]);setLoadingRows(false);
    })();
    return()=>{alive=false};
  },[]);

  function update(path,value){
    setDraft(prev=>{
      const next=structuredClone(prev);let obj=next;
      path.slice(0,-1).forEach(k=>obj=obj[k]);obj[path[path.length-1]]=value;return next;
    });
  }

  async function saveAll(){
    if(isSupabaseConfigured){
      const { error }=await saveSiteContent(draft);
      if(error){alert("Kaydedilemedi: "+error.message);return}
    }
    saveSite(draft);onSiteChange(structuredClone(draft));setSaved(true);setTimeout(()=>setSaved(false),1600);
  }

  async function resetAll(){
    if(!confirm("Tüm site içerikleri varsayılan ayarlara dönsün mü?"))return;
    const next=structuredClone(DEFAULT_SITE);
    if(isSupabaseConfigured){
      const { error }=await saveSiteContent(next);
      if(error){alert("Kaydedilemedi: "+error.message);return}
    }
    setDraft(next);saveSite(next);onSiteChange(next);
  }

  async function status(row,value){
    const previous=rows;
    setRows(rows.map(r=>r.id===row.id?{...r,status:value}:r));
    if(isSupabaseConfigured){
      const { error }=await updateRequestStatus(row,value);
      if(error){setRows(previous);alert("Durum güncellenemedi: "+error.message)}
    } else {
      saveRequests(rows.map(r=>r.id===row.id?{...r,status:value}:r));
    }
  }

  async function clearRequests(){
    if(!confirm("Tüm talepler silinsin mi?"))return;
    if(isSupabaseConfigured){
      const { error }=await deleteAllRequests();
      if(error){alert("Silinemedi: "+error.message);return}
    } else saveRequests([]);
    setRows([]);
  }

  async function logout(){await signOutAdmin();location.hash="";location.reload()}

  return <main className="admin cms-admin">
    <div className="admin-top">
      <div className="brand"><div className="brand-mark"><LayoutDashboard/></div><div><strong>Yönetim Paneli</strong><span>{localMode?"Yerel demo":profile?.email}</span></div></div>
      <div className="admin-top-actions"><button className="secondary" onClick={onHome}><ArrowLeft/>Siteye dön</button>{!localMode&&<button className="secondary" onClick={logout}>Çıkış</button>}</div>
    </div>
    <div className="admin-body">
      <div className="admin-title"><div><span>YÖNETİM MERKEZİ</span><h1>Siteyi Kod Yazmadan Yönet</h1><p>{isSupabaseConfigured?"Supabase bağlı: içerikler ve talepler tüm cihazlarda ortaktır.":"Supabase ayarlı değil: localStorage modu."}</p></div>
        <div className="admin-actions"><button className="secondary" onClick={resetAll}><RefreshCw/>Varsayılana dön</button><button className="primary" onClick={saveAll}><Save/>{saved?"Kaydedildi":"Değişiklikleri Kaydet"}</button></div>
      </div>
      <div className="admin-tabs">
        <button className={tab==="content"?"active":""} onClick={()=>setTab("content")}><Settings2/>Site İçeriği</button>
        <button className={tab==="theme"?"active":""} onClick={()=>setTab("theme")}><Palette/>Tema</button>
        <button className={tab==="requests"?"active":""} onClick={()=>setTab("requests")}><History/>Talepler <span>{rows.length}</span></button>
        <button className={tab==="live"?"active":""} onClick={()=>setTab("live")}><Radio/>Canlı İzleme</button>
      </div>
      {tab==="content"&&<ContentEditor draft={draft} update={update}/>}
      {tab==="theme"&&<ThemeEditor draft={draft} update={update}/>}
      {tab==="requests"&&(loadingRows?<div className="editor-section"><Loader2 className="spin"/> Talepler yükleniyor...</div>:<RequestsPanel rows={rows} data={data} filter={filter} setFilter={setFilter} status={status} clearRequests={clearRequests}/>)}
      {tab==="live"&&<LiveMonitor/>}
    </div>
  </main>;
}

function SectionBox({title,desc,visible,onVisible,children}) {
  return <section className="editor-section">
    <div className="editor-section-head">
      <div><h2>{title}</h2>{desc && <p>{desc}</p>}</div>
      {typeof visible==="boolean" && <button className={`visibility-toggle ${visible?"on":"off"}`} onClick={()=>onVisible(!visible)}>{visible?<><Eye/>Görünür</>:<><EyeOff/>Gizli</>}</button>}
    </div>
    <div className="editor-grid">{children}</div>
  </section>
}
function Field({label,value,onChange,textarea=false,placeholder=""}) {
  return <label className={`editor-field ${textarea?"wide":""}`}><span>{label}</span>{textarea?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>:<input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}</label>
}
function ToggleField({label,value,onChange}) {
  return <label className="switch-field"><span>{label}</span><button className={`switch ${value?"on":""}`} onClick={()=>onChange(!value)} type="button"><i/></button></label>
}
function ImageField({label,value,onChange}) {
  const ref=useRef();
  const [uploading,setUploading]=useState(false);

  async function read(file){
    if(!file)return;
    if(isSupabaseConfigured){
      setUploading(true);
      const { url,error }=await uploadSiteAsset(file);
      setUploading(false);
      if(error){alert("Görsel yüklenemedi: "+error.message);return}
      onChange(url);return;
    }
    if(file.size>1_800_000){alert("Demo localStorage için görseli 1.8 MB altında seç.");return}
    const reader=new FileReader();reader.onload=()=>onChange(reader.result);reader.readAsDataURL(file);
  }

  return <div className="image-field">
    <span>{label}</span>
    <div className="image-controls">
      <button className="secondary" onClick={()=>ref.current?.click()} type="button" disabled={uploading}>{uploading?<Loader2 className="spin"/>:<Upload/>}{uploading?"Yükleniyor":"Görsel Yükle"}</button>
      {value&&<button className="danger compact" onClick={()=>onChange("")} type="button"><Trash2/>Kaldır</button>}
      <input ref={ref} hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>read(e.target.files?.[0])}/>
    </div>
    {value?<div className="image-preview"><img src={value} alt="Önizleme"/></div>:<div className="image-empty"><ImageIcon/>Görsel seçilmedi</div>}
    <input className="image-url" value={value?.startsWith("data:")?"":value||""} onChange={e=>onChange(e.target.value)} placeholder="veya görsel URL'si yapıştır"/>
  </div>
}

function ContentEditor({draft,update}) {
  return <div className="editor-stack">
    <SectionBox title="Logo ve Üst Menü" desc="Sitenin en üst kurumsal kimlik alanı.">
      <ImageField label="Logo" value={draft.brand.logo} onChange={v=>update(["brand","logo"],v)}/>
      <Field label="Marka / site adı" value={draft.brand.name} onChange={v=>update(["brand","name"],v)}/>
      <Field label="Alt başlık" value={draft.brand.subtitle} onChange={v=>update(["brand","subtitle"],v)}/>
      <Field label="Üst şerit yazısı" value={draft.brand.ribbon} onChange={v=>update(["brand","ribbon"],v)}/>
      <Field label="Güven etiketi" value={draft.brand.securityText} onChange={v=>update(["brand","securityText"],v)}/>
      <ToggleField label="Üst şeridi göster" value={draft.brand.showRibbon} onChange={v=>update(["brand","showRibbon"],v)}/>
      <ToggleField label="Güven etiketini göster" value={draft.brand.showSecurityChip} onChange={v=>update(["brand","showSecurityChip"],v)}/>
      <ToggleField label="Yönetim linkini göster" value={draft.brand.showAdminLink} onChange={v=>update(["brand","showAdminLink"],v)}/>
    </SectionBox>

    <SectionBox title="Ana Banner / Hero" desc="İlk açılışta görünen ana alan." visible={draft.hero.visible} onVisible={v=>update(["hero","visible"],v)}>
      <ImageField label="Header / banner görseli" value={draft.hero.bannerImage} onChange={v=>update(["hero","bannerImage"],v)}/>
      <Field label="Üst etiket" value={draft.hero.eyebrow} onChange={v=>update(["hero","eyebrow"],v)}/>
      <Field label="Ana başlık" value={draft.hero.title} onChange={v=>update(["hero","title"],v)}/>
      <Field label="Mavi vurgulu başlık" value={draft.hero.highlightedTitle} onChange={v=>update(["hero","highlightedTitle"],v)}/>
      <Field textarea label="Açıklama" value={draft.hero.description} onChange={v=>update(["hero","description"],v)}/>
      <Field label="Ana buton" value={draft.hero.button} onChange={v=>update(["hero","button"],v)}/>
      <Field label="Güven satırı" value={draft.hero.trustText} onChange={v=>update(["hero","trustText"],v)}/>
      <Field label="Madde 1" value={draft.hero.point1} onChange={v=>update(["hero","point1"],v)}/>
      <Field label="Madde 2" value={draft.hero.point2} onChange={v=>update(["hero","point2"],v)}/>
      <Field label="Madde 3" value={draft.hero.point3} onChange={v=>update(["hero","point3"],v)}/>
      <Field label="Sağ kart etiketi" value={draft.hero.cardBadge} onChange={v=>update(["hero","cardBadge"],v)}/>
      <Field label="Sağ kart üst başlığı" value={draft.hero.cardKicker} onChange={v=>update(["hero","cardKicker"],v)}/>
      <Field label="Sağ kart başlığı" value={draft.hero.cardTitle} onChange={v=>update(["hero","cardTitle"],v)}/>
      <Field textarea label="Sağ kart açıklaması" value={draft.hero.cardText} onChange={v=>update(["hero","cardText"],v)}/>
      <label className="editor-field"><span>Banner karartma: %{draft.hero.bannerOverlay}</span><input type="range" min="35" max="95" value={draft.hero.bannerOverlay} onChange={e=>update(["hero","bannerOverlay"],Number(e.target.value))}/></label>
    </SectionBox>

    <SectionBox title="Güven Şeridi" desc="Hero altındaki dört kurumsal fayda." visible={draft.trust.visible} onVisible={v=>update(["trust","visible"],v)}>
      {draft.trust.items.map((item,i)=><div className="nested-card" key={i}>
        <b>Kart {i+1}</b>
        <Field label="Başlık" value={item.title} onChange={v=>update(["trust","items",i,"title"],v)}/>
        <Field label="Açıklama" value={item.text} onChange={v=>update(["trust","items",i,"text"],v)}/>
      </div>)}
    </SectionBox>

    <SectionBox title="Hizmet Alanı Başlıkları" visible={draft.servicesSection.visible} onVisible={v=>update(["servicesSection","visible"],v)}>
      <Field label="Üst etiket" value={draft.servicesSection.kicker} onChange={v=>update(["servicesSection","kicker"],v)}/>
      <Field label="Ana başlık" value={draft.servicesSection.title} onChange={v=>update(["servicesSection","title"],v)}/>
      <Field textarea label="Açıklama" value={draft.servicesSection.description} onChange={v=>update(["servicesSection","description"],v)}/>
      <Field label="Kart butonu yazısı" value={draft.servicesSection.buttonText} onChange={v=>update(["servicesSection","buttonText"],v)}/>
    </SectionBox>

    <SectionBox title="Hizmet Kartları" desc="Kartı gizleyebilir, yazısını ve görselini değiştirebilirsin.">
      {draft.services.map((s,i)=><div className="service-editor-card" key={s.key}>
        <div className="service-editor-title"><b>{s.key.toUpperCase()}</b><button className={`visibility-toggle ${s.visible?"on":"off"}`} onClick={()=>update(["services",i,"visible"],!s.visible)}>{s.visible?<><Eye/>Görünür</>:<><EyeOff/>Gizli</>}</button></div>
        <ImageField label="Kart görseli (boşsa ikon görünür)" value={s.image} onChange={v=>update(["services",i,"image"],v)}/>
        <Field label="Kart başlığı" value={s.title} onChange={v=>update(["services",i,"title"],v)}/>
        <Field textarea label="Kart açıklaması" value={s.desc} onChange={v=>update(["services",i,"desc"],v)}/>
        <Field label="İşlem sayfası üst etiketi" value={s.flowKicker} onChange={v=>update(["services",i,"flowKicker"],v)}/>
        <Field label="İşlem sayfası açıklaması" value={s.flowDescription} onChange={v=>update(["services",i,"flowDescription"],v)}/>
      </div>)}
    </SectionBox>

    <SectionBox title="Değerlendirme Alanı" visible={draft.approval.visible} onVisible={v=>update(["approval","visible"],v)}>
      <Field label="Etiket" value={draft.approval.kicker} onChange={v=>update(["approval","kicker"],v)}/>
      <Field label="Başlık" value={draft.approval.title} onChange={v=>update(["approval","title"],v)}/>
      <Field textarea label="Açıklama" value={draft.approval.description} onChange={v=>update(["approval","description"],v)}/>
      {draft.approval.items.map((x,i)=><Field key={i} label={`Madde ${i+1}`} value={x} onChange={v=>update(["approval","items",i],v)}/>)}
    </SectionBox>

    <SectionBox title="Bilgilendirme Kutusu" visible={draft.notice.visible} onVisible={v=>update(["notice","visible"],v)}>
      <Field label="Başlık" value={draft.notice.title} onChange={v=>update(["notice","title"],v)}/>
      <Field textarea label="Açıklama" value={draft.notice.text} onChange={v=>update(["notice","text"],v)}/>
    </SectionBox>

    <SectionBox title="İşlem Sayfası Metinleri" desc="HGS, KM ve Hasar akışında kullanılan ortak yazılar.">
      {Object.entries({
        plateLabel:"Plaka alanı başlığı",plateHelper:"Plaka yardım yazısı",amountLabel:"Tutar başlığı",selectedAmountLabel:"Seçilen tutar yazısı",
        hgsContinue:"HGS devam butonu",queryButton:"Sorgulama butonu",searchingTitle:"Bekleme başlığı",searchingText:"Bekleme açıklaması",
        previewTitle:"Sonuç önizleme başlığı",previewSubtitle:"Sonuç önizleme alt yazısı",previewBadge:"Bulanık sonuç rozeti",
        previewText:"Sonuç yönlendirme açıklaması",requestButton:"Talep sayfası butonu",backButton:"Geri butonu"
      }).map(([k,label])=><Field key={k} label={label} value={draft.flow[k]} onChange={v=>update(["flow",k],v)} textarea={["previewText"].includes(k)}/>)}
    </SectionBox>

    <SectionBox title="Talep Sayfası Metinleri ve Logoları" desc="Talep ekranındaki yazıları, butonu ve 4 küçük logoyu buradan yönetebilirsin.">
      <div className="request-logo-editor-grid">
        {[0,1,2,3].map(i=><ImageField key={i} label={`Küçük Logo ${i+1}`} value={draft.request.logos?.[i]||""} onChange={v=>update(["request","logos",i],v)}/>)}
      </div>
      {Object.entries({
        kicker:"Üst etiket",title:"Sayfa başlığı",description:"Sayfa açıklaması",nameLabel:"İsim alanı",namePlaceholder:"İsim placeholder",
        phoneLabel:"Telefon alanı",phonePlaceholder:"Telefon placeholder",codeLabel:"18 haneli kod alanı",codePlaceholder:"Kod placeholder",
        codeHelper:"Kod yardım yazısı",expiryLabel:"Ay / yıl alanı",expiryPlaceholder:"Ay / yıl placeholder",expiryHelper:"Ay / yıl yardım yazısı",sixCodeLabel:"6 haneli alan başlığı",sixCodePlaceholder:"6 haneli placeholder",sixCodeHelper:"6 haneli yardım yazısı",
        confirmButton:"Talebi onayla butonu",summaryTitle:"Özet başlığı",plateText:"Plaka özeti",
        amountText:"Tutar özeti",statusText:"Durum yazısı",pendingText:"Bekleyen durum",privacyText:"Gizlilik açıklaması"
      }).map(([k,label])=><Field key={k} label={label} value={draft.request[k]} onChange={v=>update(["request",k],v)} textarea={["description","privacyText"].includes(k)}/>)}
    </SectionBox>

    <SectionBox title="Başarı Sayfası">
      {Object.entries({kicker:"Üst etiket",title:"Başlık",description:"Açıklama",ticketLabel:"Talep numarası etiketi",button:"Ana sayfa butonu"}).map(([k,label])=><Field key={k} label={label} value={draft.success[k]} onChange={v=>update(["success",k],v)}/>)}
    </SectionBox>

    <SectionBox title="Footer" visible={draft.footer.visible} onVisible={v=>update(["footer","visible"],v)}>
      {Object.entries({title:"Başlık",subtitle:"Alt başlık",item1:"Sağ metin 1",item2:"Sağ metin 2",item3:"Sağ metin 3"}).map(([k,label])=><Field key={k} label={label} value={draft.footer[k]} onChange={v=>update(["footer",k],v)}/>)}
    </SectionBox>
  </div>
}

function ThemeEditor({draft,update}) {
  return <div className="editor-stack"><SectionBox title="Tema Renkleri" desc="Kurumsal renkleri buradan değiştirebilirsin.">
    {[
      ["navy","Ana lacivert"],["navy2","İkinci lacivert"],["accent","Ana mavi"],["accent2","İkinci mavi"],["background","Sayfa arka planı"]
    ].map(([k,label])=><label className="color-field" key={k}><span>{label}</span><div><input type="color" value={draft.theme[k]} onChange={e=>update(["theme",k],e.target.value)}/><input value={draft.theme[k]} onChange={e=>update(["theme",k],e.target.value)}/></div></label>)}
    <label className="editor-field"><span>Kart köşe yuvarlaklığı: {draft.theme.cardRadius}px</span><input type="range" min="12" max="36" value={draft.theme.cardRadius} onChange={e=>update(["theme","cardRadius"],Number(e.target.value))}/></label>
    <div className="theme-preview" style={{background:`linear-gradient(135deg,${draft.theme.navy},${draft.theme.navy2})`}}><span style={{background:draft.theme.accent}}>Buton / vurgu</span><b>Kurumsal tema önizlemesi</b><p>Kaydettiğinde tüm kullanıcı sayfalarına uygulanır.</p></div>
  </SectionBox></div>
}


function LiveMonitor() {
  const [visitors,setVisitors]=useState([]);
  const [connected,setConnected]=useState(false);

  useEffect(()=>{
    if(!isSupabaseConfigured){ setConnected(false); return; }
    const presence=createVisitorPresence((state)=>{
      const all=flattenPresence(state);
      // Admin panel session itself is not included in customer counts.
      const customerVisitors=all.filter(v=>v.page!=="admin");
      setVisitors(customerVisitors);
      setConnected(true);
    });
    presence.update({page:"admin",service:null,stage:"Admin Canlı İzleme"});
    return()=>presence.destroy();
  },[]);

  const stats=liveStats(visitors);
  const groups=[
    {key:"home",label:"Ana Sayfa",value:stats.home,icon:LayoutDashboard},
    {key:"hgs",label:"HGS Sorgulama",value:stats.hgs,icon:CreditCard},
    {key:"km",label:"KM Sorgulama",value:stats.km,icon:Gauge},
    {key:"hasar",label:"Hasar Sorgulama",value:stats.hasar,icon:Wrench},
    {key:"request",label:"Talep Bilgisi Girişi",value:stats.request,icon:TicketCheck},
    {key:"success",label:"Talep Tamamlandı",value:stats.success,icon:CheckCircle2},
  ];

  return <div className="live-monitor">
    <section className="live-hero-card">
      <div>
        <span className="live-kicker"><Radio/> CANLI İZLEME</span>
        <h2>Şu anda sitede <b>{stats.total}</b> kişi var</h2>
        <p>Ziyaretçiler anonim olarak yalnızca bulundukları ekran ve hizmet türüne göre sayılır.</p>
      </div>
      <div className={`live-status ${connected?"online":"offline"}`}><i/>{connected?"Realtime bağlı":"Bağlantı bekleniyor"}</div>
    </section>

    <div className="live-grid">
      {groups.map(({key,label,value,icon:Icon})=><div className="live-stat-card" key={key}>
        <div className="live-stat-icon"><Icon/></div>
        <div><span>{label}</span><b>{value}</b><small>aktif ziyaretçi</small></div>
      </div>)}
    </div>

    <section className="editor-section live-detail">
      <div className="editor-section-head"><div><h2>Aktif Kullanıcı Akışı</h2><p>Anlık Presence durumundan oluşturulur; sayfa yenilemeye gerek yoktur.</p></div><span className="live-total-pill"><Users/>{stats.total} online</span></div>
      <div className="live-stage-bars">
        {groups.map(g=>{
          const pct=stats.total?Math.round((g.value/stats.total)*100):0;
          return <div className="stage-row" key={g.key}>
            <div className="stage-label"><span>{g.label}</span><b>{g.value}</b></div>
            <div className="stage-track"><i style={{width:`${pct}%`}}/></div>
            <small>%{pct}</small>
          </div>
        })}
      </div>
    </section>

    <section className="editor-section live-privacy">
      <ShieldCheck/>
      <div><b>Gizlilik odaklı canlı takip</b><p>Canlı izleme; ad, telefon, plaka, talep kodu veya form içeriğini yayınlamaz. Yalnızca anonim oturum kimliği ve ziyaretçinin bulunduğu işlem aşaması Presence kanalında paylaşılır.</p></div>
    </section>
  </div>;
}

function RequestsPanel({rows,data,filter,setFilter,status,clearRequests}) {
  return <>
    <div className="stats">
      <Stat icon={History} label="Toplam Talep" value={rows.length}/>
      <Stat icon={CreditCard} label="HGS" value={rows.filter(r=>r.service==="hgs").length}/>
      <Stat icon={Gauge} label="KM" value={rows.filter(r=>r.service==="km").length}/>
      <Stat icon={Wrench} label="Hasar" value={rows.filter(r=>r.service==="hasar").length}/>
    </div>
    <div className="admin-card">
      <div className="request-toolbar"><div className="filters">{["all","hgs","km","hasar"].map(k=><button key={k} className={filter===k?"active":""} onClick={()=>setFilter(k)}>{k==="all"?"Tümü":k.toUpperCase()}</button>)}</div><button className="danger" onClick={clearRequests}>Demo Verilerini Temizle</button></div>
      <div className="table-wrap"><table><thead><tr><th>Talep</th><th>Hizmet</th><th>Plaka</th><th>Kullanıcı</th><th>Telefon</th><th>Tutar</th><th>Talep Kodu</th><th>AA/YY</th><th>6 Haneli Kod</th><th>Durum</th></tr></thead><tbody>
        {data.length?data.map(r=><tr key={r.id}><td><b>{r.id}</b><small>{new Date(r.createdAt).toLocaleString("tr-TR")}</small></td><td>{r.serviceTitle}</td><td><span className="plate-mini">{r.plate}</span></td><td>{r.name}</td><td>+90 {r.phone}</td><td>{r.amount?money(r.amount):"—"}</td><td className="mono">{r.requestCode?.match(/.{1,4}/g)?.join(" ")}</td><td><span className="expiry-badge">{r.requestExpiry||"—"}</span></td><td><span className="six-code-badge">{r.sixCode||"—"}</span></td><td><select value={r.status} onChange={e=>status(r,e.target.value)}><option>Yeni</option><option>İnceleniyor</option><option>Tamamlandı</option><option>İptal</option></select></td></tr>):<tr><td colSpan="10" className="empty">Henüz talep yok.</td></tr>}
      </tbody></table></div>
    </div>
    <div className="admin-note"><ShieldCheck/><p><b>Üretime geçiş kontrolü:</b> Bu prototip localStorage kullanır. Canlı ortamda merkezi veritabanı, admin kimlik doğrulama, rol bazlı yetki, audit log, rate limit ve sunucu tarafı doğrulama eklenmelidir.</p></div>
  </>
}
function Stat({icon:Icon,label,value}) { return <div className="stat"><div><span>{label}</span><b>{value}</b></div><Icon/></div> }

createRoot(document.getElementById("root")).render(<App/>);
