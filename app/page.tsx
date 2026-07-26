"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, CalendarDays, ChevronRight, CircleDollarSign, Droplets,
  Gauge, LayoutDashboard, Leaf, Loader2, Menu, Package, Plus, Search,
  Settings, Sprout, Tractor, TrendingUp, Users, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { money, number, shortDate } from "@/lib/format";
import type { AppSettings, Application, AppUser, Client, Product, ProductFamily, SimpleCatalog } from "@/lib/types";

const demoClients: Client[] = [
  { id: "1", name: "Agrícola San José", contact_name: "Carlos Moreno", phone: "614 123 9081", email: "carlos@agricolasj.mx", ranch: "Rancho El Mezquite", active: true, created_at: "" },
  { id: "2", name: "Productores del Valle", contact_name: "Sofía Pérez", phone: "625 111 2908", email: "sofia@valle.mx", ranch: "Las Palmas", active: true, created_at: "" },
  { id: "3", name: "Hermanos Rivera", contact_name: "Diego Rivera", phone: "614 891 1200", email: "diego@rivera.mx", ranch: "El Encino", active: true, created_at: "" }
];

const demoProducts = [
  { id: "1", name: "Herbicida Selectivo", brand: "AgroMax", active_ingredient: "2,4-D", unit: "L/ha", default_dose: 1.2, family_id: "f3", family: { id: "f3", name: "Herbicida", active: true }, active: true, created_at: "" },
  { id: "2", name: "Fungicida Sistémico", brand: "FungiPro", active_ingredient: "Azoxistrobina", unit: "L/ha", default_dose: .8, family_id: "f2", family: { id: "f2", name: "Fungicida", active: true }, active: true, created_at: "" },
  { id: "3", name: "Bioestimulante Foliar", brand: "Verde+", active_ingredient: "Aminoácidos", unit: "L/ha", default_dose: 1, family_id: "f5", family: { id: "f5", name: "Fertilizante foliar", active: true }, active: true, created_at: "" }
] as unknown as Product[];

const demoFamilies: ProductFamily[] = ["Insecticida", "Fungicida", "Herbicida", "Bactericida", "Fertilizante foliar"].map((name, index) => ({ id: `f${index + 1}`, name, active: true, created_at: "" }));
const demoCrops: SimpleCatalog[] = ["Maíz", "Nogal", "Algodón", "Chile"].map((name, index) => ({ id: `c${index + 1}`, name, active: true, created_at: "" }));
const demoIngredients: SimpleCatalog[] = ["2,4-D", "Azoxistrobina", "Aminoácidos"].map((name, index) => ({ id: `i${index + 1}`, name, active: true, created_at: "" }));
const demoUsers: AppUser[] = [
  { id: "u1", name: "Ernesto Administrador", email: "ernesto@aerocampo.local", phone: null, can_operate_drone: true, can_sell: true, active: true, created_at: "" }
];

const demoApplications = [
  { id: "1", service_date: "2026-07-25", hectares: 86, price_per_hectare: 420, total: 36120, crop: "Maíz", field_name: "Lote Norte", status: "en_proceso", notes: null, client: demoClients[0], application_products: [{ dose: 1.2, product: demoProducts[0] }] },
  { id: "2", service_date: "2026-07-24", hectares: 64, price_per_hectare: 450, total: 28800, crop: "Nogal", field_name: "Huerta 4", status: "completado", notes: null, client: demoClients[1], application_products: [{ dose: .8, product: demoProducts[1] }] },
  { id: "3", service_date: "2026-07-27", hectares: 120, price_per_hectare: 390, total: 46800, crop: "Algodón", field_name: "Parcela 12", status: "programado", notes: null, client: demoClients[2], application_products: [{ dose: 1, product: demoProducts[2] }] },
  { id: "4", service_date: "2026-07-22", hectares: 42, price_per_hectare: 430, total: 18060, crop: "Chile", field_name: "Invernadero Sur", status: "completado", notes: null, client: demoClients[0], application_products: [{ dose: .6, product: demoProducts[1] }] }
] as unknown as Application[];

