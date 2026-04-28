import { useState, useMemo, useEffect, useCallback } from "react";

const STORAGE_KEY = "cronicare_control_data";
const HIST_KEY = "cronicare_control_historico";

const defaultData = [
  { id: 1, codigo: "100056", nome: "Álcool Purell Hand Sanitizing 350ml", categoria: "Assepsia", unidade: "Unid", estoque: 1, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 2, codigo: "", nome: "Ambú Esterilizado", categoria: "Equipamentos", unidade: "Unid", estoque: 0, minimo: 1, consumoMensal: [0,0,0,0], validades: [] },
  { id: 3, codigo: "105409", nome: "Coletor 7L Laranja Descartável Perfurocortantes Clean Box 3", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 4, codigo: "51848", nome: "Conexão Estéril Para Sistema de Aspiração PVC 4m - Zammi", categoria: "Materiais", unidade: "Pç", estoque: 2, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 5, codigo: "109710", nome: "Desinfec Vital / Optigerm 500ml", categoria: "Assepsia", unidade: "Fr", estoque: 1, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 6, codigo: "79218", nome: "Kit Curativo Simples - Kolplast", categoria: "Curativos", unidade: "Unid", estoque: 0, minimo: 3, consumoMensal: [2,2,2,2], validades: [] },
  { id: 7, codigo: "110740", nome: "Kit Retirada de Pontos - Kolplast", categoria: "Curativos", unidade: "Unid", estoque: 0, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 8, codigo: "51132", nome: "Gaze Embebida em Álcool Isopropílico 70% (Álcool Swab)", categoria: "Curativos", unidade: "Unid", estoque: 12, minimo: 20, consumoMensal: [15,12,14,15], validades: [] },
  { id: 9, codigo: "121179", nome: "Luva Látex Para Procedimento Tam. P Sem Talco", categoria: "EPIs", unidade: "Cx", estoque: 0, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 10, codigo: "1027", nome: "Máscara Tripla Descartável Descarpack Com Tiras", categoria: "EPIs", unidade: "Pç", estoque: 1, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 11, codigo: "919", nome: "Quadradinho de Algodão 95g - Sussex", categoria: "Curativos", unidade: "Pct", estoque: 0, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 12, codigo: "119793", nome: "Saco Plástico Transparente 18x25cm (Proteção)", categoria: "EPIs", unidade: "Unid", estoque: 0, minimo: 10, consumoMensal: [10,10,10,10], validades: [] },
  { id: 13, codigo: "52468", nome: "Wipall X60 - Pano Para Limpeza Industrial", categoria: "Limpeza", unidade: "Pct", estoque: 2, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 14, codigo: "133325", nome: "Accu-chek Active Tiras P/ Teste Glicose - Roche", categoria: "Materiais", unidade: "Cx", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 15, codigo: "51190", nome: "Agulha Para Aspiração 1,20x25 Ref. 305243 - B.D", categoria: "Materiais", unidade: "Cx", estoque: 1, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 16, codigo: "106814", nome: "Cavilon Limpador de Pele S/ Enxágue 250ml - 3M", categoria: "Assepsia", unidade: "Fr", estoque: 1, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 17, codigo: "171983", nome: "Chloraprep 1ml Sem Corante 08x10cm - B.D", categoria: "Curativos", unidade: "Unid", estoque: 12, minimo: 10, consumoMensal: [8,10,9,12], validades: [] },
  { id: 18, codigo: "117432", nome: "Clorexidina Alcoólica Incolor 0,5% Almotolia 100ml", categoria: "Assepsia", unidade: "Alm", estoque: 0, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 19, codigo: "16480", nome: "Compressa Nugauze Estéril 7,5x7,5cm c/10un - Bioservice", categoria: "Curativos", unidade: "Pct", estoque: 20, minimo: 10, consumoMensal: [8,10,9,8], validades: [] },
  { id: 20, codigo: "163231", nome: "Conector Valvulado Safeflow Ref. 3150 - Bbraun", categoria: "Materiais", unidade: "Unid", estoque: 25, minimo: 10, consumoMensal: [8,10,9,8], validades: [] },
  { id: 21, codigo: "101025", nome: "Curatec Filme Transparente Não Estéril Rolo 10cmx2m", categoria: "Curativos", unidade: "Rl", estoque: 1, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 22, codigo: "88109", nome: "Curativo Excilon Fenestrado c/ Gaze PHMB 5x5cm", categoria: "Curativos", unidade: "Unid", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 23, codigo: "94581", nome: "Curativo Transparente Tegaderm CHG 7x8,5cm - 3M", categoria: "Curativos", unidade: "Unid", estoque: 8, minimo: 5, consumoMensal: [4,5,4,4], validades: [] },
  { id: 24, codigo: "51332", nome: "Curativo Transparente Tegaderm Film Médio 10x12cm - 3M", categoria: "Curativos", unidade: "Unid", estoque: 3, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 25, codigo: "99254", nome: "Equipo Infusomat Space Set Air FS Fotossensível - Bbraun", categoria: "Materiais", unidade: "Unid", estoque: 50, minimo: 20, consumoMensal: [15,18,16,17], validades: [] },
  { id: 26, codigo: "99251", nome: "Equipo Infusomat Space Set Air Inj. Lateral - B.Braun", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 10, consumoMensal: [8,8,8,8], validades: [] },
  { id: 27, codigo: "106750", nome: "Espaçador Inalair Baby (0 a 2 Anos) - RS Med", categoria: "Equipamentos", unidade: "Unid", estoque: 0, minimo: 1, consumoMensal: [0,0,0,0], validades: [] },
  { id: 28, codigo: "51294", nome: "Extensor P/ Equipos Infusão Perfusor Set P.E 150cm - B.Braun", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 29, codigo: "53926", nome: "Extensor Tipo Secur-Lok MIC-KEY 2 Vias Gastrostomia - Ballard", categoria: "Materiais", unidade: "Unid", estoque: 2, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 30, codigo: "54792", nome: "Filtro Hidrofóbico Servo Duoguard - Maquet", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 31, codigo: "54194", nome: "Filtro Umidificante Infantil Gibek", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 32, codigo: "96763", nome: "Fita de Silicone 2,5cmx5m 3M (Medipore - fita azul)", categoria: "Curativos", unidade: "Rl", estoque: 9, minimo: 4, consumoMensal: [3,4,3,3], validades: [] },
  { id: 33, codigo: "55410", nome: "Fixador Adulto Para Cânula de Traqueostomia Grossa - Newmed", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 34, codigo: "55419", nome: "Fixador Infantil Para Cânula de Traqueostomia Fina - Newmed", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 35, codigo: "120478", nome: "Fralda Pampers Premium Care RN 2-4,5kg Pct c/20", categoria: "Higiene", unidade: "Pact", estoque: 10, minimo: 5, consumoMensal: [4,5,4,4], validades: [] },
  { id: 36, codigo: "120474", nome: "Fralda Pampers Premium Care XXG >14kg Pct c/24", categoria: "Higiene", unidade: "Pact", estoque: 8, minimo: 5, consumoMensal: [4,5,4,4], validades: [] },
  { id: 37, codigo: "964", nome: "Hastes de Algodão Estéril c/5un (Cotonetes) - HQ", categoria: "Higiene", unidade: "Pct", estoque: 0, minimo: 3, consumoMensal: [2,2,2,2], validades: [] },
  { id: 38, codigo: "97610", nome: "Lanceta TKL Haemolance Plus - Abbott", categoria: "Materiais", unidade: "Pç", estoque: 0, minimo: 10, consumoMensal: [8,8,8,8], validades: [] },
  { id: 39, codigo: "185143", nome: "Lençol Descartável Dry Gel 80x150cm - Higifral (Branco)", categoria: "Curativos", unidade: "Unid", estoque: 120, minimo: 30, consumoMensal: [30,30,30,30], validades: [] },
  { id: 40, codigo: "64381", nome: "Lenço Removedor de Adesivo Convacare - Convatec", categoria: "Curativos", unidade: "Unid", estoque: 6, minimo: 5, consumoMensal: [4,5,4,4], validades: [] },
  { id: 41, codigo: "203926", nome: "Lenço Removedor de Adesivo Sensi-Care - Convatec", categoria: "Curativos", unidade: "Unid", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 42, codigo: "124", nome: "Luva Cirúrgica Descartável Estéril Nº 7.5 Sensitex", categoria: "EPIs", unidade: "Par", estoque: 60, minimo: 20, consumoMensal: [15,18,16,17], validades: [] },
  { id: 43, codigo: "18900", nome: "Luva Látex Tamanho M S/ Talco Para Procedimento c/20un", categoria: "EPIs", unidade: "Cx", estoque: 0, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 44, codigo: "73696", nome: "Máscara P/ Oxigenioterapia Em Traqueostomia Ref. 1076", categoria: "EPIs", unidade: "Unid", estoque: 0, minimo: 2, consumoMensal: [1,1,1,1], validades: [] },
  { id: 45, codigo: "92", nome: "Seringa Descartável 1ml c/ Agulha 13x3,8 P/ Insulina - B.D", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 20, consumoMensal: [15,15,15,15], validades: [] },
  { id: 46, codigo: "40", nome: "Seringa Descartável 3ml S/ Agulha c/ Luer-Lok - B.D", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 20, consumoMensal: [15,15,15,15], validades: [] },
  { id: 47, codigo: "68", nome: "Seringa Descartável 5ml S/ Agulha c/ Luer-Lok - B.D", categoria: "Materiais", unidade: "Unid", estoque: 40, minimo: 20, consumoMensal: [15,18,16,17], validades: [] },
  { id: 48, codigo: "69", nome: "Seringa Descartável 10ml S/ Agulha c/ Luer-Lok - B.D", categoria: "Materiais", unidade: "Unid", estoque: 60, minimo: 20, consumoMensal: [15,18,16,17], validades: [] },
  { id: 49, codigo: "71405", nome: "Seringa Descartável Perfusora 20ml S/ Agulha - B.Braun", categoria: "Materiais", unidade: "Unid", estoque: 0, minimo: 20, consumoMensal: [15,15,15,15], validades: [] },
  { id: 50, codigo: "74275", nome: "Solução Salina 10ml Posiflush Seringa Preenchida - B.D", categoria: "Materiais", unidade: "Cx", estoque: 6, minimo: 5, consumoMensal: [4,5,4,4], validades: [] },
  { id: 51, codigo: "51274", nome: "Sonda Aspiração N.8 c/ Válvula Controle - CPL Medicals", categoria: "Materiais", unidade: "Unid", estoque: 200, minimo: 50, consumoMensal: [40,45,42,40], validades: [] },
  { id: 52, codigo: "171960", nome: "Tampa Protetora Curos c/ Álcool Tiras Ref. CFF10 250R", categoria: "Materiais", unidade: "Unid", estoque: 40, minimo: 20, consumoMensal: [15,18,16,17], validades: [] },
  { id: 53, codigo: "193", nome: "Água Destilada Ampola 10ml", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 10, consumoMensal: [8,8,8,8], validades: [] },
  { id: 54, codigo: "113433", nome: "Benzoilmetronidazol 40mg/ml Susp. Oral 120ml (Metronidazol)", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 55, codigo: "18145", nome: "Betametasona 0,5mg + Cetoconazol 20mg Bisnaga 30g (Candicort)", categoria: "Medicamentos", unidade: "Bis", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 56, codigo: "117056", nome: "Cetrimida + Óleo Amêndoa + Óleo Calêndula Creme 40g (Cetrilan)", categoria: "Medicamentos", unidade: "Bis", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 57, codigo: "9221", nome: "Clonazepam 2,5mg/mL Sol. Oral 20ml (Rivotril) ⚠️ PSICOTRÓPICO", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 58, codigo: "2358", nome: "Cloreto de Sódio 0,9% Ampola 10mL - Isofarma", categoria: "Medicamentos", unidade: "Amp", estoque: 180, minimo: 50, consumoMensal: [40,45,42,40], validades: [] },
  { id: 59, codigo: "112032", nome: "Cloreto de Sódio 0,9% Bolsa 50mL", categoria: "Medicamentos", unidade: "Bs", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 60, codigo: "90732", nome: "Dexpantenol Pomada 5% Bisnaga 30g (Bepantol Baby)", categoria: "Medicamentos", unidade: "Bis", estoque: 2, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 61, codigo: "342", nome: "Dipirona Sódica 1000mg Ampola 2mL (Novalgina)", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 5, consumoMensal: [3,4,3,3], validades: [] },
  { id: 62, codigo: "320", nome: "Dimeticona Gotas 75mg/ml Frasco 10ml (Luftal)", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 63, codigo: "863", nome: "Enalapril Comprimido 5mg (Renitec)", categoria: "Medicamentos", unidade: "Comp", estoque: 0, minimo: 30, consumoMensal: [30,30,30,30], validades: [] },
  { id: 64, codigo: "761", nome: "Enoxaparina Seringa 20mg/0,2ml (Clexane)", categoria: "Medicamentos", unidade: "Ser", estoque: 30, minimo: 15, consumoMensal: [15,15,15,15], validades: [] },
  { id: 65, codigo: "212", nome: "Escopolamina N-butil Ampola 20mg/ml (Buscopan Simples)", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 5, consumoMensal: [3,4,3,3], validades: [] },
  { id: 66, codigo: "105818", nome: "Esomeprazol 40mg Frasco-Ampola (Ésio)", categoria: "Medicamentos", unidade: "Fa", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 67, codigo: "1394", nome: "Fenobarbital 200mg Ampola 2mL (Fenocris) ⚠️ PSICOTRÓPICO", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 68, codigo: "116302", nome: "Floralyte 45 Sabor Guaraná Frasco 500ml", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 2, consumoMensal: [2,2,2,2], validades: [] },
  { id: 69, codigo: "169", nome: "Glicose 5% Bolsa 500ml", categoria: "Medicamentos", unidade: "Bs", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 70, codigo: "167", nome: "Glicose 5% Bolsa 1000ml", categoria: "Medicamentos", unidade: "Bs", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 71, codigo: "1603", nome: "Glicose 50% Ampola 20mL - Isofarma", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 72, codigo: "905", nome: "Hidróxido de Ferro Polimaltosado IV 100mg Ampola 5mL (Noripurum)", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 3, consumoMensal: [2,2,2,2], validades: [] },
  { id: 73, codigo: "210453", nome: "Iodara 10mcg/gota Frasco 15ml", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 74, codigo: "29032", nome: "Nistatina + Óxido de Zinco Tubo 60g (Dermodex Tratamento)", categoria: "Medicamentos", unidade: "Tb", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 75, codigo: "25722", nome: "Omeprazol 40mg Frasco-Ampola", categoria: "Medicamentos", unidade: "Fa", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 76, codigo: "5870", nome: "Salbutamol Spray 100mcg/dose 200 Doses (Aerolin)", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 77, codigo: "619", nome: "Sulfametoxazol + Trimetropina Susp. Oral 100ml (Bactrim)", categoria: "Medicamentos", unidade: "Fr", estoque: 0, minimo: 1, consumoMensal: [1,1,1,1], validades: [] },
  { id: 78, codigo: "120415", nome: "Taurolock (Ciclo-Taurolidina e Citrato 4%) 5ml", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 5, consumoMensal: [4,4,4,4], validades: [] },
  { id: 79, codigo: "205907", nome: "Vitamina K 10mg/mL Ampola 1ml (IV, IM, Oral)", categoria: "Medicamentos", unidade: "Amp", estoque: 0, minimo: 3, consumoMensal: [2,2,2,2], validades: [] },
];

