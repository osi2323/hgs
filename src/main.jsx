import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, Car, CheckCircle2, CreditCard, Gauge,
  History, LayoutDashboard, Loader2, Phone, Search, ShieldCheck,
  TicketCheck, UserRound, Wrench, XCircle
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "aim_requests_v1";

function loadRequests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveRequests(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}
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
  const a=d.slice(0,3), b=d.slice(3,6), c=d.slice(6,8), e=d.slice(8,10);
  return [a,b,c,e].filter(Boolean).join(" ");
}
function isValidPhone(v) {
  const d = v.replace(/\D/g, "");
  return /^5\d{9}$/.test(d);
}
function formatCode(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function validCode(v) {
  return /^\d{16}$/.test(v.replace(/\D/g, ""));
}
function id() {
  return "TLP-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
}
function money(n) {
  return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);
}

const services = [
  { key:"hgs", title:"HGS Bakiye Yükleme", desc:"Plakanızı girin, tutarı seçin ve talebinizi birkaç adımda oluşturun.", icon:CreditCard },
  { key:"km", title:"KM Sorgulama", desc:"Plaka bazlı kilometre sorgulama talebi oluşturun ve durumunu takip edin.", icon:Gauge },
  { key:"hasar", title:"Hasar Sorgulama", desc:"Araç hasar geçmişi için plaka bazlı sorgulama talebi oluşturun.", icon:Wrench }
];

function App() {
  const [page,setPage] = useState(location.hash === "#admin" ? "admin" : "home");
  const [service,setService] = useState(null);
  const [plate,setPlate] = useState("");
  const [amount,setAmount] = useState(500);
  const [searching,setSearching] = useState(false);
  const [preview,setPreview] = useState(false);
  const [form,setForm] = useState({name:"", phone:"", code:""});
  const [submitted,setSubmitted] = useState(null);

  useEffect(() => {
    const fn=()=>setPage(location.hash==="#admin"?"admin":"home");
    window.addEventListener("hashchange",fn); return()=>window.removeEventListener("hashchange",fn);
  },[]);

  function chooseService(k){
    setService(k); setPlate(""); setAmount(500); setPreview(false); setSubmitted(null); setPage("service");
  }
  function back(){
    if(page==="request"){setPage("service"); return}
    if(page==="service"){setService(null); setPage("home"); return}
    setPage("home");
  }
  function queryVehicle(){
    if(!isValidTRPlate(plate)) return;
    if(service==="hgs"){ setPage("request"); return; }
    setSearching(true); setPreview(false);
    setTimeout(()=>{ setSearching(false); setPreview(true); },3000);
  }
  function toRequest(){ setPage("request"); }
  function submit(){
    if(!form.name.trim() || !isValidPhone(form.phone) || !validCode(form.code)) return;
    const row={
      id:id(), createdAt:new Date().toISOString(), service,
      serviceTitle:services.find(s=>s.key===service)?.title,
      plate:normalizePlate(plate), amount:service==="hgs"?amount:null,
      name:form.name.trim(), phone:form.phone.replace(/\D/g,""),
      requestCode:form.code.replace(/\D/g,""), status:"Yeni"
    };
    const rows=loadRequests(); rows.unshift(row); saveRequests(rows);
    setSubmitted(row); setPage("success");
  }

  if(page==="admin") return <Admin onHome={()=>{location.hash=""; setPage("home")}} />;
  return (
    <main>
      <Topbar />
      {page==="home" && <Home chooseService={chooseService} />}
      {page==="service" && <ServicePage service={service} plate={plate} setPlate={setPlate}
        amount={amount} setAmount={setAmount} searching={searching} preview={preview}
        queryVehicle={queryVehicle} toRequest={toRequest} back={back} />}
      {page==="request" && <RequestPage service={service} plate={plate} amount={amount}
        form={form} setForm={setForm} submit={submit} back={back} />}
      {page==="success" && <Success row={submitted} onHome={()=>{setPage("home");setService(null);setForm({name:"",phone:"",code:""});}} />}
      <Footer />
    </main>
  );
}

