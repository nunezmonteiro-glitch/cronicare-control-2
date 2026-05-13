import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://oxbqksqnxohfygprdxck.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YnFrc3FueG9oZnlncHJkeGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjkwMzUsImV4cCI6MjA5NDIwNTAzNX0.G9aVYlNJQkB64ztv1irdVc-AQBlmD5uqC1q-j_dUypg"
);

const PATIENT_ID = "00000000-0000-0000-0000-000000000002";
const CATEGORIAS = ["Assepsia","Curativos","EPIs","Equipamentos","Higiene","Limpeza","Materiais","Medicamentos","Outros"];
const UNIDADES = ["Unid","Cx","Fr","Amp","Comp","Pç","Pct","Rl","Par","Alm","Bis","Bs","Fa","Pact","Ser","Tb","ml","g"];

const today = new Date();
const diffDays = (a,b) => Math.ceil((new Date(a)-new Date(b))/86400000);
const media = arr => arr?.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;

const C = {
  bg:"#F7F9FC", surface:"#FFFFFF", surfaceAlt:"#EEF2F8",
  border:"#DDE3EE", borderLight:"#EEF2F8",
  text:"#1A202C", textSub:"#64748B", textMuted:"#94A3B8",
  primary:"#2563EB", primaryLight:"#EFF6FF", primaryMid:"#BFDBFE",
  green:"#16A34A", greenLight:"#F0FDF4", greenMid:"#BBF7D0",
  red:"#DC2626", redLight:"#FEF2F2", redMid:"#FECACA",
  orange:"#EA580C", orangeLight:"#FFF7ED", orangeMid:"#FED7AA",
  yellow:"#CA8A04", yellowLight:"#FEFCE8", yellowMid:"#FEF08A",
  purple:"#7C3AED", purpleLight:"#F5F3FF",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",
  shadowMd:"0 4px 12px rgba(0,0,0,0.10)",
};