type View = "dashboard" | "applications" | "clients" | "products" | "users" | "catalogs" | "reports" | "settings";
type FontSize = "compact" | "normal" | "large";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [applications, setApplications] = useState<Application[]>(demoApplications);
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [families, setFamilies] = useState<ProductFamily[]>(demoFamilies);
  const [crops, setCrops] = useState<SimpleCatalog[]>(demoCrops);
  const [ingredients, setIngredients] = useState<SimpleCatalog[]>(demoIngredients);
  const [users, setUsers] = useState<AppUser[]>(demoUsers);
  const [settings, setSettings] = useState<AppSettings>({ id: true, drone_commission_rate: 10, salesperson_commission_rate: 5, default_price_per_hectare: 400, updated_at: "" });
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(true);
  const [modal, setModal] = useState<"application" | "client" | "product" | "family" | "crop" | "ingredient" | "user" | null>(null);
  const [editing, setEditing] = useState<Application | Client | Product | ProductFamily | SimpleCatalog | AppUser | null>(null);
  const [sidebar, setSidebar] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    const [appRes, clientRes, productRes, familyRes, cropRes, ingredientRes, userRes, settingsRes] = await Promise.all([
      supabase.from("applications").select("*, client:clients(id,name,ranch), crop_catalog:crops(id,name,active), drone_operator:users!applications_drone_operator_id_fkey(id,name), salesperson:users!applications_salesperson_id_fkey(id,name), application_products(dose, product:products(id,name,unit))").order("service_date", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
      supabase.from("products").select("*, family:product_families(id,name,active), ingredient:active_ingredients(id,name,active)").order("name"),
      supabase.from("product_families").select("*").order("name"),
      supabase.from("crops").select("*").order("name"),
      supabase.from("active_ingredients").select("*").order("name"),
      supabase.from("users").select("*").order("name"),
      supabase.from("app_settings").select("*").eq("id", true).single()
    ]);
    if (!appRes.error && !clientRes.error && !productRes.error && !familyRes.error && !cropRes.error && !ingredientRes.error && !userRes.error && !settingsRes.error) {
      setApplications(appRes.data as unknown as Application[]);
      setClients(clientRes.data);
      setProducts(productRes.data);
      setFamilies(familyRes.data);
      setCrops(cropRes.data);
      setIngredients(ingredientRes.data);
      setUsers(userRes.data);
      setSettings(settingsRes.data);
      setDemo(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const savedSize = localStorage.getItem("aerocampo-font-size") as FontSize | null;
    if (savedSize && ["compact", "normal", "large"].includes(savedSize)) setFontSize(savedSize);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
    localStorage.setItem("aerocampo-font-size", fontSize);
  }, [fontSize]);

  const navigate = (next: View) => { setView(next); setSidebar(false); };
  const openNew = (type: "application" | "client" | "product" | "family" | "crop" | "ingredient" | "user") => { setEditing(null); setModal(type); };
  const openEdit = (type: "application" | "client" | "product" | "family" | "crop" | "ingredient" | "user", record: Application | Client | Product | ProductFamily | SimpleCatalog | AppUser) => { setEditing(record); setModal(type); };

  return (
    <div className="app-shell">
      <Sidebar view={view} navigate={navigate} open={sidebar} close={() => setSidebar(false)} />
      <main>
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setSidebar(true)}><Menu size={21} /></button>
          <div>
            <p className="eyebrow">OPERACIONES / {view === "dashboard" ? "RESUMEN" : labelFor(view).toUpperCase()}</p>
            <h1>{view === "dashboard" ? "Buenos días, Ernesto" : labelFor(view)}</h1>
          </div>
          <div className="top-actions">
            {demo && <span className="demo-pill">Vista demo</span>}
            <button className="primary-button" onClick={() => openNew(view === "clients" ? "client" : view === "products" ? "product" : view === "users" ? "user" : view === "catalogs" ? "family" : "application")}>
              <Plus size={17} /> <span>Nuevo registro</span>
            </button>
            <div className="avatar">EA</div>
          </div>
        </header>

        {loading ? <div className="loading"><Loader2 className="spin" /> Conectando con Supabase…</div> :
          view === "dashboard" ? <Dashboard applications={applications} navigate={navigate} /> :
          view === "applications" ? <ApplicationsTable applications={applications} edit={(record) => openEdit("application", record)} /> :
          view === "clients" ? <ClientsGrid clients={clients} edit={(record) => openEdit("client", record)} /> :
          view === "products" ? <ProductsGrid products={products} edit={(record) => openEdit("product", record)} /> :
          view === "users" ? <UsersGrid users={users} edit={(record) => openEdit("user", record)} /> :
          view === "catalogs" ? <CatalogsView families={families} crops={crops} ingredients={ingredients} add={openNew} edit={openEdit} /> :
          view === "reports" ? <ReportsView applications={applications} users={users} /> :
          <SettingsView fontSize={fontSize} setFontSize={setFontSize} settings={settings} refresh={load} />
        }
      </main>

      {modal && <RecordModal type={modal} record={editing} clients={clients} products={products} families={families} crops={crops} ingredients={ingredients} users={users} settings={settings} close={() => { setModal(null); setEditing(null); }} saved={load} demo={demo} />}
    </div>
  );
}

function labelFor(view: View) {
  return ({ dashboard: "Panel general", applications: "Aplicaciones", clients: "Clientes", products: "Productos", users: "Usuarios", catalogs: "Catálogos", reports: "Reporte de ingresos", settings: "Configuración" })[view];
}