const CATEGORIAS = ["Assepsia","Curativos","EPIs","Equipamentos","Higiene","Limpeza","Materiais","Medicamentos","Outros"];
const UNIDADES = ["Unid","Cx","Fr","Amp","Comp","Pç","Pct","Rl","Par","Alm","Bis","Bs","Fa","Pact","Ser","Tb","ml","g"];

const today = new Date();
const diffDays = (a,b) => Math.ceil((new Date(a)-new Date(b))/86400000);
const media = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;

// ── colour tokens ──────────────────────────────────────────────
const C = {
  bg: "#F7F9FC", surface: "#FFFFFF", surfaceAlt: "#EEF2F8",
  border: "#DDE3EE", borderLight: "#EEF2F8",
  text: "#1A202C", textSub: "#64748B", textMuted: "#94A3B8",
  primary: "#2563EB", primaryLight: "#EFF6FF", primaryMid: "#BFDBFE",
  green: "#16A34A", greenLight: "#F0FDF4", greenMid: "#BBF7D0",
  red: "#DC2626", redLight: "#FEF2F2", redMid: "#FECACA",
  orange: "#EA580C", orangeLight: "#FFF7ED", orangeMid: "#FED7AA",
  yellow: "#CA8A04", yellowLight: "#FEFCE8", yellowMid: "#FEF08A",
  purple: "#7C3AED", purpleLight: "#F5F3FF",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.10)",
};