function pill(bg,color,border){ return {background:bg,color,border:`1px solid ${border||bg}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"}; }
function StatusBadge({estoque,minimo}){
  if(estoque===0) return <span style={pill(C.redLight,C.red,C.redMid)}>Esgotado</span>;
  if(estoque<=minimo) return <span style={pill(C.orangeLight,C.orange,C.orangeMid)}>Crítico</span>;
  if(estoque<=minimo*1.5) return <span style={pill(C.yellowLight,C.yellow,C.yellowMid)}>Atenção</span>;
  return <span style={pill(C.greenLight,C.green,C.greenMid)}>OK</span>;
}
function ValidadeBadge({validades}){
  if(!validades?.length) return null;
  const prox = validades.reduce((a,b)=>new Date(a.validade)<new Date(b.validade)?a:b);
  const dias = diffDays(prox.validade,today);
  if(dias<0) return <span style={pill(C.redLight,C.red,C.redMid)}>Vencido</span>;
  if(dias<=30) return <span style={pill(C.orangeLight,C.orange,C.orangeMid)}>Vence {dias}d</span>;
  if(dias<=90) return <span style={pill(C.yellowLight,C.yellow,C.yellowMid)}>Vence {dias}d</span>;
  return null;
}
const progressColor=(e,m)=>{ const p=m>0?e/(m*2):1; if(p<=0)return C.red; if(p<=0.5)return C.orange; if(p<=0.75)return C.yellow; return C.green; };
const progressPct=(e,m)=>Math.min(100,m>0?(e/(m*2))*100:100);

// ── LOGIN SCREEN ──────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [isRegister,setIsRegister]=useState(false);
  const [name,setName]=useState("");

  const handle = async() => {
    setLoading(true); setError("");
    try {
      if(isRegister){
        const {data,error:e} = await supabase.auth.signUp({email,password});
        if(e) throw e;
        if(data.user){
          await supabase.from("profiles").insert({id:data.user.id,name,email,role:"caregiver"});
          await supabase.from("patient_caregivers").insert({patient_id:PATIENT_ID,profile_id:data.user.id});
        }
        setError("✅ Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const {error:e} = await supabase.auth.signInWithPassword({email,password});
        if(e) throw e;
        onLogin();
      }
    } catch(e){ setError(e.message||"Erro ao entrar"); }
    setLoading(false);
  };

  const s = {
    wrap:{minHeight:"100vh",background:"linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito','Segoe UI',sans-serif"},
    box:{background:"#fff",borderRadius:20,padding:"32px 24px",width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"},
    title:{fontSize:26,fontWeight:900,color:C.primary,margin:"0 0 4px"},
    sub:{fontSize:13,color:C.textSub,marginBottom:28},
    label:{fontSize:12,fontWeight:700,color:C.textSub,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4},
    input:{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14},
    btn:{width:"100%",background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"13px",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",marginTop:4},
    err:{fontSize:13,color:error.startsWith("✅")?C.green:C.red,marginTop:12,textAlign:"center",fontWeight:600},
    link:{fontSize:13,color:C.primary,textAlign:"center",marginTop:16,cursor:"pointer",fontWeight:700},
  };

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <p style={s.title}>🏥 CroniCare Control</p>
        <p style={s.sub}>{isRegister?"Crie sua conta":"Entre com sua conta"}</p>
        {isRegister && <>
          <label style={s.label}>Seu nome</label>
          <input style={s.input} placeholder="Ex: João Silva" value={name} onChange={e=>setName(e.target.value)}/>
        </>}
        <label style={s.label}>E-mail</label>
        <input style={s.input} type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <label style={s.label}>Senha</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        <button style={s.btn} onClick={handle} disabled={loading}>
          {loading?"Aguarde...":(isRegister?"Criar Conta":"Entrar")}
        </button>
        {error && <p style={s.err}>{error}</p>}
        <p style={s.link} onClick={()=>{setIsRegister(!isRegister);setError("");}}>
          {isRegister?"Já tenho conta → Entrar":"Não tenho conta → Criar conta"}
        </p>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App(){
  const [session,setSession]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [insumos,setInsumos]=useState([]);
  const [historico,setHistorico]=useState([]);
  const [loading,setLoading]=useState(false);
  const [aba,setAba]=useState("estoque");
  const [busca,setBusca]=useState("");
  const [filtroCategoria,setFiltroCategoria]=useState("Todas");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({});
  const [baixaQtd,setBaixaQtd]=useState(1);
  const [toast,setToast]=useState(null);
  const [emailHospital,setEmailHospital]=useState("");
  const [emailConfig,setEmailConfig]=useState(false);
  const [itensSolicitacao,setItensSolicitacao]=useState([]);
  const [motivoSolicitacao,setMotivoSolicitacao]=useState("urgencia");
  const [obsSolicitacao,setObsSolicitacao]=useState("");
  const [buscaSolic,setBuscaSolic]=useState("");

  const showToast=(msg,tipo="ok")=>{ setToast({msg,tipo}); setTimeout(()=>setToast(null),3200); };

  // ── Auth ──
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{ setSession(session); setAuthLoading(false); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{ setSession(session); setAuthLoading(false); });
    return ()=>subscription.unsubscribe();
  },[]);

  // ── Load data ──
  useEffect(()=>{ if(session) { loadSupplies(); loadMovements(); } },[session]);

  const loadSupplies = async() => {
    setLoading(true);
    const {data,error} = await supabase
      .from("supplies")
      .select("*, supply_lots(*)")
      .eq("patient_id",PATIENT_ID)
      .eq("active",true)
      .order("nome");
    if(!error && data) setInsumos(data.map(i=>({...i, validades: i.supply_lots||[]})));
    setLoading(false);
  };

  const loadMovements = async() => {
    const {data,error} = await supabase
      .from("stock_movements")
      .select("*, profiles(name)")
      .eq("patient_id",PATIENT_ID)
      .order("created_at",{ascending:false})
      .limit(50);
    if(!error && data) setHistorico(data);
  };

  // ── Realtime sync ──
  useEffect(()=>{
    if(!session) return;
    const channel = supabase.channel("supplies_changes")
      .on("postgres_changes",{event:"*",schema:"public",table:"supplies",filter:`patient_id=eq.${PATIENT_ID}`},()=>loadSupplies())
      .on("postgres_changes",{event:"*",schema:"public",table:"stock_movements",filter:`patient_id=eq.${PATIENT_ID}`},()=>loadMovements())
      .on("postgres_changes",{event:"*",schema:"public",table:"supply_lots"},()=>loadSupplies())
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[session]);

  // ── Actions ──
  const handleBaixa = async() => {
    const qtd=parseInt(baixaQtd);
    if(isNaN(qtd)||qtd<=0) return showToast("Quantidade inválida","erro");
    if(qtd>selected.estoque) return showToast("Estoque insuficiente","erro");
    const novoConsumo = [...(selected.consumo_mensal||[0,0,0,0])];
    novoConsumo[novoConsumo.length-1]=(novoConsumo[novoConsumo.length-1]||0)+qtd;
    const {error} = await supabase.from("supplies").update({estoque:selected.estoque-qtd, consumo_mensal:novoConsumo}).eq("id",selected.id);
    if(error) return showToast("Erro ao dar baixa","erro");
    await supabase.from("stock_movements").insert({supply_id:selected.id,patient_id:PATIENT_ID,profile_id:session.user.id,tipo:"baixa",quantidade:qtd});
    showToast(`✅ Baixa de ${qtd} ${selected.unidade} registrada!`);
    setModal(null); setBaixaQtd(1);
  };

  const handleSalvar = async() => {
    if(!form.nome||!form.categoria) return showToast("Preencha nome e categoria","erro");
    const payload = {patient_id:PATIENT_ID,codigo:form.codigo||"",nome:form.nome,categoria:form.categoria,unidade:form.unidade||"Unid",estoque:parseInt(form.estoque)||0,minimo:parseInt(form.minimo)||5};
    if(modal==="novo"){
      const {error} = await supabase.from("supplies").insert({...payload,consumo_mensal:[0,0,0,0]});
      if(error) return showToast("Erro ao cadastrar","erro");
      showToast("Insumo cadastrado!");
    } else {
      const {error} = await supabase.from("supplies").update(payload).eq("id",selected.id);
      if(error) return showToast("Erro ao salvar","erro");
      showToast("Insumo atualizado!");
    }
    setModal(null); setForm({});
  };

  const handleAddLote = async() => {
    if(!form.novoLote||!form.novaValidade) return showToast("Preencha lote e validade","erro");
    const {error} = await supabase.from("supply_lots").insert({supply_id:selected.id,lote:form.novoLote,validade:form.novaValidade,quantidade:parseInt(form.novaQtd)||1});
    if(error) return showToast("Erro ao adicionar lote","erro");
    showToast("Lote adicionado!"); setForm({});
  };

  const openModal=(tipo,insumo=null)=>{ setSelected(insumo); setForm(insumo?{...insumo}:{categoria:"Materiais",unidade:"Unid"}); setBaixaQtd(1); setModal(tipo); };

  const toggleItemSolicitacao=(insumo)=>{ setItensSolicitacao(prev=>{ const e=prev.find(i=>i.id===insumo.id); if(e) return prev.filter(i=>i.id!==insumo.id); return [...prev,{...insumo,qtdSolicitada:Math.max(1,insumo.minimo-insumo.estoque)}]; }); };
  const atualizarQtdSolicitacao=(id,qtd)=>{ setItensSolicitacao(prev=>prev.map(i=>i.id===id?{...i,qtdSolicitada:parseInt(qtd)||1}:i)); };
  const adicionarCriticosAutomatico=()=>{ const criticos=insumos.filter(i=>i.estoque<=i.minimo); const novos=criticos.filter(c=>!itensSolicitacao.find(s=>s.id===c.id)); setItensSolicitacao(prev=>[...prev,...novos.map(i=>({...i,qtdSolicitada:Math.max(1,i.minimo-i.estoque+Math.ceil(i.minimo*0.2))}))]); showToast(`${novos.length} itens críticos adicionados!`); };

  const enviarSolicitacao=()=>{
    if(!emailHospital) return showToast("Configure o e-mail do hospital primeiro","erro");
    if(itensSolicitacao.length===0) return showToast("Adicione pelo menos um item","erro");
    const motivos={urgencia:"Solicitação Urgente de Insumos",reposicao:"Solicitação de Reposição de Insumos",complementar:"Solicitação Complementar de Insumos"};
    const assunto=encodeURIComponent(`[CroniCare Control] ${motivos[motivoSolicitacao]} - Leonardo Bertolozzi Monteiro`);
    const linhasItens=itensSolicitacao.map((i,idx)=>`${idx+1}. ${i.nome}${i.codigo?` (Cód: ${i.codigo})`:""}\n   Estoque atual: ${i.estoque} ${i.unidade} | Quantidade solicitada: ${i.qtdSolicitada} ${i.unidade}`).join("\n\n");
    const corpo=`Prezada equipe de insumos,\n\nSolicito a reposição dos itens abaixo referente ao paciente Leonardo Bertolozzi Monteiro, em regime de homecare.\n\nTIPO: ${motivos[motivoSolicitacao].toUpperCase()}\nDATA/HORA: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nITENS SOLICITADOS (${itensSolicitacao.length} item${itensSolicitacao.length>1?"s":""})\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n${linhasItens}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n${obsSolicitacao?`OBSERVAÇÕES:\n${obsSolicitacao}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n`:""}\nSolicitação gerada pelo CroniCare Control.\n\nAtenciosamente,\nResponsável pelo paciente Leonardo Bertolozzi Monteiro`;
    window.open(`mailto:${emailHospital}?subject=${assunto}&body=${encodeURIComponent(corpo)}`,"_blank");
    showToast("📧 E-mail preparado!");
  };

  const exportarPDF=()=>{
    const precisaPedir=sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)>0);
    const linhas=precisaPedir.map(i=>`<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${i.nome}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.codigo||"-"}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.estoque} ${i.unidade}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;color:#2563EB">${Math.max(0,i.sugerido-i.estoque)} ${i.unidade}</td></tr>`).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lista de Pedido - CroniCare Control</title><style>body{font-family:sans-serif;margin:32px;color:#1a202c}h1{color:#2563EB;font-size:22px;margin-bottom:4px}p{color:#64748b;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th{background:#EFF6FF;color:#2563EB;padding:8px;text-align:left;font-size:12px;text-transform:uppercase}</style></head><body><h1>🏥 Lista de Pedido — CroniCare Control</h1><p>Gerado em ${new Date().toLocaleDateString("pt-BR")} — Leonardo Bertolozzi Monteiro</p><table><thead><tr><th>Insumo</th><th style="text-align:center">Código</th><th style="text-align:center">Estoque Atual</th><th style="text-align:center">Sugestão de Pedido</th></tr></thead><tbody>${linhas}</tbody></table></body></html>`;
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`pedido_${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.html`;
    a.click(); URL.revokeObjectURL(url);
    showToast("📄 Lista exportada!");
  };

  // ── Derived ──
  const filtrados=useMemo(()=>insumos.filter(i=>{ const ok=i.nome.toLowerCase().includes(busca.toLowerCase())||i.categoria.toLowerCase().includes(busca.toLowerCase())||(i.codigo&&i.codigo.includes(busca)); const cat=filtroCategoria==="Todas"||i.categoria===filtroCategoria; return ok&&cat; }),[insumos,busca,filtroCategoria]);
  const alertas=useMemo(()=>{ const r=[]; insumos.forEach(i=>{ if(i.estoque<=i.minimo) r.push({tipo:"estoque",insumo:i}); i.validades?.forEach(v=>{ const d=diffDays(v.validade,today); if(d<=30) r.push({tipo:"validade",insumo:i,dias:d,lote:v.lote}); }); }); return r; },[insumos]);
  const sugestoes=useMemo(()=>insumos.map(i=>({...i,mediaConsumo:media(i.consumo_mensal),sugerido:Math.ceil(media(i.consumo_mensal)*1.2)})),[insumos]);

  // ── Styles ──
  const s={
    app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Nunito','DM Sans','Segoe UI',sans-serif",maxWidth:480,margin:"0 auto",position:"relative"},
    header:{background:"linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)",padding:"20px 20px 14px",boxShadow:C.shadowMd},
    nav:{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto",boxShadow:C.shadow},
    navBtn:(a)=>({flex:"none",padding:"11px 14px",fontSize:12,fontWeight:700,border:"none",background:"none",color:a?C.primary:C.textSub,borderBottom:a?`2px solid ${C.primary}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}),
    content:{padding:"16px"},
    inputEl:{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",boxShadow:C.shadow},
    selectEl:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxShadow:C.shadow},
    card:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:C.shadow},
    btnPrimary:{background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnDanger:{background:C.red,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnSecondary:{background:C.surface,color:C.text,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 20px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnSmall:(bg)=>({background:bg,color:"#fff",border:"none",borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}),
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

  if(authLoading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.primary,fontFamily:"'Nunito',sans-serif",color:"#fff",fontSize:18,fontWeight:700}}>🏥 CroniCare Control...</div>;
  if(!session) return <LoginScreen onLogin={()=>supabase.auth.getSession().then(({data:{session}})=>setSession(session))}/>;

  return (
    <div style={s.app}>
      {toast && <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:toast.tipo==="erro"?C.red:C.green,color:"#fff",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,boxShadow:C.shadowMd,whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={s.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:-0.5,margin:0}}>🏥 CroniCare Control</p>
            <p style={{fontSize:12,color:"#BFDBFE",margin:"3px 0 0"}}>Leonardo · {insumos.length} insumos · {session.user.email}</p>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {alertas.length>0 && <div style={{background:C.red,color:"#fff",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,cursor:"pointer"}} onClick={()=>setAba("alertas")}>⚠️ {alertas.length}</div>}
            <button onClick={()=>supabase.auth.signOut()} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Sair</button>
          </div>
        </div>
        <div style={{fontSize:11,color:"#BFDBFE",marginTop:6}}>🔄 Sincronizado em tempo real</div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {[["estoque","📦 Estoque"],["alertas","🔔 Alertas"],["sugestoes","📋 Pedido"],["solicitar","📨 Solicitar"],["relatorios","📊 Relatórios"]].map(([id,label])=>(
          <button key={id} style={s.navBtn(aba===id)} onClick={()=>setAba(id)}>{label}{id==="alertas"&&alertas.length>0?` (${alertas.length})`:""}</button>
        ))}
      </nav>

      <div style={s.content}>
        {loading && <div style={{textAlign:"center",padding:40,color:C.textMuted,fontWeight:700}}>🔄 Carregando...</div>}

        {/* ESTOQUE */}
        {!loading && aba==="estoque" && <>
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

        {/* ALERTAS */}
        {!loading && aba==="alertas" && <>
          <div style={s.statGrid}>
            {[[C.red,insumos.filter(i=>i.estoque===0).length,"Esgotados"],[C.orange,insumos.filter(i=>i.estoque>0&&i.estoque<=i.minimo).length,"Críticos"],[C.yellow,insumos.filter(i=>i.validades?.some(v=>diffDays(v.validade,today)<=30)).length,"Vencem 30d"],[C.green,insumos.filter(i=>i.estoque>i.minimo).length,"Em Dia"]].map(([cor,num,label])=>(
              <div key={label} style={s.statCard(cor)}>
                <div style={{fontSize:30,fontWeight:900,color:cor}}>{num}</div>
                <div style={{fontSize:12,color:C.textSub,marginTop:2,fontWeight:700}}>{label}</div>
              </div>
            ))}
          </div>
          {alertas.length===0 && <div style={{textAlign:"center",padding:"40px 20px",color:C.green,fontSize:16,fontWeight:700,background:C.greenLight,borderRadius:14}}>✅ Nenhum alerta!</div>}
          {alertas.filter(a=>a.tipo==="estoque").length>0 && <>
            <p style={s.secTitle}>⚠️ Estoque Baixo / Esgotado</p>
            {alertas.filter(a=>a.tipo==="estoque").map((a,idx)=>(
              <div key={idx} style={{...s.card,borderLeft:`4px solid ${a.insumo.estoque===0?C.red:C.orange}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}><p style={{fontSize:13,fontWeight:800,margin:0}}>{a.insumo.nome}</p><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{a.insumo.categoria}</p></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:900,color:a.insumo.estoque===0?C.red:C.orange}}>{a.insumo.estoque}</div><div style={{fontSize:11,color:C.textMuted,fontWeight:600}}>Mín: {a.insumo.minimo}</div></div>
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
                  <span style={pill(a.dias<0?C.redLight:C.orangeLight,a.dias<0?C.red:C.orange)}>{a.dias<0?"Vencido":`${a.dias} dias`}</span>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* PEDIDO */}
        {!loading && aba==="sugestoes" && <>
          <div style={{...s.card,background:C.primaryLight,borderColor:C.primaryMid,marginBottom:16}}>
            <p style={{fontSize:13,color:C.primary,margin:0,fontWeight:600}}>💡 Sugestão baseada no consumo médio + 20% de margem.</p>
          </div>
          <button style={{...s.btnPrimary,width:"100%",marginBottom:16}} onClick={exportarPDF}>📄 Exportar Lista de Pedido</button>
          {sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)>0).length>0 && <>
            <p style={s.secTitle}>🔴 Precisa Pedir</p>
            {sugestoes.filter(i=>Math.max(0,i.sugerido-i.estoque)>0).map(i=>(
              <div key={i.id} style={s.card}>
                <div style={{fontSize:14,fontWeight:800,marginBottom:8}}>{i.nome}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSub,marginBottom:3}}><span>Consumo médio/mês</span><span style={{color:C.primary,fontWeight:700}}>{i.mediaConsumo} {i.unidade}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSub,marginBottom:8}}><span>Estoque atual</span><span style={{fontWeight:600}}>{i.estoque} {i.unidade}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.primaryLight,borderRadius:10,padding:"8px 12px"}}>
                  <span style={{fontSize:13,fontWeight:800,color:C.primary}}>Sugestão de pedido</span>
                  <span style={{background:C.primary,color:"#fff",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:800}}>{Math.max(0,i.sugerido-i.estoque)} {i.unidade}</span>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* SOLICITAR */}
        {!loading && aba==="solicitar" && <>
          <div style={{...s.card,background:emailConfig?C.surface:C.primaryLight,borderColor:emailConfig?C.border:C.primaryMid,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:emailConfig?10:0}}>
              <p style={{fontSize:14,fontWeight:800,color:C.primary,margin:0}}>📧 E-mail do Hospital</p>
              <button style={s.btnSmall(C.primary)} onClick={()=>setEmailConfig(!emailConfig)}>{emailConfig?"Fechar":"⚙️ Configurar"}</button>
            </div>
            {emailConfig && <>
              <label style={{...s.label,marginTop:10}}>E-mail do setor de insumos</label>
              <input style={s.inputFull} type="email" placeholder="insumos@hospital.com.br" value={emailHospital} onChange={e=>setEmailHospital(e.target.value)}/>
            </>}
            {!emailConfig && emailHospital && <p style={{fontSize:12,color:C.primary,margin:"6px 0 0",fontWeight:700}}>✅ {emailHospital}</p>}
            {!emailConfig && !emailHospital && <p style={{fontSize:12,color:C.orange,margin:"6px 0 0",fontWeight:700}}>⚠️ Configure o e-mail para enviar solicitações</p>}
          </div>
          <p style={s.secTitle}>Tipo de Solicitação</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[["urgencia","🚨 Urgente","Item esgotado ou situação crítica"],["reposicao","🔄 Reposição","Fora da programação quinzenal"],["complementar","➕ Complementar","Item adicional não previsto"]].map(([val,label,desc])=>(
              <div key={val} onClick={()=>setMotivoSolicitacao(val)} style={{...s.card,borderColor:motivoSolicitacao===val?C.primary:C.border,borderWidth:motivoSolicitacao===val?2:1,cursor:"pointer",background:motivoSolicitacao===val?C.primaryLight:C.surface,padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${motivoSolicitacao===val?C.primary:C.border}`,background:motivoSolicitacao===val?C.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {motivoSolicitacao===val && <div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                  </div>
                  <div><p style={{fontSize:14,fontWeight:800,margin:0,color:motivoSolicitacao===val?C.primary:C.text}}>{label}</p><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{desc}</p></div>
                </div>
              </div>
            ))}
          </div>
          {insumos.filter(i=>i.estoque<=i.minimo).length>0 && <button style={{...s.btnPrimary,width:"100%",marginBottom:12,background:C.orange}} onClick={adicionarCriticosAutomatico}>⚡ Adicionar {insumos.filter(i=>i.estoque<=i.minimo).length} item(s) crítico(s)</button>}
          <p style={s.secTitle}>Selecionar Itens ({itensSolicitacao.length} selecionado{itensSolicitacao.length!==1?"s":""})</p>
          <input style={{...s.inputEl,width:"100%",marginBottom:10,boxSizing:"border-box"}} placeholder="🔍 Buscar insumo..." value={buscaSolic} onChange={e=>setBuscaSolic(e.target.value)}/>
          {itensSolicitacao.length>0 && <>
            <p style={{fontSize:12,fontWeight:800,color:C.green,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>✅ Selecionados</p>
            {itensSolicitacao.map(i=>(
              <div key={i.id} style={{...s.card,borderColor:C.greenMid,borderWidth:2,background:C.greenLight,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,marginRight:8}}><p style={{fontSize:13,fontWeight:800,margin:0}}>{i.nome}</p><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>Estoque: {i.estoque} {i.unidade}</p></div>
                  <button style={s.btnSmall(C.red)} onClick={()=>toggleItemSolicitacao(i)}>✕</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <label style={{...s.label,margin:0,whiteSpace:"nowrap"}}>Qtd:</label>
                  <input type="number" min="1" value={i.qtdSolicitada} onChange={e=>atualizarQtdSolicitacao(i.id,e.target.value)} style={{...s.inputFull,padding:"6px 10px",fontSize:14,fontWeight:700,maxWidth:80}}/>
                  <span style={{fontSize:13,color:C.textSub,fontWeight:600}}>{i.unidade}</span>
                </div>
              </div>
            ))}
          </>}
          <p style={{fontSize:12,fontWeight:800,color:C.textMuted,marginTop:16,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Todos os insumos</p>
          {insumos.filter(i=>!buscaSolic||i.nome.toLowerCase().includes(buscaSolic.toLowerCase())||(i.codigo&&i.codigo.includes(buscaSolic))).map(i=>{ const sel=!!itensSolicitacao.find(s=>s.id===i.id); return (
            <div key={i.id} onClick={()=>toggleItemSolicitacao(i)} style={{...s.card,cursor:"pointer",borderColor:sel?C.green:C.border,background:sel?C.greenLight:C.surface,marginBottom:8,padding:"10px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,margin:0}}>{i.nome}</p><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{i.categoria} · {i.estoque} {i.unidade}</p></div>
                <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${sel?C.green:C.border}`,background:sel?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>}</div>
              </div>
            </div>
          );})}
          <p style={{...s.secTitle,marginTop:16}}>Observações (opcional)</p>
          <textarea value={obsSolicitacao} onChange={e=>setObsSolicitacao(e.target.value)} placeholder="Ex: Urgente para procedimento amanhã..." style={{...s.inputFull,minHeight:80,resize:"vertical",lineHeight:1.5}}/>
          <button style={{...s.btnPrimary,width:"100%",marginTop:16,padding:"14px",fontSize:15}} onClick={enviarSolicitacao}>📧 Abrir E-mail com Solicitação</button>
          <div style={{height:32}}/>
        </>}

        {/* RELATÓRIOS */}
        {!loading && aba==="relatorios" && <>
          <p style={s.secTitle}>Resumo Geral</p>
          <div style={s.statGrid}>
            <div style={s.statCard(C.primary)}><div style={{fontSize:30,fontWeight:900,color:C.primary}}>{insumos.length}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Tipos</div></div>
            <div style={s.statCard(C.green)}><div style={{fontSize:30,fontWeight:900,color:C.green}}>{insumos.reduce((a,i)=>a+i.estoque,0)}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Em Estoque</div></div>
          </div>
          {CATEGORIAS.filter(cat=>insumos.some(i=>i.categoria===cat)).map(cat=>(
            <div key={cat}>
              <p style={{...s.secTitle,marginTop:14}}>{cat} ({insumos.filter(i=>i.categoria===cat).length})</p>
              {insumos.filter(i=>i.categoria===cat).map(i=>(
                <div key={i.id} style={{...s.card,padding:"10px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1,marginRight:8}}><p style={{fontSize:13,fontWeight:700,margin:0}}>{i.nome}</p><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>Média: {media(i.consumo_mensal)} {i.unidade}/mês</p></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:C.primary}}>{i.estoque}</div><div style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{i.unidade}</div></div>
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
                  <p style={{fontSize:13,fontWeight:700,margin:0}}>{insumos.find(i=>i.id===h.supply_id)?.nome||"Insumo"}</p>
                  <p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0",fontWeight:600}}>{new Date(h.created_at).toLocaleDateString("pt-BR")} · {h.profiles?.name||""}</p>
                </div>
                <span style={{...pill(C.redLight,C.red,C.redMid),fontSize:13}}>−{h.quantidade}</span>
              </div>
            ))}
          </>}
        </>}
      </div>

      {aba==="estoque" && !loading && <button style={s.fab} onClick={()=>openModal("novo")}>+</button>}

      {/* MODAIS */}
      {modal && (
        <div style={s.overlay} onClick={()=>setModal(null)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>

            {modal==="baixa" && selected && <>
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
              <p style={{fontSize:18,fontWeight:900,marginBottom:4,color:C.text}}>📅 Validades</p>
              <p style={{fontSize:13,color:C.textSub,marginBottom:16,fontWeight:600}}>{selected.nome}</p>
              {(!selected.validades||selected.validades.length===0) && <div style={{background:C.surfaceAlt,borderRadius:10,padding:14,fontSize:13,color:C.textSub,textAlign:"center",marginBottom:16}}>Nenhum lote cadastrado.</div>}
              {selected.validades?.map((v,idx)=>{ const dias=diffDays(v.validade,today); return (
                <div key={idx} style={{...s.card,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><p style={{margin:0,fontWeight:800,fontSize:14}}>Lote: {v.lote}</p><p style={{margin:"3px 0 0",fontSize:12,color:C.textMuted,fontWeight:600}}>{v.quantidade} {selected.unidade} · {new Date(v.validade).toLocaleDateString("pt-BR")}</p></div>
                    <span style={pill(dias<0?C.redLight:dias<=30?C.orangeLight:C.greenLight,dias<0?C.red:dias<=30?C.orange:C.green)}>{dias<0?"Vencido":`${dias}d`}</span>
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
                <button style={s.btnPrimary} onClick={handleAddLote}>Adicionar Lote</button>
              </div>
              <button style={{...s.btnSecondary,width:"100%",marginTop:12}} onClick={()=>setModal(null)}>Fechar</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