function Sidebar({ view, navigate, open, close }: { view: View; navigate: (v: View) => void; open: boolean; close: () => void }) {
  const nav: { id: View; label: string; icon: typeof Gauge }[] = [
    { id: "dashboard", label: "Panel general", icon: LayoutDashboard },
    { id: "applications", label: "Aplicaciones", icon: Droplets },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "products", label: "Productos", icon: Package },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "catalogs", label: "Catálogos", icon: Package },
    { id: "reports", label: "Reporte de ingresos", icon: TrendingUp }
  ];
  return <>
    {open && <div className="backdrop" onClick={close} />}
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="brand"><div className="brand-mark"><Sprout size={22} /></div><div><strong>AeroCampo</strong><span>DRONE SERVICES</span></div><button className="close mobile-only" onClick={close}><X /></button></div>
      <nav>
        <p>GESTIÓN</p>
        {nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><item.icon size={19} />{item.label}<ChevronRight size={15} /></button>)}
        <p>ADMINISTRACIÓN</p>
        <button><CalendarDays size={19} />Calendario<ChevronRight size={15} /></button>
        <button className={view === "settings" ? "active" : ""} onClick={() => navigate("settings")}><Settings size={19} />Configuración<ChevronRight size={15} /></button>
      </nav>
      <div className="sidebar-card">
        <div className="drone-icon"><Tractor size={23} /></div>
        <strong>Temporada 2026</strong>
        <span>Tu operación lleva un ritmo excelente.</span>
        <div><i style={{ width: "72%" }} /></div>
        <small>72% de la meta anual</small>
      </div>
      <div className="sidebar-footer"><span className="status-dot" /> Supabase local</div>
    </aside>
  </>;
}

function Dashboard({ applications, navigate }: { applications: Application[]; navigate: (v: View) => void }) {
  const totals = useMemo(() => {
    const completed = applications.filter(a => a.status === "completado");
    return {
      hectares: applications.reduce((s, a) => s + Number(a.hectares), 0),
      revenue: applications.reduce((s, a) => s + Number(a.total), 0),
      completed: completed.length,
      ticket: applications.length ? applications.reduce((s, a) => s + Number(a.total), 0) / applications.length : 0
    };
  }, [applications]);
  const stats = [
    { label: "Hectáreas atendidas", value: `${number.format(totals.hectares)} ha`, change: "+12.4%", icon: Leaf, tone: "green" },
    { label: "Ingresos registrados", value: money.format(totals.revenue), change: "+8.2%", icon: CircleDollarSign, tone: "navy" },
    { label: "Servicios completados", value: totals.completed.toString(), change: `${applications.length} totales`, icon: Gauge, tone: "amber" },
    { label: "Ticket promedio", value: money.format(totals.ticket), change: "+5.1%", icon: TrendingUp, tone: "blue" }
  ];
  const cropTotals = applications.reduce<Record<string, number>>((acc, a) => { acc[a.crop] = (acc[a.crop] || 0) + Number(a.hectares); return acc; }, {});
  const max = Math.max(...Object.values(cropTotals), 1);
  return <div className="page">
    <section className="stats-grid">
      {stats.map(s => <article className="stat-card" key={s.label}><div className={`stat-icon ${s.tone}`}><s.icon size={21} /></div><div><span>{s.label}</span><strong>{s.value}</strong><small><b>{s.change}</b> vs. periodo anterior</small></div></article>)}
    </section>
    <section className="dashboard-grid">
      <article className="panel chart-panel">
        <div className="panel-title"><div><span className="eyebrow">PRODUCTIVIDAD</span><h2>Hectáreas por cultivo</h2></div><button>Últimos 30 días <ChevronRight size={15} /></button></div>
        <div className="bar-chart">
          {Object.entries(cropTotals).map(([crop, value], i) => <div className="bar-row" key={crop}><span>{crop}</span><div><i style={{ width: `${Math.max(12, value / max * 100)}%`, opacity: 1 - i * .1 }} /></div><strong>{number.format(value)} ha</strong></div>)}
          {!applications.length && <p className="empty">Aún no hay aplicaciones registradas.</p>}
        </div>
      </article>
      <article className="panel quick-panel">
        <span className="eyebrow">ACCESO RÁPIDO</span><h2>Registra tu operación</h2>
        <p>Mantén al día la actividad del equipo y la trazabilidad de cada aplicación.</p>
        <button className="quick-link" onClick={() => navigate("applications")}><span><Droplets size={19} />Nueva aplicación</span><ArrowUpRight size={18} /></button>
        <button className="quick-link" onClick={() => navigate("clients")}><span><Users size={19} />Administrar clientes</span><ArrowUpRight size={18} /></button>
        <button className="quick-link" onClick={() => navigate("products")}><span><Package size={19} />Catálogo de productos</span><ArrowUpRight size={18} /></button>
      </article>
    </section>
    <section className="panel">
      <div className="panel-title"><div><span className="eyebrow">ACTIVIDAD RECIENTE</span><h2>Últimas aplicaciones</h2></div><button onClick={() => navigate("applications")}>Ver todas <ArrowUpRight size={15} /></button></div>
      <ApplicationRows applications={applications.slice(0, 5)} />
    </section>
  </div>;
}

function ApplicationsTable({ applications, edit }: { applications: Application[]; edit: (application: Application) => void }) {
  return <div className="page"><div className="list-toolbar"><div className="search"><Search size={18} /><input placeholder="Buscar por cliente, cultivo o lote…" /></div><button className="secondary-button">Todos los estados <ChevronRight size={15} /></button></div><section className="panel"><ApplicationRows applications={applications} edit={edit} /></section></div>;
}