function pill(bg, color, border) {
  return { background: bg, color, border: `1px solid ${border||bg}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap" };
}
function StatusBadge({estoque,minimo}) {
  if(estoque===0) return <span style={pill(C.redLight,C.red,C.redMid)}>Esgotado</span>;
  if(estoque<=minimo) return <span style={pill(C.orangeLight,C.orange,C.orangeMid)}>Crítico</span>;
  if(estoque<=minimo*1.5) return <span style={pill(C.yellowLight,C.yellow,C.yellowMid)}>Atenção</span>;
  return <span style={pill(C.greenLight,C.green,C.greenMid)}>OK</span>;
}
function ValidadeBadge({validades}) {
  if(!validades?.length) return null;
  const prox = validades.reduce((a,b)=>new Date(a.validade)<new Date(b.validade)?a:b);
  const dias = diffDays(prox.validade,today);
  if(dias<0) return <span style={pill(C.redLight,C.red,C.redMid)}>Vencido</span>;
  if(dias<=30) return <span style={pill(C.orangeLight,C.orange,C.orangeMid)}>Vence {dias}d</span>;
  if(dias<=90) return <span style={pill(C.yellowLight,C.yellow,C.yellowMid)}>Vence {dias}d</span>;
  return null;
}

const progressColor = (e,m) => {
  const p = m>0?e/(m*2):1;
  if(p<=0) return C.red; if(p<=0.5) return C.orange; if(p<=0.75) return C.yellow; return C.green;
};
const progressPct = (e,m) => Math.min(100,m>0?(e/(m*2))*100:100);

export default function App() {
  // ── state ──
  const [insumos, setInsumos] = useState(()=>{
    try { const s=window.storage&&null; } catch(e){}
    return defaultData;
  });
  const [historico, setHistorico] = useState([]);
  const [aba, setAba] = useState("estoque");
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [baixaQtd, setBaixaQtd] = useState(1);
  const [toast, setToast] = useState(null);
  const [notifPerm, setNotifPerm] = useState("default");
  const [storageReady, setStorageReady] = useState(false);
  const [emailHospital, setEmailHospital] = useState("");
  const [emailConfig, setEmailConfig] = useState(false);
  const [itensSolicitacao, setItensSolicitacao] = useState([]);
  const [motivoSolicitacao, setMotivoSolicitacao] = useState("urgencia");
  const [obsSolicitacao, setObsSolicitacao] = useState("");
  const [buscaSolic, setBuscaSolic] = useState("");

  // ── persistent storage ──
  useEffect(()=>{
    (async()=>{
      try {
        const saved = await window.storage.get(STORAGE_KEY);
        if(saved?.value) setInsumos(JSON.parse(saved.value));
        const hist = await window.storage.get(HIST_KEY);
        if(hist?.value) setHistorico(JSON.parse(hist.value));
        const email = await window.storage.get("cronicare_email");
        if(email?.value) setEmailHospital(email.value);
      } catch(e){ /* first run */ }
      setStorageReady(true);
    })();
  },[]);

  useEffect(()=>{
    if(!storageReady) return;
    (async()=>{ try { await window.storage.set(STORAGE_KEY, JSON.stringify(insumos)); } catch(e){} })();
  },[insumos, storageReady]);

  useEffect(()=>{
    if(!storageReady) return;
    (async()=>{ try { await window.storage.set(HIST_KEY, JSON.stringify(historico)); } catch(e){} })();
  },[historico, storageReady]);

  // ── notifications ──
  useEffect(()=>{
    if("Notification" in window) setNotifPerm(Notification.permission);
  },[]);

  const requestNotif = async () => {
    if(!("Notification" in window)) return showToast("Notificações não suportadas neste navegador","erro");
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if(perm==="granted") { showToast("Notificações ativadas! ✅"); checkAndNotify(); }
    else showToast("Permissão negada","erro");
  };

  const checkAndNotify = useCallback(()=>{
    if(notifPerm!=="granted") return;
    const criticos = insumos.filter(i=>i.estoque<=i.minimo);
    if(criticos.length>0) {
      new Notification("⚠️ CroniCare Control — Estoque Baixo", {
        body: `${criticos.length} insumo(s) com estoque crítico ou esgotado.`,
        icon: "💊"
      });
    }
  },[insumos, notifPerm]);

  // ── derived ──
  const filtrados = useMemo(()=>insumos.filter(i=>{
    const ok = i.nome.toLowerCase().includes(busca.toLowerCase())||i.categoria.toLowerCase().includes(busca.toLowerCase())||(i.codigo&&i.codigo.includes(busca));
    const cat = filtroCategoria==="Todas"||i.categoria===filtroCategoria;
    return ok&&cat;
  }),[insumos,busca,filtroCategoria]);

  const alertas = useMemo(()=>{
    const r=[];
    insumos.forEach(i=>{
      if(i.estoque<=i.minimo) r.push({tipo:"estoque",insumo:i});
      i.validades?.forEach(v=>{ const d=diffDays(v.validade,today); if(d<=30) r.push({tipo:"validade",insumo:i,dias:d,lote:v.lote}); });
    });
    return r;
  },[insumos]);

  const sugestoes = useMemo(()=>insumos.map(i=>({...i,mediaConsumo:media(i.consumoMensal),sugerido:Math.ceil(media(i.consumoMensal)*1.2)})),[insumos]);

  const showToast = (msg,tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3200); };

  // ── actions ──
  const handleBaixa = () => {
    const qtd=parseInt(baixaQtd);
    if(isNaN(qtd)||qtd<=0) return showToast("Quantidade inválida","erro");
    if(qtd>selected.estoque) return showToast("Estoque insuficiente","erro");
    setInsumos(prev=>prev.map(i=>{ if(i.id!==selected.id) return i; const c=[...i.consumoMensal]; c[c.length-1]=(c[c.length-1]||0)+qtd; return {...i,estoque:i.estoque-qtd,consumoMensal:c}; }));
    setHistorico(prev=>[{data:new Date().toLocaleDateString("pt-BR"),hora:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),insumo:selected.nome,qtd,unidade:selected.unidade},...prev]);
    showToast(`✅ Baixa de ${qtd} ${selected.unidade} registrada!`);
    setModal(null); setBaixaQtd(1);
  };

  const handleSalvar = () => {
    if(!form.nome||!form.categoria) return showToast("Preencha nome e categoria","erro");
    if(modal==="novo") { setInsumos(prev=>[...prev,{...form,id:Date.now(),codigo:form.codigo||"",estoque:parseInt(form.estoque)||0,minimo:parseInt(form.minimo)||5,consumoMensal:[0,0,0,0],validades:[]}]); showToast("Insumo cadastrado!"); }
    else { setInsumos(prev=>prev.map(i=>i.id===selected.id?{...i,...form,estoque:parseInt(form.estoque)||i.estoque,minimo:parseInt(form.minimo)||i.minimo}:i)); showToast("Insumo atualizado!"); }
    setModal(null); setForm({});
  };

  const openModal = (tipo,insumo=null) => { setSelected(insumo); setForm(insumo?{...insumo}:{categoria:"Materiais",unidade:"Unid"}); setBaixaQtd(1); setModal(tipo); };

  // ── Solicitar por email ──
  const toggleItemSolicitacao = (insumo) => {
    setItensSolicitacao(prev => {
      const existe = prev.find(i=>i.id===insumo.id);
      if(existe) return prev.filter(i=>i.id!==insumo.id);
      return [...prev, {...insumo, qtdSolicitada: Math.max(1, insumo.minimo - insumo.estoque)}];
    });
  };

  const atualizarQtdSolicitacao = (id, qtd) => {
    setItensSolicitacao(prev => prev.map(i => i.id===id ? {...i, qtdSolicitada: parseInt(qtd)||1} : i));
  };

  const adicionarCriticosAutomatico = () => {
    const criticos = insumos.filter(i => i.estoque <= i.minimo);
    const novos = criticos.filter(c => !itensSolicitacao.find(s => s.id===c.id));
    const comQtd = novos.map(i => ({...i, qtdSolicitada: Math.max(1, i.minimo - i.estoque + Math.ceil(i.minimo * 0.2))}));
    setItensSolicitacao(prev => [...prev, ...comQtd]);
    showToast(`${novos.length} itens críticos adicionados!`);
  };

  const enviarSolicitacao = () => {
    if(!emailHospital) return showToast("Configure o e-mail do hospital primeiro","erro");
    if(itensSolicitacao.length===0) return showToast("Adicione pelo menos um item","erro");
    const motivos = { urgencia:"Solicitação Urgente de Insumos", reposicao:"Solicitação de Reposição de Insumos", complementar:"Solicitação Complementar de Insumos" };
    const assunto = encodeURIComponent(`[CroniCare Control] ${motivos[motivoSolicitacao]} - Leonardo Bertolozzi Monteiro`);
    const data = new Date().toLocaleDateString("pt-BR");
    const hora = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    const linhasItens = itensSolicitacao.map((i,idx) =>
      `${idx+1}. ${i.nome}${i.codigo ? ` (Cód: ${i.codigo})` : ""}\n   Estoque atual: ${i.estoque} ${i.unidade} | Quantidade solicitada: ${i.qtdSolicitada} ${i.unidade}`
    ).join("\n\n");
    const corpo = `Prezada equipe de insumos,

Solicito a reposição dos itens abaixo referente ao paciente Leonardo Bertolozzi Monteiro (Nascimento: 17/01/2015), em regime de homecare.

TIPO: ${motivos[motivoSolicitacao].toUpperCase()}
DATA/HORA: ${data} às ${hora}

━━━━━━━━━━━━━━━━━━━━━━━━
ITENS SOLICITADOS (${itensSolicitacao.length} item${itensSolicitacao.length>1?"s":""})
━━━━━━━━━━━━━━━━━━━━━━━━

${linhasItens}

━━━━━━━━━━━━━━━━━━━━━━━━
${obsSolicitacao ? `OBSERVAÇÕES:\n${obsSolicitacao}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n` : ""}
Solicitação gerada pelo aplicativo CroniCare Control.

Atenciosamente,
Responsável pelo paciente Leonardo Bertolozzi Monteiro`;

    const mailto = `mailto:${emailHospital}?subject=${assunto}&body=${encodeURIComponent(corpo)}`;
    window.open(mailto, "_blank");
    showToast("📧 E-mail preparado! Verifique seu app de e-mail.");
  };

  // ── PDF export ──
  const exportarPDF = () => {
    const precisaPedir = sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)>0);
    const linhas = precisaPedir.map(i=>`<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${i.nome}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.codigo||"-"}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.estoque} ${i.unidade}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;color:#2563EB">${Math.max(0,i.sugerido-i.estoque)} ${i.unidade}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lista de Pedido - CroniCare Control</title><style>body{font-family:sans-serif;margin:32px;color:#1a202c}h1{color:#2563EB;font-size:22px;margin-bottom:4px}p{color:#64748b;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th{background:#EFF6FF;color:#2563EB;padding:8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}tr:hover td{background:#f8faff}.footer{margin-top:24px;font-size:11px;color:#94a3b8}</style></head><body><h1>🏥 Lista de Pedido — CroniCare Control</h1><p>Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} · Leonardo Bertolozzi Monteiro</p><table><thead><tr><th>Insumo</th><th style="text-align:center">Código</th><th style="text-align:center">Estoque Atual</th><th style="text-align:center">Sugestão de Pedido</th></tr></thead><tbody>${linhas}</tbody></table><p class="footer">* Sugestão baseada no consumo médio dos últimos meses + 20% de margem de segurança.</p></body></html>`;
    const blob = new Blob([html],{type:"text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=`pedido_insumos_${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.html`;
    a.click(); URL.revokeObjectURL(url);
    showToast("📄 Lista exportada com sucesso!");
  };

  // ── styles ──
  const s = {
    app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Nunito','DM Sans','Segoe UI',sans-serif",maxWidth:480,margin:"0 auto",position:"relative"},
    header:{background:"linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)",padding:"24px 20px 16px",boxShadow:C.shadowMd},
    nav:{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto",boxShadow:C.shadow},
    navBtn:(a)=>({flex:"none",padding:"12px 16px",fontSize:13,fontWeight:700,border:"none",background:"none",color:a?C.primary:C.textSub,borderBottom:a?`2px solid ${C.primary}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",transition:"color 0.15s"}),
    content:{padding:"16px"},
    inputEl:{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",boxShadow:C.shadow},
    selectEl:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxShadow:C.shadow},
    card:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:C.shadow},
    btnPrimary:{background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.primary}44`},
    btnDanger:{background:C.red,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnSecondary:{background:C.surface,color:C.text,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 20px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnSmall:(bg,color="#fff")=>({background:bg,color,border:"none",borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}),
    fab:{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:C.primary,color:"#fff",fontSize:28,border:"none",cursor:"pointer",boxShadow:`0 4px 16px ${C.primary}66`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:100},
    overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:200,display:"flex",alignItems:"flex-end",backdropFilter:"blur(2px)"},
    modalBox:{background:C.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"20px 20px 36px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,0.12)"},
    label:{fontSize:12,color:C.textSub,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4},
    inputFull:{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"},
    row2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
    secTitle:{fontSize:11,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10},
    statGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16},
    statCard:(col)=>({background:col+"12",border:`1.5px solid ${col}30`,borderRadius:14,padding:"14px",textAlign:"center"}),
  };

  return (
    <div style={s.app}>
      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:toast.tipo==="erro"?C.red:C.green,color:"#fff",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,boxShadow:C.shadowMd,whiteSpace:"nowrap",transition:"all 0.3s"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:-0.5,margin:0}}>🏥 CroniCare Control</p>
            <p style={{fontSize:13,color:"#BFDBFE",margin:"3px 0 0"}}>Leonardo · {insumos.length} insumos cadastrados</p>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {notifPerm!=="granted" && (
              <button onClick={requestNotif} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",borderRadius:20,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                🔔 Alertas
              </button>
            )}
            {alertas.length>0 && (
              <div style={{background:C.red,color:"#fff",borderRadius:20,padding:"5px 13px",fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:`0 2px 8px ${C.red}66`}} onClick={()=>setAba("alertas")}>
                ⚠️ {alertas.length}
              </div>
            )}
          </div>
        </div>
        {!storageReady && <div style={{fontSize:11,color:"#BFDBFE",marginTop:6}}>🔄 Carregando dados salvos...</div>}
        {storageReady && <div style={{fontSize:11,color:"#BFDBFE",marginTop:6}}>✅ Dados salvos automaticamente</div>}
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {[["estoque","📦 Estoque"],["alertas","🔔 Alertas"],["sugestoes","📋 Pedido"],["solicitar","📨 Solicitar"],["relatorios","📊 Relatórios"]].map(([id,label])=>(
          <button key={id} style={s.navBtn(aba===id)} onClick={()=>setAba(id)}>
            {label}{id==="alertas"&&alertas.length>0?` (${alertas.length})`:""}
          </button>
        ))}
      </nav>

      <div style={s.content}>

        {/* ── ESTOQUE ── */}
        {aba==="estoque" && <>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input style={s.inputEl} placeholder="🔍 Nome ou código..." value={busca} onChange={e=>setBusca(e.target.value)}/>
            <select style={s.selectEl} value={filtroCategoria} onChange={e=>setFiltroCategoria(e.target.value)}>
              <option>Todas</option>{CATEGORIAS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <p style={{fontSize:12,color:C.textMuted,marginBottom:12,fontWeight:600}}>{filtrados.length} de {insumos.length} insumos</p>
          {filtrados.map(i=>(
            <div key={i.id} style={s.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,marginRight:8}}>
                  <p style={{fontSize:14,fontWeight:800,color:C.text,margin:0,lineHeight:1.3}}>{i.nome}</p>
                  <p style={{fontSize:11,color:C.textMuted,margin:"3px 0 0",fontWeight:600}}>{i.categoria}{i.codigo?` · #${i.codigo}`:""}</p>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <StatusBadge estoque={i.estoque} minimo={i.minimo}/>
                  <ValidadeBadge validades={i.validades}/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{minWidth:56}}>
                  <span style={{fontSize:28,fontWeight:900,color:C.primary,lineHeight:1}}>{i.estoque}</span>
                  <span style={{fontSize:11,color:C.textMuted,marginLeft:4,fontWeight:600}}>{i.unidade}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{height:6,background:C.surfaceAlt,borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${progressPct(i.estoque,i.minimo)}%`,background:progressColor(i.estoque,i.minimo),borderRadius:4,transition:"width 0.5s"}}/>
                  </div>
                  <p style={{fontSize:11,color:C.textMuted,marginTop:3,fontWeight:600}}>Mínimo: {i.minimo} {i.unidade}</p>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                <button style={s.btnSmall(C.red)} onClick={()=>openModal("baixa",i)}>− Dar Baixa</button>
                <button style={s.btnSmall(C.primary)} onClick={()=>openModal("editar",i)}>✏️ Editar</button>
                <button style={s.btnSmall(C.purple)} onClick={()=>openModal("validade",i)}>📅 Validade</button>
              </div>
            </div>
          ))}
          <div style={{height:80}}/>
        </>}

        {/* ── ALERTAS ── */}
        {aba==="alertas" && <>
          <div style={s.statGrid}>
            {[[C.red,insumos.filter(i=>i.estoque===0).length,"Esgotados"],[C.orange,insumos.filter(i=>i.estoque>0&&i.estoque<=i.minimo).length,"Críticos"],[C.yellow,insumos.filter(i=>i.validades?.some(v=>diffDays(v.validade,today)<=30)).length,"Vencem 30d"],[C.green,insumos.filter(i=>i.estoque>i.minimo).length,"Em Dia"]].map(([cor,num,label])=>(
              <div key={label} style={s.statCard(cor)}>
                <div style={{fontSize:30,fontWeight:900,color:cor}}>{num}</div>
                <div style={{fontSize:12,color:C.textSub,marginTop:2,fontWeight:700}}>{label}</div>
              </div>
            ))}
          </div>
          {alertas.length===0 && <div style={{textAlign:"center",padding:"40px 20px",color:C.green,fontSize:16,fontWeight:700,background:C.greenLight,borderRadius:14,border:`1px solid ${C.greenMid}`}}>✅ Nenhum alerta no momento!</div>}
          {alertas.filter(a=>a.tipo==="estoque").length>0 && <>
            <p style={s.secTitle}>⚠️ Estoque Baixo / Esgotado</p>
            {alertas.filter(a=>a.tipo==="estoque").map((a,idx)=>(
              <div key={idx} style={{...s.card,borderLeft:`4px solid ${a.insumo.estoque===0?C.red:C.orange}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:800,margin:0}}>{a.insumo.nome}</p>
                    <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{a.insumo.categoria}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:900,color:a.insumo.estoque===0?C.red:C.orange}}>{a.insumo.estoque}</div>
                    <div style={{fontSize:11,color:C.textMuted,fontWeight:600}}>Mín: {a.insumo.minimo}</div>
                  </div>
                </div>
              </div>
            ))}
          </>}
          {alertas.filter(a=>a.tipo==="validade").length>0 && <>
            <p style={{...s.secTitle,marginTop:16}}>📅 Validade Próxima</p>
            {alertas.filter(a=>a.tipo==="validade").map((a,idx)=>(
              <div key={idx} style={{...s.card,borderLeft:`4px solid ${C.purple}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontSize:13,fontWeight:800,margin:0,flex:1,marginRight:8}}>{a.insumo.nome}</p>
                  <span style={pill(a.dias<0?C.redLight:C.orangeLight, a.dias<0?C.red:C.orange)}>{a.dias<0?"Vencido":`${a.dias} dias`}</span>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* ── SUGESTÕES / PEDIDO ── */}
        {aba==="sugestoes" && <>
          <div style={{...s.card,background:C.primaryLight,borderColor:C.primaryMid,marginBottom:16}}>
            <p style={{fontSize:13,color:C.primary,margin:0,fontWeight:600}}>💡 Sugestão baseada no consumo médio + 20% de margem de segurança. Exporte a lista para enviar ao hospital.</p>
          </div>
          <button style={{...s.btnPrimary,width:"100%",marginBottom:16,fontSize:14}} onClick={exportarPDF}>
            📄 Exportar Lista de Pedido (HTML/PDF)
          </button>
          {sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)>0).length>0 && <>
            <p style={s.secTitle}>🔴 Precisa Pedir</p>
            {sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)>0).map(i=>(
              <div key={i.id} style={s.card}>
                <div style={{fontSize:14,fontWeight:800,marginBottom:8,color:C.text}}>{i.nome}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSub,marginBottom:3}}><span>Consumo médio/mês</span><span style={{color:C.primary,fontWeight:700}}>{i.mediaConsumo} {i.unidade}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSub,marginBottom:8}}><span>Estoque atual</span><span style={{fontWeight:600}}>{i.estoque} {i.unidade}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.primaryLight,borderRadius:10,padding:"8px 12px"}}>
                  <span style={{fontSize:13,fontWeight:800,color:C.primary}}>Sugestão de pedido</span>
                  <span style={{background:C.primary,color:"#fff",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:800}}>{Math.max(0,i.sugerido-i.estoque)} {i.unidade}</span>
                </div>
              </div>
            ))}
          </>}
          {sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)===0).length>0 && <>
            <p style={{...s.secTitle,marginTop:16}}>✅ Estoque Suficiente</p>
            {sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)===0).map(i=>(
              <div key={i.id} style={{...s.card,opacity:0.65}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:700}}>{i.nome}</span>
                  <span style={pill(C.greenLight,C.green,C.greenMid)}>OK</span>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* ── SOLICITAR ── */}
        {aba==="solicitar" && <>
          {/* Config email */}
          <div style={{...s.card, background: emailConfig ? C.surface : C.primaryLight, borderColor: emailConfig ? C.border : C.primaryMid, marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom: emailConfig ? 10 : 0}}>
              <p style={{fontSize:14,fontWeight:800,color:C.primary,margin:0}}>📧 E-mail do Hospital</p>
              <button style={s.btnSmall(emailConfig?C.surfaceAlt:C.primary)} onClick={()=>setEmailConfig(!emailConfig)}>
                {emailConfig ? "Fechar" : "⚙️ Configurar"}
              </button>
            </div>
            {emailConfig && <>
              <label style={{...s.label,marginTop:10}}>E-mail do setor de insumos</label>
              <input style={s.inputFull} type="email" placeholder="insumos@hospital.com.br" value={emailHospital}
                onChange={e=>setEmailHospital(e.target.value)}
                onBlur={async()=>{ try { await window.storage.set("cronicare_email", emailHospital); showToast("E-mail salvo!"); } catch(e){} }}
              />
              <p style={{fontSize:11,color:C.textMuted,marginTop:6,fontWeight:600}}>O e-mail é salvo automaticamente ao sair do campo.</p>
            </>}
            {!emailConfig && emailHospital && <p style={{fontSize:12,color:C.primary,margin:"6px 0 0",fontWeight:700}}>✅ {emailHospital}</p>}
            {!emailConfig && !emailHospital && <p style={{fontSize:12,color:C.orange,margin:"6px 0 0",fontWeight:700}}>⚠️ Configure o e-mail para enviar solicitações</p>}
          </div>

          {/* Tipo de solicitação */}
          <p style={s.secTitle}>Tipo de Solicitação</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[["urgencia","🚨 Urgente","Item esgotado ou situação crítica"],["reposicao","🔄 Reposição","Reposição fora da programação quinzenal"],["complementar","➕ Complementar","Item adicional não previsto"]].map(([val,label,desc])=>(
              <div key={val} onClick={()=>setMotivoSolicitacao(val)} style={{...s.card, borderColor: motivoSolicitacao===val ? C.primary : C.border, borderWidth: motivoSolicitacao===val ? 2 : 1, cursor:"pointer", background: motivoSolicitacao===val ? C.primaryLight : C.surface, padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${motivoSolicitacao===val?C.primary:C.border}`,background:motivoSolicitacao===val?C.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {motivoSolicitacao===val && <div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                  </div>
                  <div>
                    <p style={{fontSize:14,fontWeight:800,margin:0,color:motivoSolicitacao===val?C.primary:C.text}}>{label}</p>
                    <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Itens críticos automático */}
          {insumos.filter(i=>i.estoque<=i.minimo).length > 0 && (
            <button style={{...s.btnPrimary, width:"100%", marginBottom:12, background:C.orange, boxShadow:`0 2px 8px ${C.orange}44`}} onClick={adicionarCriticosAutomatico}>
              ⚡ Adicionar {insumos.filter(i=>i.estoque<=i.minimo).length} item(s) crítico(s) automaticamente
            </button>
          )}

          {/* Busca e seleção de itens */}
          <p style={s.secTitle}>Selecionar Itens ({itensSolicitacao.length} selecionado{itensSolicitacao.length!==1?"s":""})</p>
          <input style={{...s.inputEl, width:"100%", marginBottom:10, boxSizing:"border-box"}} placeholder="🔍 Buscar insumo..." value={buscaSolic} onChange={e=>setBuscaSolic(e.target.value)}/>

          {/* Itens selecionados */}
          {itensSolicitacao.length > 0 && <>
            <p style={{fontSize:12,fontWeight:800,color:C.green,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>✅ Selecionados</p>
            {itensSolicitacao.map(i=>(
              <div key={i.id} style={{...s.card, borderColor:C.greenMid, borderWidth:2, background:C.greenLight, marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,marginRight:8}}>
                    <p style={{fontSize:13,fontWeight:800,margin:0,color:C.text}}>{i.nome}</p>
                    <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>Estoque atual: {i.estoque} {i.unidade}</p>
                  </div>
                  <button style={s.btnSmall(C.red)} onClick={()=>toggleItemSolicitacao(i)}>✕</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <label style={{...s.label,margin:0,whiteSpace:"nowrap"}}>Qtd a pedir:</label>
                  <input type="number" min="1" value={i.qtdSolicitada}
                    onChange={e=>atualizarQtdSolicitacao(i.id,e.target.value)}
                    style={{...s.inputFull, padding:"6px 10px", fontSize:14, fontWeight:700, maxWidth:80}}
                  />
                  <span style={{fontSize:13,color:C.textSub,fontWeight:600}}>{i.unidade}</span>
                </div>
              </div>
            ))}
          </>}

          {/* Lista completa para adicionar */}
          <p style={{fontSize:12,fontWeight:800,color:C.textMuted,marginTop:16,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Todos os insumos</p>
          {insumos.filter(i=> !buscaSolic || i.nome.toLowerCase().includes(buscaSolic.toLowerCase()) || (i.codigo&&i.codigo.includes(buscaSolic))).map(i=>{
            const selecionado = !!itensSolicitacao.find(s=>s.id===i.id);
            return (
              <div key={i.id} onClick={()=>toggleItemSolicitacao(i)} style={{...s.card, cursor:"pointer", borderColor: selecionado?C.green:C.border, background: selecionado?C.greenLight:C.surface, marginBottom:8, padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:700,margin:0}}>{i.nome}</p>
                    <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{i.categoria} · Estoque: {i.estoque} {i.unidade}</p>
                  </div>
                  <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${selecionado?C.green:C.border}`,background:selecionado?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {selecionado && <span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Observações */}
          <p style={{...s.secTitle,marginTop:16}}>Observações (opcional)</p>
          <textarea value={obsSolicitacao} onChange={e=>setObsSolicitacao(e.target.value)}
            placeholder="Ex: Item necessário com urgência para procedimento agendado para amanhã..."
            style={{...s.inputFull, minHeight:80, resize:"vertical", lineHeight:1.5}}
          />

          {/* Botão enviar */}
          <button style={{...s.btnPrimary, width:"100%", marginTop:16, padding:"14px", fontSize:15}} onClick={enviarSolicitacao}>
            📧 Abrir E-mail com Solicitação
          </button>
          <p style={{fontSize:11,color:C.textMuted,textAlign:"center",marginTop:8,fontWeight:600}}>
            O app vai abrir seu Gmail ou Outlook já com tudo preenchido.
          </p>
          <div style={{height:32}}/>
        </>}

        {/* ── RELATÓRIOS ── */}
        {aba==="relatorios" && <>
          <p style={s.secTitle}>Resumo Geral</p>
          <div style={s.statGrid}>
            <div style={s.statCard(C.primary)}><div style={{fontSize:30,fontWeight:900,color:C.primary}}>{insumos.length}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Tipos</div></div>
            <div style={s.statCard(C.green)}><div style={{fontSize:30,fontWeight:900,color:C.green}}>{insumos.reduce((a,i)=>a+i.estoque,0)}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Itens em Estoque</div></div>
          </div>
          {CATEGORIAS.filter(cat=>insumos.some(i=>i.categoria===cat)).map(cat=>(
            <div key={cat}>
              <p style={{...s.secTitle,marginTop:14}}>{cat} <span style={{color:C.textMuted,fontSize:10}}>({insumos.filter(i=>i.categoria===cat).length} itens)</span></p>
              {insumos.filter(i=>i.categoria===cat).map(i=>(
                <div key={i.id} style={{...s.card,padding:"10px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1,marginRight:8}}>
                      <p style={{fontSize:13,fontWeight:700,margin:0}}>{i.nome}</p>
                      <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>Média: {media(i.consumoMensal)} {i.unidade}/mês</p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:20,fontWeight:900,color:C.primary}}>{i.estoque}</div>
                      <div style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{i.unidade}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {historico.length>0 && <>
            <p style={{...s.secTitle,marginTop:16}}>Histórico de Baixas</p>
            {historico.slice(0,30).map((h,idx)=>(
              <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.borderLight}`}}>
                <div style={{flex:1,marginRight:8}}>
                  <p style={{fontSize:13,fontWeight:700,margin:0}}>{h.insumo}</p>
                  <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{h.data} {h.hora||""}</p>
                </div>
                <span style={{...pill(C.redLight,C.red,C.redMid),fontSize:13}}>−{h.qtd} {h.unidade||""}</span>
              </div>
            ))}
          </>}
        </>}
      </div>

      {aba==="estoque" && <button style={s.fab} onClick={()=>openModal("novo")}>+</button>}

      {/* ── MODAIS ── */}
      {modal && (
        <div style={s.overlay} onClick={()=>setModal(null)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>

            {modal==="baixa" && selected && <>
              <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
              <p style={{fontSize:18,fontWeight:900,marginBottom:8,color:C.text}}>− Dar Baixa</p>
              <p style={{fontSize:14,color:C.text,marginBottom:4,fontWeight:700}}>{selected.nome}</p>
              <p style={{fontSize:13,color:C.textSub,marginBottom:20}}>Estoque atual: <strong style={{color:C.primary}}>{selected.estoque} {selected.unidade}</strong></p>
              <label style={s.label}>Quantidade utilizada</label>
              <input style={s.inputFull} type="number" min="1" max={selected.estoque} value={baixaQtd} onChange={e=>setBaixaQtd(e.target.value)}/>
              <div style={{display:"flex",gap:8,marginTop:18}}>
                <button style={{...s.btnDanger,flex:1}} onClick={handleBaixa}>Confirmar Baixa</button>
                <button style={s.btnSecondary} onClick={()=>setModal(null)}>Cancelar</button>
              </div>
            </>}

            {(modal==="novo"||modal==="editar") && <>
              <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
              <p style={{fontSize:18,fontWeight:900,marginBottom:18,color:C.text}}>{modal==="novo"?"➕ Novo Insumo":"✏️ Editar Insumo"}</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={s.label}>Código (opcional)</label><input style={s.inputFull} value={form.codigo||""} onChange={e=>setForm(f=>({...f,codigo:e.target.value}))} placeholder="Ex: 51274"/></div>
                <div><label style={s.label}>Nome do Insumo *</label><input style={s.inputFull} value={form.nome||""} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Sonda Aspiração N.8"/></div>
                <div style={s.row2}>
                  <div><label style={s.label}>Categoria *</label><select style={{...s.inputFull}} value={form.categoria||""} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>{CATEGORIAS.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={s.label}>Unidade</label><select style={{...s.inputFull}} value={form.unidade||"Unid"} onChange={e=>setForm(f=>({...f,unidade:e.target.value}))}>{UNIDADES.map(u=><option key={u}>{u}</option>)}</select></div>
                </div>
                <div style={s.row2}>
                  <div><label style={s.label}>Estoque Atual</label><input style={s.inputFull} type="number" min="0" value={form.estoque||""} onChange={e=>setForm(f=>({...f,estoque:e.target.value}))} placeholder="0"/></div>
                  <div><label style={s.label}>Estoque Mínimo</label><input style={s.inputFull} type="number" min="0" value={form.minimo||""} onChange={e=>setForm(f=>({...f,minimo:e.target.value}))} placeholder="5"/></div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button style={{...s.btnPrimary,flex:1}} onClick={handleSalvar}>{modal==="novo"?"Cadastrar":"Salvar"}</button>
                <button style={s.btnSecondary} onClick={()=>setModal(null)}>Cancelar</button>
              </div>
            </>}

            {modal==="validade" && selected && <>
              <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
              <p style={{fontSize:18,fontWeight:900,marginBottom:4,color:C.text}}>📅 Validades</p>
              <p style={{fontSize:13,color:C.textSub,marginBottom:16,fontWeight:600}}>{selected.nome}</p>
              {(!selected.validades||selected.validades.length===0) && <div style={{background:C.surfaceAlt,borderRadius:10,padding:"14px",fontSize:13,color:C.textSub,textAlign:"center",marginBottom:16}}>Nenhum lote cadastrado ainda.</div>}
              {selected.validades?.map((v,idx)=>{ const dias=diffDays(v.validade,today); return (
                <div key={idx} style={{...s.card,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><p style={{margin:0,fontWeight:800,fontSize:14}}>Lote: {v.lote}</p><p style={{margin:"3px 0 0",fontSize:12,color:C.textMuted,fontWeight:600}}>{v.qtd} {selected.unidade} · {new Date(v.validade).toLocaleDateString("pt-BR")}</p></div>
                    <span style={pill(dias<0?C.redLight:dias<=30?C.orangeLight:C.greenLight, dias<0?C.red:dias<=30?C.orange:C.green)}>{dias<0?"Vencido":`${dias}d`}</span>
                  </div>
                </div>
              );})}
              <p style={{...s.label,marginTop:16,marginBottom:10}}>Adicionar Lote</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input style={s.inputFull} placeholder="Número do lote" value={form.novoLote||""} onChange={e=>setForm(f=>({...f,novoLote:e.target.value}))}/>
                <div style={s.row2}>
                  <input style={s.inputFull} type="date" value={form.novaValidade||""} onChange={e=>setForm(f=>({...f,novaValidade:e.target.value}))}/>
                  <input style={s.inputFull} type="number" placeholder="Qtd" value={form.novaQtd||""} onChange={e=>setForm(f=>({...f,novaQtd:e.target.value}))}/>
                </div>
                <button style={s.btnPrimary} onClick={()=>{ if(!form.novoLote||!form.novaValidade) return showToast("Preencha lote e validade","erro"); const nl={lote:form.novoLote,validade:form.novaValidade,qtd:parseInt(form.novaQtd)||1}; setInsumos(prev=>prev.map(i=>i.id===selected.id?{...i,validades:[...(i.validades||[]),nl]}:i)); setSelected(prev=>({...prev,validades:[...(prev.validades||[]),nl]})); setForm({}); showToast("Lote adicionado!"); }}>Adicionar Lote</button>
              </div>
              <button style={{...s.btnSecondary,width:"100%",marginTop:12}} onClick={()=>setModal(null)}>Fechar</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