function Topbar(){
  return <header className="topbar">
    <div className="review-ribbon">KURUMSAL DEĞERLENDİRME PROTOTİPİ • CANLI HİZMET DEĞİLDİR</div>
    <div className="container topbar-inner">
      <div className="brand">
        <div className="brand-mark"><Car size={24}/></div>
        <div><strong>Ulaşım Hizmetleri Dijital İşlem Merkezi</strong><span>Kurumsal değerlendirme prototipi</span></div>
      </div>
      <div className="top-actions">
        <span className="security-chip"><ShieldCheck size={16}/> Güvenli Tasarım</span>
        <a href="#admin" className="admin-link"><LayoutDashboard size={17}/> Yönetim</a>
      </div>
    </div>
  </header>
}
function Home({chooseService}){
  return <>
    <section className="hero premium-hero">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow"><ShieldCheck size={16}/> KURUMSAL DİJİTAL HİZMET PROTOTİPİ</span>
          <h1>Araç işlemlerinde<br/><span>hızlı, sade ve güvenli deneyim.</span></h1>
          <p>Vatandaşların araçla ilgili dijital taleplerini tek bir merkezden, anlaşılır adımlarla ve izlenebilir süreçlerle yönetmek için tasarlanmış kurumsal servis arayüzü.</p>
          <div className="hero-actions">
            <button className="primary hero-primary" onClick={()=>document.getElementById("services")?.scrollIntoView({behavior:"smooth"})}>
              Hizmetleri Gör <ArrowRight/>
            </button>
            <div className="trust-note"><ShieldCheck/><span>Veri minimizasyonu • Açık süreç • Mobil uyum</span></div>
          </div>
          <div className="hero-points">
            <div><CheckCircle2/> Kolay başvuru</div>
            <div><CheckCircle2/> Adım adım işlem</div>
            <div><CheckCircle2/> Yönetilebilir talep akışı</div>
          </div>
        </div>
        <div className="hero-card executive-card">
          <div className="executive-badge">KURUMSAL DEĞERLENDİRME</div>
          <div className="hero-card-head"><TicketCheck/><div><small>DİJİTAL İŞLEM MİMARİSİ</small><b>Vatandaş odaklı 3 aşamalı akış</b></div></div>
          <div className="steps"><span className="active">1</span><i></i><span>2</span><i></i><span>3</span></div>
          <div className="mini-metrics">
            <div><b>3</b><span>Temel hizmet</span></div>
            <div><b>1</b><span>Merkezi talep akışı</span></div>
            <div><b>100%</b><span>Responsive arayüz</span></div>
          </div>
          <p>Prototip; gerçek kurum API’leri ve resmî marka varlıkları eklenmeden değerlendirme amacıyla hazırlanmıştır.</p>
        </div>
      </div>
    </section>

    <section className="trust-band">
      <div className="container trust-grid">
        <div><ShieldCheck/><span><b>Güvenli mimari yaklaşımı</b><small>Sunucu tarafı doğrulama ve yetki kontrolüne hazır</small></span></div>
        <div><UserRound/><span><b>Vatandaş odaklı deneyim</b><small>Az adım, açık dil, mobil öncelikli yapı</small></span></div>
        <div><History/><span><b>İzlenebilir süreç</b><small>Talep durumları ve zaman damgaları</small></span></div>
        <div><LayoutDashboard/><span><b>Operasyon paneli</b><small>Tek ekrandan filtreleme ve yönetim</small></span></div>
      </div>
    </section>

    <section id="services" className="services container">
      <div className="section-title"><span>HİZMET MİMARİSİ</span><h2>Vatandaş hangi işlemi yapmak istiyor?</h2><p>Her işlem, aynı güvenli ve tutarlı kullanıcı deneyimi üzerinden ilerler.</p></div>
      <div className="service-grid">
        {services.map(({key,title,desc,icon:Icon},i)=>
          <button className="service-card premium-service" key={key} onClick={()=>chooseService(key)}>
            <div className="service-order">0{i+1}</div>
            <div className="service-icon"><Icon/></div>
            <div><h3>{title}</h3><p>{desc}</p><span className="service-cta">İşleme başla <ArrowRight/></span></div>
          </button>)}
      </div>

      <div className="approval-section">
        <div className="approval-copy">
          <span className="eyebrow dark"><ShieldCheck size={15}/> DEĞERLENDİRME İÇİN HAZIR</span>
          <h2>Prototip yalnızca ekran tasarımı değil, bir hizmet modeli sunar.</h2>
          <p>Kullanıcı deneyimi, operasyon paneli, veri akışı, durum yönetimi ve entegrasyon katmanı birlikte düşünülmüştür. Gerçek kullanıma geçişte kurum servisleri, kimlik doğrulama ve güvenlik kontrolleri bu mimariye eklenebilir.</p>
        </div>
        <div className="approval-cards">
          <div><b>01</b><span>API entegrasyonuna hazır servis katmanı</span></div>
          <div><b>02</b><span>KVKK ve veri minimizasyonu prensipleri</span></div>
          <div><b>03</b><span>Yetkilendirilmiş admin ve audit log mimarisi</span></div>
          <div><b>04</b><span>Mobil / masaüstü erişilebilir arayüz</span></div>
        </div>
      </div>

      <div className="notice important-notice"><ShieldCheck/><div><b>Kurumsal değerlendirme notu</b><p>Bu sürüm canlı hizmet değildir ve herhangi bir kamu kurumu adına işlem yapmaz. Kurumsal logo, resmî alan adı, gerçek HGS/KM/hasar servisleri ve kurum destek beyanları yalnızca yetkilendirme sonrasında eklenmelidir.</p></div></div>
    </section>
  </>
}
function ServicePage({service,plate,setPlate,amount,setAmount,searching,preview,queryVehicle,toRequest,back}){
  const s=services.find(x=>x.key===service), Icon=s.icon;
  return <section className="flow container">
    <button className="back" onClick={back}><ArrowLeft/> Geri gel</button>
    <div className="flow-head"><div className="flow-icon"><Icon/></div><div><span>ARAÇ İŞLEMİ</span><h1>{s.title}</h1><p>Plaka bilginizi girerek devam edin.</p></div></div>
    <div className="panel">
      <label>Plaka Bilgisi</label>
      <div className={"plate-input "+(plate && !isValidTRPlate(plate)?"invalid":"")}>
        <span>TR</span><input value={plate} onChange={e=>setPlate(normalizePlate(e.target.value))} placeholder="34ABC123" />
      </div>
      <small className="helper">Örnek: 34ABC123 • Boşluk kullanmadan yazabilirsiniz.</small>

      {service==="hgs" && <>
        <label className="mt">Yükleme Tutarı</label>
        <div className="amount-grid">
          {[500,1000,1500,2000,2500,3000].map(n=><button onClick={()=>setAmount(n)} className={amount===n?"selected":""} key={n}>{money(n)}</button>)}
        </div>
        <div className="summary-strip"><span>Seçilen yükleme tutarı</span><strong>{money(amount)}</strong></div>
      </>}

      {searching && <div className="searching"><Loader2 className="spin"/><b>Plaka bilgisi kontrol ediliyor...</b><span>Talep önizlemesi hazırlanıyor.</span></div>}
      {preview && <div className="result-preview">
        <div className="result-top"><CheckCircle2/><div><b>Talep önizlemesi hazır</b><span>Detaylı sonuçlar doğrulama sonrasında görüntülenebilir.</span></div></div>
        <div className="blur-box"><div className="blur-line lg"></div><div className="blur-line"></div><div className="blur-line sm"></div><div className="blur-badge">DOĞRULAMA GEREKLİ</div></div>
        <p>Sonuç erişimi için talep kaydı oluşturun. Talep kodunuz doğrulama sürecinde kullanılacaktır.</p>
        <button className="primary" onClick={toRequest}>Talep Sayfasına Geç <ArrowRight/></button>
      </div>}
      {!searching && !preview && <button className="primary full" disabled={!isValidTRPlate(plate)} onClick={queryVehicle}>
        {service==="hgs"?"Devam Et":"Sorgulamayı Başlat"} <ArrowRight/>
      </button>}
    </div>
  </section>
}
function RequestPage({service,plate,amount,form,setForm,submit,back}){
  const s=services.find(x=>x.key===service);
  const ok=form.name.trim().length>2 && isValidPhone(form.phone) && validCode(form.code);
  return <section className="flow container">
    <button className="back" onClick={back}><ArrowLeft/> Geri gel</button>
    <div className="flow-head"><div className="flow-icon"><TicketCheck/></div><div><span>SON ADIM</span><h1>Talep Sayfası</h1><p>Bilgilerinizi kontrol ederek talebinizi oluşturun.</p></div></div>
    <div className="request-grid">
      <div className="panel">
        <label>İsim Soyisim</label>
        <div className="text-input"><UserRound/><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ad Soyad"/></div>
        <label className="mt">Cep Telefonu</label>
        <div className="text-input"><Phone/><span>+90</span><input value={form.phone} onChange={e=>setForm({...form,phone:formatPhone(e.target.value)})} placeholder="5XX XXX XX XX"/></div>
        <label className="mt">16 Haneli Talep Kodu</label>
        <div className="text-input"><CreditCard/><input inputMode="numeric" value={form.code} onChange={e=>setForm({...form,code:formatCode(e.target.value)})} placeholder="0000 0000 0000 0000"/></div>
        <small className="helper">Size ait 16 haneli talep/doğrulama kodunu girin.</small>
        <button className="primary full mt" disabled={!ok} onClick={submit}>Talebi Onayla <CheckCircle2/></button>
        <button className="secondary full" onClick={back}><ArrowLeft/> Geri gel</button>
      </div>
      <aside className="order-card">
        <span>TALEP ÖZETİ</span><h3>{s.title}</h3>
        <div><small>Plaka</small><b>{normalizePlate(plate)}</b></div>
        {service==="hgs" && <div><small>Yükleme Tutarı</small><b>{money(amount)}</b></div>}
        <div><small>Durum</small><b className="pending">Onay Bekliyor</b></div>
        <hr/><p><ShieldCheck/> Bilgileriniz yalnızca talebin oluşturulması ve takibi amacıyla işlenmelidir.</p>
      </aside>
    </div>
  </section>
}
function Success({row,onHome}){
  return <section className="flow container success-wrap">
    <div className="success-card"><div className="success-icon"><CheckCircle2/></div><span>TALEP ALINDI</span><h1>Talebiniz oluşturuldu.</h1><p>Talep kaydınız yönetim ekranına iletildi.</p>
      <div className="ticket"><small>Talep No</small><b>{row?.id}</b></div>
      <button className="primary" onClick={onHome}>Ana Sayfaya Dön <ArrowRight/></button>
    </div>
  </section>
}
function Admin({onHome}){
  const [rows,setRows]=useState(loadRequests());
  const [filter,setFilter]=useState("all");
  const data=useMemo(()=>filter==="all"?rows:rows.filter(r=>r.service===filter),[rows,filter]);
  function status(id,status){ const n=rows.map(r=>r.id===id?{...r,status}:r); setRows(n); saveRequests(n); }
  function clear(){ if(confirm("Tüm demo talepleri silinsin mi?")){setRows([]);saveRequests([])}}
  return <main className="admin">
    <div className="admin-top"><div className="brand"><div className="brand-mark"><LayoutDashboard/></div><div><strong>Yönetim Paneli</strong><span>Talep merkezi</span></div></div><button className="secondary" onClick={onHome}><ArrowLeft/> Siteye dön</button></div>
    <div className="admin-body">
      <div className="admin-title"><div><span>GENEL BAKIŞ</span><h1>Kurumsal Talep Yönetimi</h1><p>Vatandaş başvurularını, işlem tiplerini ve süreç durumlarını tek ekrandan yönetin.</p></div><button className="danger" onClick={clear}>Demo Verilerini Temizle</button></div>
      <div className="stats">
        <Stat icon={History} label="Toplam Talep" value={rows.length}/>
        <Stat icon={CreditCard} label="HGS" value={rows.filter(r=>r.service==="hgs").length}/>
        <Stat icon={Gauge} label="KM" value={rows.filter(r=>r.service==="km").length}/>
        <Stat icon={Wrench} label="Hasar" value={rows.filter(r=>r.service==="hasar").length}/>
      </div>
      <div className="admin-card">
        <div className="filters">{["all","hgs","km","hasar"].map(k=><button key={k} className={filter===k?"active":""} onClick={()=>setFilter(k)}>{k==="all"?"Tümü":k.toUpperCase()}</button>)}</div>
        <div className="table-wrap"><table><thead><tr><th>Talep</th><th>Hizmet</th><th>Plaka</th><th>Kullanıcı</th><th>Telefon</th><th>Tutar</th><th>Talep Kodu</th><th>Durum</th></tr></thead>
        <tbody>{data.length?data.map(r=><tr key={r.id}>
          <td><b>{r.id}</b><small>{new Date(r.createdAt).toLocaleString("tr-TR")}</small></td>
          <td>{r.serviceTitle}</td><td><span className="plate-mini">{r.plate}</span></td><td>{r.name}</td><td>+90 {r.phone}</td><td>{r.amount?money(r.amount):"—"}</td><td className="mono">{r.requestCode.match(/.{1,4}/g)?.join(" ")}</td>
          <td><select value={r.status} onChange={e=>status(r.id,e.target.value)}><option>Yeni</option><option>İnceleniyor</option><option>Tamamlandı</option><option>İptal</option></select></td>
        </tr>):<tr><td colSpan="8" className="empty">Henüz talep yok.</td></tr>}</tbody></table></div>
      </div>
      <div className="admin-note"><ShieldCheck/><p><b>Üretime geçiş kontrolü:</b> Bu değerlendirme sürümü localStorage kullanır. Canlı ortamda merkezi veritabanı, rol bazlı yetkilendirme, audit log, rate limit, KVKK aydınlatma metinleri, açık rıza gerektiren noktalar ve sunucu tarafı doğrulamalar tamamlanmadan kişisel veri toplamaya açılmamalıdır.</p></div>
    </div>
  </main>
}
function Stat({icon:Icon,label,value}){return <div className="stat"><div><span>{label}</span><b>{value}</b></div><Icon/></div>}
function Footer(){return <footer><div className="container footer-grid"><div><b>Ulaşım Hizmetleri Dijital İşlem Merkezi</b><span>Kurumsal değerlendirme prototipi</span></div><div className="footer-meta"><span>Gizlilik yaklaşımı</span><span>Veri minimizasyonu</span><span>Canlı hizmet değildir</span></div></div></footer>}

createRoot(document.getElementById("root")).render(<App />);