function ApplicationRows({ applications, edit }: { applications: Application[]; edit?: (application: Application) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>CLIENTE / EQUIPO</th><th>FECHA</th><th>CULTIVO</th><th>SUPERFICIE</th><th>IMPORTE</th><th>ESTADO</th><th /></tr></thead><tbody>{applications.map(a => <tr key={a.id}><td><strong>{a.client?.name ?? "Sin cliente"}</strong><small>{a.field_name ?? a.client?.ranch ?? "—"}</small><small>Dronero: {a.drone_operator?.name || "—"} · Venta: {a.salesperson?.name || "—"}</small></td><td>{shortDate(a.service_date)}</td><td><span className="crop"><Leaf size={14} />{a.crop_catalog?.name || a.crop}</span><small>{a.application_products.length} producto(s)</small></td><td><strong>{number.format(Number(a.hectares))} ha</strong></td><td><strong>{money.format(Number(a.total))}</strong><small>{money.format(Number(a.price_per_hectare))}/ha</small></td><td><span className={`status ${a.status}`}>{a.status.replace("_", " ")}</span></td><td>{edit ? <button className="secondary-button edit-button" onClick={() => edit(a)}>Editar</button> : <button className="more">•••</button>}</td></tr>)}</tbody></table>{!applications.length && <p className="empty">No hay aplicaciones registradas.</p>}</div>;
}

function ClientsGrid({ clients, edit }: { clients: Client[]; edit: (client: Client) => void }) {
  return <div className="page"><div className="list-toolbar"><div className="search"><Search size={18} /><input placeholder="Buscar cliente…" /></div></div><div className="cards-grid">{clients.map(c => <article className={c.active ? "entity-card" : "entity-card inactive-card"} key={c.id}><div className="entity-head"><div className="initial">{c.name.slice(0, 2).toUpperCase()}</div><button className="secondary-button edit-button" onClick={() => edit(c)}>Editar</button></div><div className={c.active ? "catalog-status active" : "catalog-status"}>{c.active ? "Activo" : "Inactivo"}</div><h3>{c.name}</h3><span>{c.ranch || "Sin rancho registrado"}</span><hr/><p><strong>{c.contact_name || "Sin contacto"}</strong><small>{c.phone || "Sin teléfono"} · {c.email || "Sin correo"}</small></p></article>)}</div></div>;
}

function ProductsGrid({ products, edit }: { products: Product[]; edit: (product: Product) => void }) {
  return <div className="page"><div className="list-toolbar"><div className="search"><Search size={18} /><input placeholder="Buscar producto, familia o ingrediente…" /></div></div><div className="cards-grid">{products.map(p => <article className={p.active ? "entity-card product-card" : "entity-card product-card inactive-card"} key={p.id}><div className="entity-head"><div className="product-icon"><Droplets size={21}/></div><button className="secondary-button edit-button" onClick={() => edit(p)}>Editar</button></div><div className="product-tags"><span className="family-badge">{p.family?.name || "Sin familia"}</span><span className={p.active ? "catalog-status active" : "catalog-status"}>{p.active ? "Activo" : "Inactivo"}</span><span className="unit">{number.format(Number(p.default_dose))} {p.unit}</span></div><h3>{p.name}</h3><span>{p.brand || "Sin marca"}</span><hr/><p><small>INGREDIENTE ACTIVO</small><strong>{p.ingredient?.name || p.active_ingredient || "No especificado"}</strong></p></article>)}</div></div>;
}

function UsersGrid({ users, edit }: { users: AppUser[]; edit: (user: AppUser) => void }) {
  return <div className="page"><div className="cards-grid">{users.map(user => <article className={user.active ? "entity-card" : "entity-card inactive-card"} key={user.id}><div className="entity-head"><div className="initial">{user.name.slice(0, 2).toUpperCase()}</div><button className="secondary-button edit-button" onClick={() => edit(user)}>Editar</button></div><div className="product-tags"><span className={user.active ? "catalog-status active" : "catalog-status"}>{user.active ? "Activo" : "Inactivo"}</span>{user.can_operate_drone && <span className="family-badge">Dronero</span>}{user.can_sell && <span className="family-badge">Vendedor</span>}</div><h3>{user.name}</h3><span>{user.email || "Sin correo"}</span><hr/><p><small>TELÉFONO</small><strong>{user.phone || "No especificado"}</strong></p></article>)}</div></div>;
}

function ReportsView({ applications, users }: { applications: Application[]; users: AppUser[] }) {
  const billableApplications = applications.filter(application => application.status !== "cancelado");
  const rows = users.map(user => {
    const sold = billableApplications.filter(a => a.salesperson?.id === user.id);
    const operated = billableApplications.filter(a => a.drone_operator?.id === user.id);
    const revenue = sold.reduce((sum, a) => sum + Number(a.total), 0);
    const commissions = sold.reduce((sum, a) => sum + Number(a.salesperson_commission || 0), 0) + operated.reduce((sum, a) => sum + Number(a.drone_commission || 0), 0);
    return { user, sold: sold.length, operated: operated.length, revenue, commissions };
  }).filter(row => row.sold || row.operated);
  return <div className="page"><section className="stats-grid report-stats"><article className="stat-card"><div className="stat-icon green"><CircleDollarSign size={21}/></div><div><span>Ingresos totales</span><strong>{money.format(applications.reduce((sum, a) => sum + Number(a.total), 0))}</strong></div></article><article className="stat-card"><div className="stat-icon amber"><TrendingUp size={21}/></div><div><span>Comisiones calculadas</span><strong>{money.format(applications.reduce((sum, a) => sum + Number(a.drone_commission || 0) + Number(a.salesperson_commission || 0), 0))}</strong></div></article></section><section className="panel report-table"><div className="panel-title"><div><span className="eyebrow">RENDIMIENTO</span><h2>Ingresos y comisiones por usuario</h2></div></div><div className="table-wrap"><table><thead><tr><th>USUARIO</th><th>VENTAS</th><th>OPERACIONES</th><th>INGRESOS GENERADOS</th><th>COMISIONES</th></tr></thead><tbody>{rows.map(row => <tr key={row.user.id}><td><strong>{row.user.name}</strong><small>{row.user.can_sell ? "Vendedor" : ""}{row.user.can_sell && row.user.can_operate_drone ? " · " : ""}{row.user.can_operate_drone ? "Dronero" : ""}</small></td><td>{row.sold}</td><td>{row.operated}</td><td><strong>{money.format(row.revenue)}</strong></td><td><strong>{money.format(row.commissions)}</strong></td></tr>)}</tbody></table></div></section></div>;
}

function CatalogsView({ families, crops, ingredients, add, edit }: { families: ProductFamily[]; crops: SimpleCatalog[]; ingredients: SimpleCatalog[]; add: (type: "family" | "crop" | "ingredient") => void; edit: (type: "family" | "crop" | "ingredient", record: ProductFamily | SimpleCatalog) => void }) {
  const catalogs = [
    { type: "family" as const, title: "Familias de productos", items: families },
    { type: "crop" as const, title: "Cultivos", items: crops },
    { type: "ingredient" as const, title: "Ingredientes activos", items: ingredients }
  ];
  return <div className="page settings-page">{catalogs.map(catalog => <section className="panel settings-section" key={catalog.type}>
    <div className="panel-title"><div><span className="eyebrow">CATÁLOGOS</span><h2>{catalog.title}</h2></div><button className="primary-button" onClick={() => add(catalog.type)}><Plus size={15}/>Nuevo registro</button></div>
    <div className="family-list">{catalog.items.map(item => <div className="family-row" key={item.id}><div className="family-symbol"><Leaf size={17}/></div><div><strong>{item.name}</strong><small>{item.active ? "Disponible en registros nuevos" : "Elemento inactivo"}</small></div><span className={item.active ? "catalog-status active" : "catalog-status"}>{item.active ? "Activo" : "Inactivo"}</span><button className="secondary-button" onClick={() => edit(catalog.type, item)}>Editar</button></div>)}</div>
  </section>)}</div>;
}

function SettingsView({ fontSize, setFontSize, settings, refresh }: { fontSize: FontSize; setFontSize: (size: FontSize) => void; settings: AppSettings; refresh: () => Promise<void> }) {
  const [commissionMessage, setCommissionMessage] = useState("");
  async function saveCommissions(formData: FormData) {
    const supabase = createClient()!;
    const { error } = await supabase.from("app_settings").update({
      drone_commission_rate: Number(formData.get("drone_commission_rate")),
      salesperson_commission_rate: Number(formData.get("salesperson_commission_rate")),
      default_price_per_hectare: Number(formData.get("default_price_per_hectare")),
      updated_at: new Date().toISOString()
    }).eq("id", true);
    setCommissionMessage(error ? error.message : "Configuración guardada. Se aplicará a las aplicaciones nuevas.");
    if (!error) await refresh();
  }
  return <div className="page settings-page">
    <section className="panel settings-section">
      <div className="panel-title"><div><span className="eyebrow">APARIENCIA</span><h2>Tamaño del texto</h2></div></div>
      <p className="setting-description">Ajusta la escala de lectura de toda la aplicación. La selección se conserva en este navegador.</p>
      <div className="font-options">
        {([
          ["compact", "Compacto", "Más información visible"],
          ["normal", "Normal", "Tamaño recomendado"],
          ["large", "Grande", "Mayor facilidad de lectura"]
        ] as const).map(([value, label, description]) =>
          <button key={value} className={fontSize === value ? "font-option selected" : "font-option"} onClick={() => setFontSize(value)}>
            <span className={`font-sample ${value}`}>Aa</span><strong>{label}</strong><small>{description}</small>
          </button>
        )}
      </div>
    </section>
    <section className="panel settings-section">
      <div className="panel-title"><div><span className="eyebrow">CONFIGURACIÓN GENERAL</span><h2>Tarifa y comisiones</h2></div></div>
      <p className="setting-description">La tarifa se sugiere en aplicaciones nuevas y puede cambiarse al capturar. Los porcentajes se copian al documento para conservar el cálculo histórico.</p>
      <form className="commission-form" action={saveCommissions}>
        <label>Precio predeterminado por hectárea<input name="default_price_per_hectare" type="number" min="0" step="0.01" required defaultValue={settings.default_price_per_hectare}/></label>
        <label>Comisión del dronero (%)<input name="drone_commission_rate" type="number" min="0" max="100" step="0.001" required defaultValue={settings.drone_commission_rate}/></label>
        <label>Comisión del vendedor (%)<input name="salesperson_commission_rate" type="number" min="0" max="100" step="0.001" required defaultValue={settings.salesperson_commission_rate}/></label>
        <button className="primary-button">Guardar configuración</button>
      </form>
      {commissionMessage && <p className="settings-message">{commissionMessage}</p>}
    </section>
  </div>;
}

function RecordModal({ type, record, clients, products, families, crops, ingredients, users, settings, close, saved, demo }: { type: "application" | "client" | "product" | "family" | "crop" | "ingredient" | "user"; record: Application | Client | Product | ProductFamily | SimpleCatalog | AppUser | null; clients: Client[]; products: Product[]; families: ProductFamily[]; crops: SimpleCatalog[]; ingredients: SimpleCatalog[]; users: AppUser[]; settings: AppSettings; close: () => void; saved: () => Promise<void>; demo: boolean }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const applicationRecord = type === "application" ? record as Application | null : null;
  const clientRecord = type === "client" ? record as Client | null : null;
  const productRecord = type === "product" ? record as Product | null : null;
  const familyRecord = type === "family" ? record as ProductFamily | null : null;
  const catalogRecord = type === "crop" || type === "ingredient" ? record as SimpleCatalog | null : null;
  const userRecord = type === "user" ? record as AppUser | null : null;
  const [productRows, setProductRows] = useState(() =>
    applicationRecord?.application_products.length
      ? applicationRecord.application_products.map((item, index) => ({ key: `${index}-${item.product?.id}`, product_id: item.product?.id || "", dose: String(item.dose) }))
      : [{ key: "new-0", product_id: "", dose: "" }]
  );
  const title = record ? { application: "Editar aplicación", client: "Editar cliente", product: "Editar producto", family: "Editar familia", crop: "Editar cultivo", ingredient: "Editar ingrediente activo", user: "Editar usuario" }[type] : { application: "Nueva aplicación", client: "Nuevo cliente", product: "Nuevo producto", family: "Nueva familia", crop: "Nuevo cultivo", ingredient: "Nuevo ingrediente activo", user: "Nuevo usuario" }[type];
  async function submit(formData: FormData) {
    setSaving(true); setError("");
    if (demo) { setError("Configura .env.local y ejecuta Supabase para guardar datos reales."); setSaving(false); return; }
    const supabase = createClient();
    if (!supabase) return;
    let result;
    if (type === "application") {
      const hectares = Number(formData.get("hectares")); const price = Number(formData.get("price_per_hectare"));
      const selectedRows = productRows.filter(row => row.product_id).map(row => ({ product_id: row.product_id, dose: Number(row.dose || 0) }));
      const selectedCrop = crops.find(item => item.id === formData.get("crop_id"));
      const values = {
        client_id: formData.get("client_id"), service_date: formData.get("service_date"),
        crop_id: formData.get("crop_id"), crop: selectedCrop?.name || applicationRecord?.crop || "",
        drone_operator_id: formData.get("drone_operator_id"), salesperson_id: formData.get("salesperson_id"),
        drone_commission_rate: applicationRecord?.drone_commission_rate ?? settings.drone_commission_rate,
        salesperson_commission_rate: applicationRecord?.salesperson_commission_rate ?? settings.salesperson_commission_rate,
        field_name: formData.get("field_name"), hectares, price_per_hectare: price,
        status: formData.get("status"), notes: formData.get("notes")
      };
      result = applicationRecord
        ? await supabase.from("applications").update(values).eq("id", applicationRecord.id).select("id").single()
        : await supabase.from("applications").insert(values).select("id").single();
      if (!result.error) {
        const applicationId = result.data.id;
        const currentIds = new Set((applicationRecord?.application_products || []).map(item => item.product?.id).filter(Boolean));
        const selectedIds = new Set(selectedRows.map(row => row.product_id));
        const removedIds = [...currentIds].filter(id => !selectedIds.has(id as string)) as string[];
        if (removedIds.length) {
          const relationDelete = await supabase.from("application_products").delete().eq("application_id", applicationId).in("product_id", removedIds);
          if (relationDelete.error) result = { ...result, error: relationDelete.error };
        }
        if (!result.error) {
          for (const row of selectedRows.filter(item => currentIds.has(item.product_id))) {
            const relationUpdate = await supabase.from("application_products").update({ dose: row.dose }).eq("application_id", applicationId).eq("product_id", row.product_id);
            if (relationUpdate.error) { result = { ...result, error: relationUpdate.error }; break; }
          }
        }
        if (!result.error) {
          const additions = selectedRows.filter(item => !currentIds.has(item.product_id)).map(item => ({ application_id: applicationId, ...item }));
          if (additions.length) {
            const relationInsert = await supabase.from("application_products").insert(additions);
            if (relationInsert.error) result = { ...result, error: relationInsert.error };
          }
        }
      }
    } else if (type === "client") {
      const values = Object.fromEntries(formData);
      result = record ? await supabase.from("clients").update(values).eq("id", record.id) : await supabase.from("clients").insert(values);
    } else if (type === "product") {
      const values = Object.fromEntries(formData);
      result = record ? await supabase.from("products").update(values).eq("id", record.id) : await supabase.from("products").insert(values);
    } else if (type === "family") {
      const values = Object.fromEntries(formData);
      result = record ? await supabase.from("product_families").update(values).eq("id", record.id) : await supabase.from("product_families").insert(values);
    } else if (type === "crop" || type === "ingredient") {
      const table = type === "crop" ? "crops" : "active_ingredients";
      const values = Object.fromEntries(formData);
      result = record ? await supabase.from(table).update(values).eq("id", record.id) : await supabase.from(table).insert(values);
    } else {
      const values = Object.fromEntries(formData);
      result = record ? await supabase.from("users").update(values).eq("id", record.id) : await supabase.from("users").insert(values);
    }
    if (result?.error) setError(result.error.message); else { await saved(); close(); }
    setSaving(false);
  }
  async function remove() {
    if (!record || demo || type === "application") return;
    if (!window.confirm("¿Eliminar este elemento definitivamente? Sólo será posible si nunca se ha utilizado.")) return;
    setSaving(true); setError("");
    const supabase = createClient()!;
    const table = type === "client" ? "clients" : type === "product" ? "products" : type === "family" ? "product_families" : type === "crop" ? "crops" : type === "ingredient" ? "active_ingredients" : "users";
    const { error: deleteError } = await supabase.from(table).delete().eq("id", record.id);
    if (deleteError) {
      setError(deleteError.code === "23503" ? "No se puede eliminar porque este elemento ya fue utilizado. Puedes marcarlo como inactivo." : deleteError.message);
    } else {
      await saved(); close();
    }
    setSaving(false);
  }
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><span className="eyebrow">CAPTURA DE DATOS</span><h2>{title}</h2></div><button className="icon-button" onClick={close}><X size={20}/></button></div><form action={submit}>
    {type === "application" && <>
      <label className="full">Cliente<select name="client_id" required defaultValue={applicationRecord?.client?.id || ""}><option value="" disabled>Seleccionar cliente</option>{clients.filter(c => c.active || c.id === applicationRecord?.client?.id).map(c => <option key={c.id} value={c.id}>{c.name}{!c.active ? " (inactivo)" : ""}</option>)}</select></label>
      <label>Fecha<input name="service_date" type="date" required defaultValue={applicationRecord?.service_date || new Date().toISOString().slice(0, 10)} /></label>
      <label>Estado<select name="status" defaultValue={applicationRecord?.status || "programado"}><option value="programado">Programado</option><option value="en_proceso">En proceso</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option></select></label>
      <label>Cultivo<select name="crop_id" required defaultValue={applicationRecord?.crop_id || ""}><option value="" disabled>Seleccionar cultivo</option>{crops.filter(c => c.active || c.id === applicationRecord?.crop_id).map(c => <option key={c.id} value={c.id}>{c.name}{!c.active ? " (inactivo)" : ""}</option>)}</select></label><label>Lote / predio<input name="field_name" placeholder="Ej. Lote Norte" defaultValue={applicationRecord?.field_name || ""}/></label>
      <label>Dronero<select name="drone_operator_id" required defaultValue={applicationRecord?.drone_operator?.id || ""}><option value="" disabled>Seleccionar dronero</option>{users.filter(u => u.can_operate_drone && (u.active || u.id === applicationRecord?.drone_operator?.id)).map(u => <option key={u.id} value={u.id}>{u.name}{!u.active ? " (inactivo)" : ""}</option>)}</select></label>
      <label>Vendedor<select name="salesperson_id" required defaultValue={applicationRecord?.salesperson?.id || ""}><option value="" disabled>Seleccionar vendedor</option>{users.filter(u => u.can_sell && (u.active || u.id === applicationRecord?.salesperson?.id)).map(u => <option key={u.id} value={u.id}>{u.name}{!u.active ? " (inactivo)" : ""}</option>)}</select></label>
      <label>Hectáreas<input name="hectares" type="number" min="0.01" step="0.01" required placeholder="0.00" defaultValue={applicationRecord?.hectares}/></label><label>Precio por hectárea<input name="price_per_hectare" type="number" min="0" step="0.01" required placeholder="$ 0.00" defaultValue={applicationRecord?.price_per_hectare ?? settings.default_price_per_hectare}/></label>
      <div className="full application-products">
        <div className="products-heading"><div><strong>Productos aplicados</strong><small>La dosis sugerida puede modificarse para esta aplicación.</small></div><button type="button" className="secondary-button" onClick={() => setProductRows(rows => [...rows, { key: `new-${Date.now()}`, product_id: "", dose: "" }])}><Plus size={14}/>Agregar producto</button></div>
        {productRows.map((row, index) => <div className="application-product-row" key={row.key}>
          <label>Producto<select value={row.product_id} onChange={event => {
            const product = products.find(item => item.id === event.target.value);
            setProductRows(rows => rows.map(item => item.key === row.key ? { ...item, product_id: event.target.value, dose: product ? String(product.default_dose) : "" } : item));
          }}><option value="">Seleccionar producto</option>{products.filter(p => p.active || p.id === row.product_id).map(p => <option key={p.id} value={p.id} disabled={productRows.some((other, otherIndex) => otherIndex !== index && other.product_id === p.id)}>{p.name}{!p.active ? " (inactivo)" : ""}</option>)}</select></label>
          <label>Dosis por ha<input type="number" min="0" step="0.01" placeholder="0.00" value={row.dose} onChange={event => setProductRows(rows => rows.map(item => item.key === row.key ? { ...item, dose: event.target.value } : item))}/></label>
          <span className="dose-unit">{products.find(item => item.id === row.product_id)?.unit || "unidad/ha"}</span>
          <button type="button" className="remove-row" aria-label="Quitar producto" onClick={() => setProductRows(rows => rows.length === 1 ? [{ key: `new-${Date.now()}`, product_id: "", dose: "" }] : rows.filter(item => item.key !== row.key))}><X size={16}/></button>
        </div>)}
      </div>
      <label className="full">Notas<textarea name="notes" rows={3} placeholder="Condiciones, indicaciones o comentarios…" defaultValue={applicationRecord?.notes || ""}/></label>
    </>}
    {type === "client" && <><label className="full">Empresa / cliente<input name="name" required placeholder="Razón social o nombre" defaultValue={clientRecord?.name}/></label><label>Contacto<input name="contact_name" placeholder="Nombre completo" defaultValue={clientRecord?.contact_name || ""}/></label><label>Teléfono<input name="phone" placeholder="614 000 0000" defaultValue={clientRecord?.phone || ""}/></label><label>Correo<input type="email" name="email" placeholder="correo@empresa.mx" defaultValue={clientRecord?.email || ""}/></label><label>Rancho / predio<input name="ranch" placeholder="Nombre del rancho" defaultValue={clientRecord?.ranch || ""}/></label><label>Estado<select name="active" defaultValue={String(clientRecord?.active ?? true)}><option value="true">Activo</option><option value="false">Inactivo</option></select></label></>}
    {type === "product" && <><label className="full">Nombre del producto<input name="name" required placeholder="Nombre comercial" defaultValue={productRecord?.name}/></label><label>Familia<select name="family_id" required defaultValue={productRecord?.family_id || ""}><option value="" disabled>Seleccionar familia</option>{families.filter(f => f.active || f.id === productRecord?.family_id).map(f => <option key={f.id} value={f.id}>{f.name}{!f.active ? " (inactiva)" : ""}</option>)}</select></label><label>Marca<input name="brand" placeholder="Fabricante o marca" defaultValue={productRecord?.brand || ""}/></label><label>Ingrediente activo<select name="active_ingredient_id" required defaultValue={productRecord?.active_ingredient_id || ""}><option value="" disabled>Seleccionar ingrediente</option>{ingredients.filter(i => i.active || i.id === productRecord?.active_ingredient_id).map(i => <option key={i.id} value={i.id}>{i.name}{!i.active ? " (inactivo)" : ""}</option>)}</select></label><label>Unidad de dosis<input name="unit" required defaultValue={productRecord?.unit || "L/ha"} placeholder="L/ha" /></label><label>Dosis predeterminada<input name="default_dose" type="number" min="0" step="0.01" required defaultValue={productRecord?.default_dose ?? 0}/></label><label>Estado<select name="active" defaultValue={String(productRecord?.active ?? true)}><option value="true">Activo</option><option value="false">Inactivo</option></select></label></>}
    {type === "family" && <><label className="full">Nombre de la familia<input name="name" required placeholder="Ej. Acaricida" defaultValue={familyRecord?.name}/></label><label className="full">Estado<select name="active" defaultValue={String(familyRecord?.active ?? true)}><option value="true">Activa</option><option value="false">Inactiva</option></select></label></>}
    {(type === "crop" || type === "ingredient") && <><label className="full">Nombre<input name="name" required placeholder={type === "crop" ? "Ej. Sorgo" : "Ej. Glifosato"} defaultValue={catalogRecord?.name}/></label><label className="full">Estado<select name="active" defaultValue={String(catalogRecord?.active ?? true)}><option value="true">Activo</option><option value="false">Inactivo</option></select></label></>}
    {type === "user" && <><label className="full">Nombre<input name="name" required placeholder="Nombre completo" defaultValue={userRecord?.name}/></label><label>Correo<input name="email" type="email" placeholder="usuario@empresa.mx" defaultValue={userRecord?.email || ""}/></label><label>Teléfono<input name="phone" placeholder="614 000 0000" defaultValue={userRecord?.phone || ""}/></label><label>Puede ser dronero<select name="can_operate_drone" defaultValue={String(userRecord?.can_operate_drone ?? false)}><option value="true">Sí</option><option value="false">No</option></select></label><label>Puede ser vendedor<select name="can_sell" defaultValue={String(userRecord?.can_sell ?? false)}><option value="true">Sí</option><option value="false">No</option></select></label><label className="full">Estado<select name="active" defaultValue={String(userRecord?.active ?? true)}><option value="true">Activo</option><option value="false">Inactivo</option></select></label></>}
    {error && <p className="form-error">{error}</p>}
    <div className="modal-actions">{record && type !== "application" && <button type="button" className="danger-button" onClick={remove} disabled={saving}>Eliminar</button>}<span className="modal-spacer"/><button type="button" className="secondary-button" onClick={close}>Cancelar</button><button className="primary-button" disabled={saving}>{saving && <Loader2 size={16} className="spin"/>}Guardar registro</button></div>
  </form></div></div>;
}
