import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://oxbqksqnxohfygprdxck.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YnFrc3FueG9oZnlncHJkeGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjkwMzUsImV4cCI6MjA5NDIwNTAzNX0.G9aVYlNJQkB64ztv1irdVc-AQBlmD5uqC1q-j_dUypg"
);

const PATIENT_ID = "00000000-0000-0000-0000-000000000002";
const CATS = ["Assepsia","Curativos","EPIs","Equipamentos","Higiene","Limpeza","Materiais","Medicamentos","Outros"];
const UNS = ["Unid","Fr","Amp","Comp","Pc","Par","ml","g","Rl","Bs","Ser","Tb","Fa","Alm","Bis","Pct"];
const EMB = ["Cx","Pct","Caixa","Balde","Fardo","Kit"];

const today = new Date();
const diffDays = (a,b)=>Math.ceil((new Date(a)-new Date(b))/86400000);
const media = arr=>arr&&arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):0;
const fmt = d=>d.toLocaleDateString("pt-BR");
const fmtT = d=>d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

const hasConv = i=>!!(i&&i.itens_por_embalagem>1&&i.unidade_compra);
const lblEst = i=>{
  if(!hasConv(i)) return i.estoque+" "+(i.unidade||"un");
  const c=Math.floor(i.estoque/i.itens_por_embalagem), r=i.estoque%i.itens_por_embalagem;
  if(c===0) return i.estoque+" un";
  if(r===0) return c+" "+i.unidade_compra+" ("+i.estoque+" un)";
  return c+" "+i.unidade_compra+" + "+r+" un";
};

const C={
  bg:"#F7F9FC",surface:"#FFFFFF",surfaceAlt:"#EEF2F8",
  border:"#DDE3EE",text:"#1A202C",textSub:"#64748B",textMuted:"#94A3B8",
  primary:"#2563EB",primaryLight:"#EFF6FF",primaryMid:"#BFDBFE",
  green:"#16A34A",greenLight:"#F0FDF4",greenMid:"#BBF7D0",
  red:"#DC2626",redLight:"#FEF2F2",redMid:"#FECACA",
  orange:"#EA580C",orangeLight:"#FFF7ED",orangeMid:"#FED7AA",
  yellow:"#CA8A04",yellowLight:"#FEFCE8",yellowMid:"#FEF08A",
  purple:"#7C3AED",teal:"#0D9488",tealLight:"#F0FDFA",tealMid:"#99F6E4",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",shadowMd:"0 4px 12px rgba(0,0,0,0.10)",
};
const pill=(bg,color,border)=>({background:bg,color:color,border:"1px solid "+(border||bg),borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"});
const pct=(e,m)=>Math.min(100,m>0?(e/(m*2))*100:100);
const pcolor=(e,m)=>{const p=m>0?e/(m*2):1;if(p<=0)return C.red;if(p<=0.5)return C.orange;if(p<=0.75)return C.yellow;return C.green;};

function SBadge({e,m}){
  if(e===0)return <span style={pill(C.redLight,C.red,C.redMid)}>Esgotado</span>;
  if(e<=m)return <span style={pill(C.orangeLight,C.orange,C.orangeMid)}>Critico</span>;
  if(e<=m*1.5)return <span style={pill(C.yellowLight,C.yellow,C.yellowMid)}>Atencao</span>;
  return <span style={pill(C.greenLight,C.green,C.greenMid)}>OK</span>;
}
function VBadge({vals}){
  if(!vals||!vals.length)return null;
  const p=vals.reduce((a,b)=>new Date(a.validade)<new Date(b.validade)?a:b);
  const d=diffDays(p.validade,today);
  if(d<0)return <span style={pill(C.redLight,C.red,C.redMid)}>Vencido</span>;
  if(d<=30)return <span style={pill(C.orangeLight,C.orange,C.orangeMid)}>Vence {d}d</span>;
  if(d<=90)return <span style={pill(C.yellowLight,C.yellow,C.yellowMid)}>Vence {d}d</span>;
  return null;
}

function EntradaModal({ins,onSave,onClose}){
  const [tipo,setTipo]=useState(hasConv(ins)?"emb":"un");
  const [qtd,setQtd]=useState("");
  const [obs,setObs]=useState("");
  const calc=tipo==="emb"?Math.round((parseFloat(qtd)||0)*(ins.itens_por_embalagem||1)):(parseInt(qtd)||0);
  const inp={width:"100%",background:C.bg,border:"1px solid "+C.border,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const lbl={fontSize:12,color:C.textSub,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"20px 20px 36px",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
        <p style={{fontSize:18,fontWeight:900,color:C.text,marginBottom:4}}>Entrada de Estoque</p>
        <p style={{fontSize:13,color:C.textSub,marginBottom:16,fontWeight:600}}>{ins.nome}</p>
        <div style={{background:C.primaryLight,border:"1px solid "+C.primaryMid,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
          <p style={{fontSize:12,fontWeight:800,color:C.primary,margin:"0 0 4px"}}>ESTOQUE ATUAL</p>
          <p style={{fontSize:20,fontWeight:900,color:C.primary,margin:0}}>{ins.estoque} unidades</p>
          {hasConv(ins)&&<p style={{fontSize:13,color:C.primary,margin:"3px 0 0",fontWeight:700}}>= {(ins.estoque/ins.itens_por_embalagem).toFixed(1)} {ins.unidade_compra} ({ins.itens_por_embalagem} un por {ins.unidade_compra})</p>}
        </div>
        {hasConv(ins)&&(
          <div style={{marginBottom:16}}>
            <label style={lbl}>Informar por</label>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setTipo("emb")} style={{flex:1,padding:"10px",borderRadius:10,border:"2px solid "+(tipo==="emb"?C.teal:C.border),background:tipo==="emb"?C.tealLight:C.surface,color:tipo==="emb"?C.teal:C.text,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{ins.unidade_compra}</button>
              <button onClick={()=>setTipo("un")} style={{flex:1,padding:"10px",borderRadius:10,border:"2px solid "+(tipo==="un"?C.teal:C.border),background:tipo==="un"?C.tealLight:C.surface,color:tipo==="un"?C.teal:C.text,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Unidades avulsas</button>
            </div>
          </div>
        )}
        <label style={lbl}>Quantidade {tipo==="emb"?("de "+ins.unidade_compra+"s"):"de unidades"}</label>
        <input style={inp} type="number" min="0.5" step={tipo==="emb"?"0.5":"1"} placeholder={tipo==="emb"?"Ex: 2":"Ex: 60"} value={qtd} onChange={e=>setQtd(e.target.value)}/>
        {qtd&&parseFloat(qtd)>0&&(
          <div style={{background:C.greenLight,border:"1px solid "+C.greenMid,borderRadius:12,padding:"12px 14px",marginTop:12}}>
            <p style={{fontSize:12,fontWeight:800,color:C.green,margin:"0 0 6px"}}>RESUMO</p>
            <p style={{fontSize:15,fontWeight:700,color:C.green,margin:0}}>{tipo==="emb"?(qtd+" "+ins.unidade_compra+" = "+calc+" unidades"):(calc+" unidades")}</p>
            <p style={{fontSize:12,color:C.green,margin:"4px 0 0",opacity:0.8}}>Novo estoque: {ins.estoque+calc} un{hasConv(ins)?(" = "+((ins.estoque+calc)/ins.itens_por_embalagem).toFixed(1)+" "+ins.unidade_compra):""}</p>
          </div>
        )}
        <label style={{...lbl,marginTop:14}}>Observacao (opcional)</label>
        <input style={inp} placeholder="Ex: Recebido do hospital" value={obs} onChange={e=>setObs(e.target.value)}/>
        <div style={{display:"flex",gap:8,marginTop:20}}>
          <button onClick={()=>{if(calc>0)onSave(calc,obs,tipo==="emb"?parseFloat(qtd):null);}} style={{flex:1,background:C.green,color:"#fff",border:"none",borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Confirmar Entrada</button>
          <button onClick={onClose} style={{background:C.surface,color:C.text,border:"1px solid "+C.border,borderRadius:10,padding:"12px 16px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [name,setName]=useState("");
  const [reg,setReg]=useState(false);
  const [forgot,setForgot]=useState(false);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const handle=async()=>{
    setLoading(true);setMsg("");
    try{
      if(forgot){
        const r=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
        if(r.error)throw r.error;
        setMsg("E-mail de recuperacao enviado! Verifique sua caixa de entrada.");
        setForgot(false);
      }else if(reg){
        const r=await supabase.auth.signUp({email:email,password:pw});
        if(r.error)throw r.error;
        if(r.data.user){
          await supabase.from("profiles").insert({id:r.data.user.id,name:name,email:email,role:"caregiver"});
          await supabase.from("patient_caregivers").insert({patient_id:PATIENT_ID,profile_id:r.data.user.id});
        }
        setMsg("Conta criada! Verifique seu e-mail.");
      }else{
        const r=await supabase.auth.signInWithPassword({email:email,password:pw});
        if(r.error)throw r.error;
        onLogin();
      }
    }catch(e){setMsg(e.message||"Erro");}
    setLoading(false);
  };
  const inp={width:"100%",background:C.bg,border:"1px solid "+C.border,borderRadius:10,padding:"12px 14px",fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14,color:C.text};
  const lbl={fontSize:12,fontWeight:700,color:C.textSub,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4};
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1D4ED8,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Nunito, Segoe UI, sans-serif"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <p style={{fontSize:26,fontWeight:900,color:C.primary,margin:"0 0 4px"}}>CroniCare Control</p>
        <p style={{fontSize:13,color:C.textSub,marginBottom:28}}>{forgot?"Recuperar senha":reg?"Criar conta":"Entrar"}</p>
        {forgot&&<div style={{background:C.primaryLight,border:"1px solid "+C.primaryMid,borderRadius:12,padding:"12px 14px",marginBottom:16}}><p style={{fontSize:13,color:C.primary,margin:0,fontWeight:600}}>Digite seu e-mail e enviaremos um link para redefinir sua senha.</p></div>}
        {reg&&!forgot&&<div><label style={lbl}>Nome</label><input style={inp} placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)}/></div>}
        <label style={lbl}>E-mail</label>
        <input style={inp} type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        {!forgot&&<div><label style={lbl}>Senha</label><input style={inp} type="password" placeholder="Senha" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handle();}}/></div>}
        <button onClick={handle} disabled={loading} style={{width:"100%",background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"13px",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>{loading?"Aguarde...":(forgot?"Enviar Link de Recuperacao":reg?"Criar Conta":"Entrar")}</button>
        {msg&&<p style={{fontSize:13,color:msg.indexOf("criada")>=0||msg.indexOf("enviado")>=0?C.green:C.red,marginTop:12,textAlign:"center",fontWeight:600}}>{msg}</p>}
        {!forgot&&<p style={{fontSize:13,color:C.primary,textAlign:"center",marginTop:16,cursor:"pointer",fontWeight:700}} onClick={()=>{setReg(!reg);setMsg("");}}>{reg?"Ja tenho conta - Entrar":"Nao tenho conta - Criar conta"}</p>}
        <p style={{fontSize:13,color:forgot?C.textSub:C.orange,textAlign:"center",marginTop:8,cursor:"pointer",fontWeight:600}} onClick={()=>{setForgot(!forgot);setMsg("");}}>{forgot?"Voltar para o login":"Esqueci minha senha"}</p>
      </div>
    </div>
  );
}

export default function App(){
  const [session,setSession]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [insumos,setInsumos]=useState([]);
  const [historico,setHistorico]=useState([]);
  const [loading,setLoading]=useState(false);
  const [aba,setAba]=useState("estoque");
  const [busca,setBusca]=useState("");
  const [cat,setCat]=useState("Todas");
  const [modal,setModal]=useState(null);
  const [sel,setSel]=useState(null);
  const [form,setForm]=useState({});
  const [baixaQtd,setBaixaQtd]=useState(1);
  const [toast,setToast]=useState(null);
  const [emailH,setEmailH]=useState("");
  const [emailCfg,setEmailCfg]=useState(false);
  const [solic,setSolic]=useState([]);
  const [motivoS,setMotivoS]=useState("urgencia");
  const [obsS,setObsS]=useState("");
  const [buscaS,setBuscaS]=useState("");
  const [entModal,setEntModal]=useState(null);
  const [kits,setKits]=useState([]);
  const [kitLogs,setKitLogs]=useState([]);
  const [kitModal,setKitModal]=useState(null); // null | "novo" | "editar" | "aplicar"
  const [kitSel,setKitSel]=useState(null);
  const [kitForm,setKitForm]=useState({nome:"",descricao:"",itens:[]});
  const [kitBusca,setKitBusca]=useState("");

  const showToast=(msg,tipo)=>{setToast({msg:msg,tipo:tipo||"ok"});setTimeout(()=>setToast(null),3200);};

  useEffect(()=>{
    supabase.auth.getSession().then(r=>{setSession(r.data.session);setAuthLoading(false);});
    const sub=supabase.auth.onAuthStateChange((_,s)=>{setSession(s);setAuthLoading(false);});
    return ()=>sub.data.subscription.unsubscribe();
  },[]);

  useEffect(()=>{if(session)loadAll();},[session]);

  const loadAll=async()=>{
    setLoading(true);
    const r1=await supabase.from("supplies").select("*, supply_lots(*)").eq("patient_id",PATIENT_ID).eq("active",true).order("nome");
    const r2=await supabase.from("stock_movements").select("*, profiles(name)").eq("patient_id",PATIENT_ID).order("created_at",{ascending:false}).limit(50);
    const r3=await supabase.from("kits").select("*, kit_items(*, supplies(*))").eq("patient_id",PATIENT_ID).eq("active",true).order("nome");
    const r4=await supabase.from("kit_logs").select("*, kits(nome), profiles(name)").eq("patient_id",PATIENT_ID).order("created_at",{ascending:false}).limit(50);
    if(r1.data)setInsumos(r1.data.map(i=>({...i,validades:i.supply_lots||[]})));
    if(r2.data)setHistorico(r2.data);
    if(r3.data)setKits(r3.data);
    if(r4.data)setKitLogs(r4.data);
    setLoading(false);
  };

  useEffect(()=>{
    if(!session)return;
    const ch=supabase.channel("rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"supplies",filter:"patient_id=eq."+PATIENT_ID},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"stock_movements",filter:"patient_id=eq."+PATIENT_ID},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"kits",filter:"patient_id=eq."+PATIENT_ID},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"kit_items"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"kit_logs",filter:"patient_id=eq."+PATIENT_ID},()=>loadAll())
      .subscribe();
    return ()=>{supabase.removeChannel(ch);};
  },[session]);

  const handleEntrada=async(unidades,obs,emb)=>{
    await supabase.from("supplies").update({estoque:entModal.estoque+unidades}).eq("id",entModal.id);
    const obsTxt=emb?("Entrada: "+emb+" "+entModal.unidade_compra+" = "+unidades+" un"+(obs?(". "+obs):"")):("Entrada: "+unidades+" un"+(obs?(". "+obs):""));
    await supabase.from("stock_movements").insert({supply_id:entModal.id,patient_id:PATIENT_ID,profile_id:session.user.id,tipo:"entrada",quantidade:unidades,observacao:obsTxt});
    showToast("+"+unidades+" unidades adicionadas!");
    setEntModal(null);
  };

  const handleBaixa=async()=>{
    const q=parseInt(baixaQtd);
    if(isNaN(q)||q<=0)return showToast("Quantidade invalida","erro");
    if(q>sel.estoque)return showToast("Estoque insuficiente","erro");
    const c=(sel.consumo_mensal||[0,0,0,0]).slice();
    c[c.length-1]=(c[c.length-1]||0)+q;
    await supabase.from("supplies").update({estoque:sel.estoque-q,consumo_mensal:c}).eq("id",sel.id);
    await supabase.from("stock_movements").insert({supply_id:sel.id,patient_id:PATIENT_ID,profile_id:session.user.id,tipo:"baixa",quantidade:q});
    showToast("Baixa de "+q+" un registrada!");
    setModal(null);setBaixaQtd(1);
  };

  const handleSalvar=async()=>{
    if(!form.nome||!form.categoria)return showToast("Preencha nome e categoria","erro");
    const ipe=parseInt(form.itens_por_embalagem)||1;
    const tc=!!(form.unidade_compra&&form.unidade_compra!==""&&ipe>1);
    const payload={
      patient_id:PATIENT_ID,codigo:form.codigo||"",nome:form.nome,
      categoria:form.categoria,unidade:form.unidade||"Unid",
      estoque:parseInt(form.estoque)||0,minimo:parseInt(form.minimo)||5,
      unidade_compra:tc?form.unidade_compra:null,
      itens_por_embalagem:tc?ipe:1
    };
    if(modal==="novo"){
      await supabase.from("supplies").insert({...payload,consumo_mensal:[0,0,0,0]});
      showToast("Insumo cadastrado!");
    }else{
      await supabase.from("supplies").update(payload).eq("id",sel.id);
      showToast("Insumo atualizado!");
    }
    setModal(null);setForm({});
  };

  const handleLote=async()=>{
    if(!form.novoLote||!form.novaValidade)return showToast("Preencha lote e validade","erro");
    await supabase.from("supply_lots").insert({supply_id:sel.id,lote:form.novoLote,validade:form.novaValidade,quantidade:parseInt(form.novaQtd)||1});
    showToast("Lote adicionado!");setForm({});
  };

  const openM=(t,i)=>{
    setSel(i||null);
    setForm(i?{...i,itens_por_embalagem:i.itens_por_embalagem||1}:{categoria:"Materiais",unidade:"Unid",itens_por_embalagem:1});
    setBaixaQtd(1);setModal(t);
  };
  const togS=(i)=>setSolic(p=>{const e=p.find(x=>x.id===i.id);if(e)return p.filter(x=>x.id!==i.id);return p.concat([{...i,qtdS:Math.max(1,i.minimo-i.estoque)}]);});
  const updS=(id,q)=>setSolic(p=>p.map(i=>i.id===id?{...i,qtdS:parseInt(q)||1}:i));

  const handleSalvarKit=async()=>{
    if(!kitForm.nome)return showToast("Informe o nome do kit","erro");
    if(!kitForm.itens||kitForm.itens.length===0)return showToast("Adicione pelo menos um insumo","erro");
    if(kitModal==="novo"){
      const r=await supabase.from("kits").insert({patient_id:PATIENT_ID,nome:kitForm.nome,descricao:kitForm.descricao||""}).select().single();
      if(r.error){console.error(r.error);return showToast("Erro ao salvar kit","erro");}
      const items=kitForm.itens.map(i=>({kit_id:r.data.id,supply_id:i.supply_id,quantidade:i.quantidade}));
      const r2=await supabase.from("kit_items").insert(items);
      if(r2.error){console.error(r2.error);return showToast("Erro ao salvar itens","erro");}
      showToast("Kit cadastrado!");
    }else{
      await supabase.from("kits").update({nome:kitForm.nome,descricao:kitForm.descricao||""}).eq("id",kitSel.id);
      await supabase.from("kit_items").delete().eq("kit_id",kitSel.id);
      const items=kitForm.itens.map(i=>({kit_id:kitSel.id,supply_id:i.supply_id,quantidade:i.quantidade}));
      await supabase.from("kit_items").insert(items);
      showToast("Kit atualizado!");
    }
    setKitModal(null);
    setKitForm({nome:"",descricao:"",itens:[]});
    setKitSel(null);
    await loadAll();
  };

  const handleAplicarKit=async(kit,obs)=>{
    // Verificar estoque de todos os itens
    const semEstoque=kit.kit_items.filter(ki=>{
      const ins=insumos.find(i=>i.id===ki.supply_id);
      return !ins||ins.estoque<ki.quantidade;
    });
    if(semEstoque.length>0){
      const nomes=semEstoque.map(ki=>ki.supplies?.nome||"item").join(", ");
      return showToast("Estoque insuficiente: "+nomes,"erro");
    }
    // Dar baixa em todos os itens
    for(const ki of kit.kit_items){
      const ins=insumos.find(i=>i.id===ki.supply_id);
      if(!ins)continue;
      const c=(ins.consumo_mensal||[0,0,0,0]).slice();
      c[c.length-1]=(c[c.length-1]||0)+ki.quantidade;
      await supabase.from("supplies").update({estoque:ins.estoque-ki.quantidade,consumo_mensal:c}).eq("id",ins.id);
      await supabase.from("stock_movements").insert({supply_id:ins.id,patient_id:PATIENT_ID,profile_id:session.user.id,tipo:"baixa",quantidade:ki.quantidade,observacao:"Kit: "+kit.nome});
    }
    await supabase.from("kit_logs").insert({kit_id:kit.id,patient_id:PATIENT_ID,profile_id:session.user.id,observacao:obs||""});
    showToast("Kit aplicado! Baixa em "+kit.kit_items.length+" insumo(s).");
    setKitModal(null);setKitSel(null);await loadAll();
  };

  const handleExcluirKit=async(kit)=>{
    await supabase.from("kits").update({active:false}).eq("id",kit.id);
    showToast("Kit removido.");await loadAll();
  };

  const enviarSolic=()=>{
    if(!emailH)return showToast("Configure o e-mail","erro");
    if(solic.length===0)return showToast("Selecione um item","erro");
    const m={urgencia:"Solicitacao Urgente",reposicao:"Solicitacao de Reposicao",complementar:"Solicitacao Complementar"};
    const assunto=encodeURIComponent("[CroniCare] "+m[motivoS]+" - Leonardo Bertolozzi Monteiro");
    const itens=solic.map((i,idx)=>(idx+1)+". "+i.nome+(i.codigo?(" ("+i.codigo+")"):"")+"\n   Estoque: "+lblEst(i)+" | Solicitar: "+i.qtdS+" "+(hasConv(i)?i.unidade_compra:"un")).join("\n\n");
    const corpo="Prezada equipe,\n\nSolicito os insumos abaixo para o paciente Leonardo Bertolozzi Monteiro.\n\nTipo: "+m[motivoS].toUpperCase()+"\nData: "+fmt(new Date())+" as "+fmtT(new Date())+"\n\n============================\n"+itens+"\n============================\n"+(obsS?("\nObservacoes: "+obsS+"\n"):"")+"\nCroniCare Control";
    window.open("mailto:"+emailH+"?subject="+assunto+"&body="+encodeURIComponent(corpo),"_blank");
    showToast("E-mail preparado!");
  };

  const exportPDF=()=>{
    const lista=sug.filter(i=>Math.max(0,i.sug-i.estoque)>0);
    const rows=lista.map(i=>{
      const pu=Math.max(0,i.sug-i.estoque);
      const pc=hasConv(i)?Math.ceil(pu/i.itens_por_embalagem):null;
      const ps=pc?(pc+" "+i.unidade_compra+" ("+pu+" un)"):(pu+" un");
      return "<tr><td>"+i.nome+"</td><td style='text-align:center'>"+(i.codigo||"-")+"</td><td style='text-align:center'>"+lblEst(i)+"</td><td style='text-align:center;font-weight:bold;color:#2563EB'>"+ps+"</td></tr>";
    }).join("");
    const html="<!DOCTYPE html><html><head><meta charset='utf-8'><title>Pedido</title><style>body{font-family:sans-serif;margin:32px}h1{color:#2563EB}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th{background:#EFF6FF;color:#2563EB;padding:8px;text-align:left}td{padding:6px 8px;border-bottom:1px solid #eee}</style></head><body><h1>Lista de Pedido - CroniCare Control</h1><p>Gerado em "+fmt(new Date())+" - Leonardo Bertolozzi Monteiro</p><table><thead><tr><th>Insumo</th><th>Codigo</th><th>Estoque Atual</th><th>Sugestao de Pedido</th></tr></thead><tbody>"+rows+"</tbody></table></body></html>";
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([html],{type:"text/html"}));
    a.download="pedido_"+fmt(new Date()).split("/").join("-")+".html";
    a.click();
    showToast("Lista exportada!");
  };

  const filt=useMemo(()=>insumos.filter(i=>{
    const ok=i.nome.toLowerCase().indexOf(busca.toLowerCase())>=0||i.categoria.toLowerCase().indexOf(busca.toLowerCase())>=0||(i.codigo&&i.codigo.indexOf(busca)>=0);
    return ok&&(cat==="Todas"||i.categoria===cat);
  }),[insumos,busca,cat]);

  const alerts=useMemo(()=>{
    const r=[];
    insumos.forEach(i=>{
      if(i.estoque<=i.minimo)r.push({t:"est",i:i});
      (i.validades||[]).forEach(v=>{const d=diffDays(v.validade,today);if(d<=30)r.push({t:"val",i:i,d:d});});
    });
    return r;
  },[insumos]);

  const sug=useMemo(()=>insumos.map(i=>({...i,mc:media(i.consumo_mensal),sug:Math.ceil(media(i.consumo_mensal)*1.2)})),[insumos]);

  const s={
    app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Nunito, Segoe UI, sans-serif",maxWidth:480,margin:"0 auto"},
    hdr:{background:"linear-gradient(135deg,#1D4ED8,#3B82F6)",padding:"20px 20px 14px",boxShadow:C.shadowMd},
    nav:{display:"flex",background:C.surface,borderBottom:"1px solid "+C.border,overflowX:"auto"},
    nb:(a)=>({flex:"none",padding:"10px 12px",fontSize:11,fontWeight:700,border:"none",background:"none",color:a?C.primary:C.textMuted,borderBottom:a?("2px solid "+C.primary):"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}),
    con:{padding:16},
    card:{background:C.surface,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:C.shadow},
    inp:{width:"100%",background:C.bg,border:"1px solid "+C.border,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"},
    inpEl:{flex:1,background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"},
    selEl:{background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"},
    btnP:{background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnD:{background:C.red,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    btnS:{background:C.surface,color:C.text,border:"1px solid "+C.border,borderRadius:10,padding:"11px 20px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
    sm:(bg)=>({background:bg,color:"#fff",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}),
    fab:{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:C.primary,color:"#fff",fontSize:28,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(37,99,235,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100},
    ov:{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:200,display:"flex",alignItems:"flex-end"},
    mb:{background:C.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"20px 20px 36px",maxHeight:"92vh",overflowY:"auto"},
    lbl:{fontSize:12,color:C.textSub,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4},
    r2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
    st:{fontSize:11,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10},
    sg:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16},
    sc:(c)=>({background:c+"12",border:"1.5px solid "+c+"30",borderRadius:14,padding:14,textAlign:"center"}),
  };

  if(authLoading)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.primary,color:"#fff",fontSize:18,fontWeight:700,fontFamily:"Nunito, sans-serif"}}>CroniCare Control...</div>;
  if(!session)return <Login onLogin={()=>supabase.auth.getSession().then(r=>setSession(r.data.session))}/>;

  return (
    <div style={s.app}>
      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:toast.tipo==="erro"?C.red:C.green,color:"#fff",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,boxShadow:C.shadowMd,whiteSpace:"nowrap"}}>{toast.msg}</div>}

      <div style={s.hdr}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontSize:20,fontWeight:900,color:"#fff",margin:0}}>CroniCare Control</p>
            <p style={{fontSize:12,color:"#BFDBFE",margin:"3px 0 0"}}>Leonardo - {insumos.length} insumos - Sincronizado</p>
          </div>
          <div style={{display:"flex",gap:8}}>
            {alerts.length>0&&<div style={{background:C.red,color:"#fff",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,cursor:"pointer"}} onClick={()=>setAba("alertas")}>! {alerts.length}</div>}
            <button onClick={()=>supabase.auth.signOut()} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Sair</button>
          </div>
        </div>
      </div>

      <nav style={s.nav}>
        {[["estoque","Estoque"],["alertas","Alertas"],["kits","Kits"],["sugestoes","Pedido"],["solicitar","Solicitar"],["relatorios","Relatorios"]].map(p=>(
          <button key={p[0]} style={s.nb(aba===p[0])} onClick={()=>setAba(p[0])}>{p[1]}{p[0]==="alertas"&&alerts.length>0?(" ("+alerts.length+")"):""}</button>
        ))}
      </nav>

      <div style={s.con}>
        {loading&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontWeight:700}}>Carregando...</div>}

        {!loading&&aba==="estoque"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input style={s.inpEl} placeholder="Buscar..." value={busca} onChange={e=>setBusca(e.target.value)}/>
            <select style={s.selEl} value={cat} onChange={e=>setCat(e.target.value)}><option>Todas</option>{CATS.map(c=><option key={c}>{c}</option>)}</select>
          </div>
          <p style={{fontSize:12,color:C.textMuted,marginBottom:12,fontWeight:600}}>{filt.length} de {insumos.length} insumos</p>
          {filt.map(i=>(
            <div key={i.id} style={s.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,marginRight:8}}>
                  <p style={{fontSize:14,fontWeight:800,color:C.text,margin:0,lineHeight:1.3}}>{i.nome}</p>
                  <p style={{fontSize:11,color:C.textMuted,margin:"3px 0 0",fontWeight:600}}>{i.categoria}{i.codigo?(" - #"+i.codigo):""}</p>
                  {hasConv(i)&&<p style={{fontSize:11,color:C.teal,margin:"2px 0 0",fontWeight:700}}>Embalagem: {i.itens_por_embalagem} un/{i.unidade_compra}</p>}
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <SBadge e={i.estoque} m={i.minimo}/><VBadge vals={i.validades}/>
                </div>
              </div>
              <div style={{background:C.surfaceAlt,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <p style={{fontSize:11,color:C.textMuted,fontWeight:700,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:0.5}}>Estoque</p>
                    <p style={{fontSize:22,fontWeight:900,color:C.primary,margin:0,lineHeight:1}}>{i.estoque} <span style={{fontSize:13,fontWeight:600,color:C.textSub}}>un</span></p>
                    {hasConv(i)&&<p style={{fontSize:13,color:C.teal,margin:"3px 0 0",fontWeight:700}}>{(i.estoque/i.itens_por_embalagem).toFixed(1)} {i.unidade_compra}</p>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:11,color:C.textMuted,fontWeight:700,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:0.5}}>Minimo</p>
                    <p style={{fontSize:16,fontWeight:700,color:C.textSub,margin:0}}>{i.minimo} un</p>
                  </div>
                </div>
                <div style={{height:6,background:C.border,borderRadius:4,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:pct(i.estoque,i.minimo)+"%",background:pcolor(i.estoque,i.minimo),borderRadius:4}}/></div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <button style={s.sm(C.green)} onClick={()=>setEntModal(i)}>+ Entrada</button>
                <button style={s.sm(C.red)} onClick={()=>openM("baixa",i)}>- Baixa</button>
                <button style={s.sm(C.primary)} onClick={()=>openM("editar",i)}>Editar</button>
                <button style={s.sm(C.purple)} onClick={()=>openM("validade",i)}>Validade</button>
              </div>
            </div>
          ))}
          <div style={{height:80}}/>
        </div>}

        {!loading&&aba==="alertas"&&<div>
          <div style={s.sg}>
            <div style={s.sc(C.red)}><div style={{fontSize:30,fontWeight:900,color:C.red}}>{insumos.filter(i=>i.estoque===0).length}</div><div style={{fontSize:12,color:C.textSub,marginTop:2,fontWeight:700}}>Esgotados</div></div>
            <div style={s.sc(C.orange)}><div style={{fontSize:30,fontWeight:900,color:C.orange}}>{insumos.filter(i=>i.estoque>0&&i.estoque<=i.minimo).length}</div><div style={{fontSize:12,color:C.textSub,marginTop:2,fontWeight:700}}>Criticos</div></div>
            <div style={s.sc(C.yellow)}><div style={{fontSize:30,fontWeight:900,color:C.yellow}}>{insumos.filter(i=>(i.validades||[]).some(v=>diffDays(v.validade,today)<=30)).length}</div><div style={{fontSize:12,color:C.textSub,marginTop:2,fontWeight:700}}>Vencem 30d</div></div>
            <div style={s.sc(C.green)}><div style={{fontSize:30,fontWeight:900,color:C.green}}>{insumos.filter(i=>i.estoque>i.minimo).length}</div><div style={{fontSize:12,color:C.textSub,marginTop:2,fontWeight:700}}>Em Dia</div></div>
          </div>
          {alerts.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:C.green,fontSize:16,fontWeight:700,background:C.greenLight,borderRadius:14}}>Nenhum alerta!</div>}
          {alerts.filter(a=>a.t==="est").length>0&&<div>
            <p style={s.st}>Estoque Baixo</p>
            {alerts.filter(a=>a.t==="est").map((a,idx)=>(
              <div key={idx} style={{...s.card,borderLeft:"4px solid "+(a.i.estoque===0?C.red:C.orange)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}><p style={{fontSize:13,fontWeight:800,margin:0}}>{a.i.nome}</p><p style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{a.i.categoria}</p></div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:18,fontWeight:900,color:a.i.estoque===0?C.red:C.orange,margin:0}}>{a.i.estoque} un</p>
                    <p style={{fontSize:11,color:C.textMuted,margin:0}}>Min: {a.i.minimo}</p>
                  </div>
                </div>
                <button style={{...s.sm(C.green),marginTop:8}} onClick={()=>setEntModal(a.i)}>+ Dar Entrada</button>
              </div>
            ))}
          </div>}
          {alerts.filter(a=>a.t==="val").length>0&&<div>
            <p style={{...s.st,marginTop:16}}>Validade Proxima</p>
            {alerts.filter(a=>a.t==="val").map((a,idx)=>(
              <div key={idx} style={{...s.card,borderLeft:"4px solid "+C.purple}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontSize:13,fontWeight:800,margin:0,flex:1,marginRight:8}}>{a.i.nome}</p>
                  <span style={pill(a.d<0?C.redLight:C.orangeLight,a.d<0?C.red:C.orange)}>{a.d<0?"Vencido":(a.d+" dias")}</span>
                </div>
              </div>
            ))}
          </div>}
        </div>}

        {!loading&&aba==="sugestoes"&&<div>
          <div style={{...s.card,background:C.primaryLight,borderColor:C.primaryMid,marginBottom:16}}>
            <p style={{fontSize:13,color:C.primary,margin:0,fontWeight:600}}>Sugestao baseada no consumo medio + 20%. Pedido em unidade de compra quando aplicavel.</p>
          </div>
          <button style={{...s.btnP,width:"100%",marginBottom:16}} onClick={exportPDF}>Exportar Lista de Pedido</button>
          {sug.filter(i=>Math.max(0,i.sug-i.estoque)>0).map(i=>{
            const pu=Math.max(0,i.sug-i.estoque);
            const pc=hasConv(i)?Math.ceil(pu/i.itens_por_embalagem):null;
            return (
              <div key={i.id} style={s.card}>
                <div style={{fontSize:14,fontWeight:800,marginBottom:8}}>{i.nome}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSub,marginBottom:3}}><span>Consumo medio/mes</span><span style={{color:C.primary,fontWeight:700}}>{i.mc} un</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSub,marginBottom:8}}><span>Estoque atual</span><span style={{fontWeight:600}}>{lblEst(i)}</span></div>
                <div style={{background:C.primaryLight,borderRadius:10,padding:"8px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:800,color:C.primary}}>Pedir</span>
                    <div style={{textAlign:"right"}}>
                      {pc&&<p style={{fontSize:16,fontWeight:900,color:C.primary,margin:0}}>{pc} {i.unidade_compra}</p>}
                      <p style={{fontSize:12,color:C.primary,margin:0,opacity:0.8}}>{pu} unidades</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}

        {!loading&&aba==="solicitar"&&<div>
          <div style={{...s.card,background:emailCfg?C.surface:C.primaryLight,borderColor:C.primaryMid,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:emailCfg?10:0}}>
              <p style={{fontSize:14,fontWeight:800,color:C.primary,margin:0}}>E-mail do Hospital</p>
              <button style={s.sm(C.primary)} onClick={()=>setEmailCfg(!emailCfg)}>{emailCfg?"Fechar":"Configurar"}</button>
            </div>
            {emailCfg&&<div><label style={{...s.lbl,marginTop:10}}>E-mail</label><input style={s.inp} type="email" value={emailH} onChange={e=>setEmailH(e.target.value)} placeholder="insumos@hospital.com.br"/></div>}
            {!emailCfg&&(emailH?<p style={{fontSize:12,color:C.primary,margin:"6px 0 0",fontWeight:700}}>{emailH}</p>:<p style={{fontSize:12,color:C.orange,margin:"6px 0 0",fontWeight:700}}>Configure o e-mail do hospital</p>)}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[["urgencia","Urgente","Item esgotado"],["reposicao","Reposicao","Fora da programacao"],["complementar","Complementar","Item adicional"]].map(p=>(
              <div key={p[0]} onClick={()=>setMotivoS(p[0])} style={{...s.card,borderColor:motivoS===p[0]?C.primary:C.border,borderWidth:motivoS===p[0]?2:1,cursor:"pointer",background:motivoS===p[0]?C.primaryLight:C.surface,padding:"12px 14px",marginBottom:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid "+(motivoS===p[0]?C.primary:C.border),background:motivoS===p[0]?C.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{motivoS===p[0]&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}</div>
                  <div><p style={{fontSize:14,fontWeight:800,margin:0,color:motivoS===p[0]?C.primary:C.text}}>{p[1]}</p><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0"}}>{p[2]}</p></div>
                </div>
              </div>
            ))}
          </div>
          {insumos.filter(i=>i.estoque<=i.minimo).length>0&&<button style={{...s.btnP,width:"100%",marginBottom:12,background:C.orange}} onClick={()=>{const cr=insumos.filter(i=>i.estoque<=i.minimo);const nv=cr.filter(c=>!solic.find(x=>x.id===c.id));setSolic(p=>p.concat(nv.map(i=>({...i,qtdS:Math.max(1,i.minimo-i.estoque+Math.ceil(i.minimo*0.2))}))));showToast(nv.length+" itens adicionados!");}}>Adicionar {insumos.filter(i=>i.estoque<=i.minimo).length} critico(s)</button>}
          <input style={{...s.inpEl,width:"100%",marginBottom:10,boxSizing:"border-box"}} placeholder="Buscar..." value={buscaS} onChange={e=>setBuscaS(e.target.value)}/>
          {solic.map(i=>(
            <div key={i.id} style={{...s.card,borderColor:C.greenMid,borderWidth:2,background:C.greenLight,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,marginRight:8}}><p style={{fontSize:13,fontWeight:800,margin:0}}>{i.nome}</p><p style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{lblEst(i)}</p></div>
                <button style={s.sm(C.red)} onClick={()=>togS(i)}>X</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                <label style={{...s.lbl,margin:0,whiteSpace:"nowrap"}}>Qtd {hasConv(i)?i.unidade_compra:"un"}:</label>
                <input type="number" min="1" value={i.qtdS} onChange={e=>updS(i.id,e.target.value)} style={{...s.inp,padding:"6px 10px",fontSize:14,fontWeight:700,maxWidth:80}}/>
                {hasConv(i)&&<span style={{fontSize:11,color:C.teal,fontWeight:600}}>= {i.qtdS*i.itens_por_embalagem} un</span>}
              </div>
            </div>
          ))}
          {insumos.filter(i=>!buscaS||i.nome.toLowerCase().indexOf(buscaS.toLowerCase())>=0).map(i=>{
            const sl=!!solic.find(x=>x.id===i.id);
            return (
              <div key={i.id} onClick={()=>togS(i)} style={{...s.card,cursor:"pointer",borderColor:sl?C.green:C.border,background:sl?C.greenLight:C.surface,marginBottom:8,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><p style={{fontSize:13,fontWeight:700,margin:0}}>{i.nome}</p><p style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{lblEst(i)}</p></div>
                  <div style={{width:24,height:24,borderRadius:6,border:"2px solid "+(sl?C.green:C.border),background:sl?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{sl&&<span style={{color:"#fff",fontSize:14,fontWeight:900}}>v</span>}</div>
                </div>
              </div>
            );
          })}
          <textarea value={obsS} onChange={e=>setObsS(e.target.value)} placeholder="Observacoes..." style={{...s.inp,minHeight:70,resize:"vertical",lineHeight:1.5,marginTop:12}}/>
          <button style={{...s.btnP,width:"100%",marginTop:12,padding:14,fontSize:15}} onClick={enviarSolic}>Enviar Solicitacao por E-mail</button>
          <div style={{height:32}}/>
        </div>}

        {!loading&&aba==="kits"&&<div>
          <div style={{...s.card,background:C.tealLight,borderColor:C.tealMid,marginBottom:16}}>
            <p style={{fontSize:13,color:C.teal,margin:0,fontWeight:600}}>Monte kits com os insumos usados em cada procedimento. Ao aplicar um kit, a baixa e feita em todos os itens automaticamente.</p>
          </div>
          <button style={{...s.btnP,width:"100%",marginBottom:16,background:C.teal}} onClick={()=>{setKitModal("novo");setKitSel(null);setKitForm({nome:"",descricao:"",itens:[]});}}>+ Criar Novo Kit</button>

          {kits.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:14,fontWeight:600,background:C.surfaceAlt,borderRadius:14}}>Nenhum kit cadastrado ainda.</div>}

          {kits.map(kit=>{
            const temEstoque=kit.kit_items.every(ki=>{const ins=insumos.find(i=>i.id===ki.supply_id);return ins&&ins.estoque>=ki.quantidade;});
            return (
              <div key={kit.id} style={s.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1,marginRight:8}}>
                    <p style={{fontSize:15,fontWeight:800,color:C.text,margin:0}}>{kit.nome}</p>
                    {kit.descricao&&<p style={{fontSize:12,color:C.textSub,margin:"3px 0 0"}}>{kit.descricao}</p>}
                  </div>
                  <span style={pill(temEstoque?C.greenLight:C.redLight,temEstoque?C.green:C.red)}>{temEstoque?"Pronto":"Sem estoque"}</span>
                </div>

                {/* Itens do kit */}
                <div style={{background:C.surfaceAlt,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <p style={{fontSize:11,fontWeight:800,color:C.textMuted,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:0.8}}>Itens ({kit.kit_items.length})</p>
                  {kit.kit_items.map((ki,idx)=>{
                    const ins=insumos.find(i=>i.id===ki.supply_id);
                    const ok=ins&&ins.estoque>=ki.quantidade;
                    return (
                      <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:idx<kit.kit_items.length-1?("1px solid "+C.border):"none"}}>
                        <p style={{fontSize:13,fontWeight:600,margin:0,color:ok?C.text:C.red}}>{ki.supplies?.nome||"Insumo"}</p>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,color:C.textSub,fontWeight:600}}>{ki.quantidade} un</span>
                          {ins&&<span style={{fontSize:11,color:ok?C.green:C.red,fontWeight:700}}>({ins.estoque} disp.)</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <button style={{...s.sm(temEstoque?C.teal:"#94A3B8"),fontSize:12,padding:"6px 14px"}} onClick={()=>{if(temEstoque){setKitSel(kit);setKitModal("aplicar");}else showToast("Estoque insuficiente para aplicar este kit","erro");}}>Aplicar Kit</button>
                  <button style={s.sm(C.primary)} onClick={()=>{setKitSel(kit);setKitForm({nome:kit.nome,descricao:kit.descricao||"",itens:kit.kit_items.map(ki=>({supply_id:ki.supply_id,quantidade:ki.quantidade,nome:ki.supplies?.nome||""}))});setKitModal("editar");}}>Editar</button>
                  <button style={s.sm(C.red)} onClick={()=>handleExcluirKit(kit)}>Remover</button>
                </div>
              </div>
            );
          })}

          {kitLogs.length>0&&<div style={{marginTop:8}}>
            <p style={{...s.st,marginTop:16}}>Historico de Aplicacoes</p>
            {kitLogs.slice(0,20).map((log,idx)=>(
              <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+C.border}}>
                <div style={{flex:1,marginRight:8}}>
                  <p style={{fontSize:13,fontWeight:700,margin:0}}>{log.kits?.nome||"Kit"}</p>
                  <p style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{new Date(log.created_at).toLocaleDateString("pt-BR")} {new Date(log.created_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}{log.profiles?.name?(" - "+log.profiles.name):""}</p>
                  {log.observacao&&<p style={{fontSize:11,color:C.textSub,margin:"1px 0 0"}}>{log.observacao}</p>}
                </div>
                <span style={pill(C.tealLight,C.teal,C.tealMid)}>Aplicado</span>
              </div>
            ))}
          </div>}
        </div>}

        {!loading&&aba==="relatorios"&&<div>
          <div style={s.sg}>
            <div style={s.sc(C.primary)}><div style={{fontSize:30,fontWeight:900,color:C.primary}}>{insumos.length}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Tipos</div></div>
            <div style={s.sc(C.green)}><div style={{fontSize:30,fontWeight:900,color:C.green}}>{insumos.reduce((a,i)=>a+i.estoque,0)}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Unidades</div></div>
            <div style={s.sc(C.teal)}><div style={{fontSize:30,fontWeight:900,color:C.teal}}>{insumos.filter(i=>hasConv(i)).length}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Com Embalagem</div></div>
            <div style={s.sc(C.orange)}><div style={{fontSize:30,fontWeight:900,color:C.orange}}>{alerts.length}</div><div style={{fontSize:12,color:C.textSub,fontWeight:700}}>Alertas</div></div>
          </div>
          {historico.length>0&&<div>
            <p style={s.st}>Historico de Movimentacoes</p>
            {historico.slice(0,40).map((h,idx)=>{
              const ins=insumos.find(i=>i.id===h.supply_id);
              return (
                <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+C.border}}>
                  <div style={{flex:1,marginRight:8}}>
                    <p style={{fontSize:13,fontWeight:700,margin:0}}>{ins?ins.nome:"Insumo"}</p>
                    <p style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{new Date(h.created_at).toLocaleDateString("pt-BR")} {new Date(h.created_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}{h.profiles&&h.profiles.name?(" - "+h.profiles.name):""}</p>
                    {h.observacao&&<p style={{fontSize:11,color:C.textSub,margin:"1px 0 0"}}>{h.observacao}</p>}
                  </div>
                  <span style={pill(h.tipo==="entrada"?C.greenLight:C.redLight,h.tipo==="entrada"?C.green:C.red)}>{h.tipo==="entrada"?"+":"-"}{h.quantidade}</span>
                </div>
              );
            })}
          </div>}
        </div>}
      </div>

      {aba==="estoque"&&!loading&&<button style={s.fab} onClick={()=>openM("novo")}>+</button>}

      {modal&&(
        <div style={s.ov} onClick={()=>setModal(null)}>
          <div style={s.mb} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>

            {modal==="baixa"&&sel&&<div>
              <p style={{fontSize:18,fontWeight:900,marginBottom:8}}>Dar Baixa</p>
              <p style={{fontSize:14,fontWeight:700,marginBottom:4}}>{sel.nome}</p>
              <p style={{fontSize:13,color:C.textSub,marginBottom:4}}>Estoque: <strong style={{color:C.primary}}>{lblEst(sel)}</strong></p>
              {hasConv(sel)&&<p style={{fontSize:12,color:C.teal,marginBottom:16,fontWeight:600}}>A baixa e sempre em unidades</p>}
              <label style={s.lbl}>Quantidade de unidades</label>
              <input style={s.inp} type="number" min="1" max={sel.estoque} value={baixaQtd} onChange={e=>setBaixaQtd(e.target.value)}/>
              <div style={{display:"flex",gap:8,marginTop:18}}>
                <button style={{...s.btnD,flex:1}} onClick={handleBaixa}>Confirmar Baixa</button>
                <button style={s.btnS} onClick={()=>setModal(null)}>Cancelar</button>
              </div>
            </div>}

            {(modal==="novo"||modal==="editar")&&<div>
              <p style={{fontSize:18,fontWeight:900,marginBottom:18}}>{modal==="novo"?"Novo Insumo":"Editar Insumo"}</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={s.lbl}>Codigo</label><input style={s.inp} value={form.codigo||""} onChange={e=>setForm(f=>({...f,codigo:e.target.value}))} placeholder="Ex: 74275"/></div>
                <div><label style={s.lbl}>Nome *</label><input style={s.inp} value={form.nome||""} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Soro Fisiologico 10ml"/></div>
                <div style={s.r2}>
                  <div><label style={s.lbl}>Categoria *</label><select style={{...s.inp}} value={form.categoria||""} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={s.lbl}>Unidade de uso</label><select style={{...s.inp}} value={form.unidade||"Unid"} onChange={e=>setForm(f=>({...f,unidade:e.target.value}))}>{UNS.map(u=><option key={u}>{u}</option>)}</select></div>
                </div>
                <div style={{background:C.tealLight,border:"1px solid "+C.tealMid,borderRadius:12,padding:14}}>
                  <p style={{fontSize:12,fontWeight:800,color:C.teal,margin:"0 0 4px"}}>EMBALAGEM DE COMPRA</p>
                  <p style={{fontSize:11,color:C.teal,margin:"0 0 12px",opacity:0.8}}>Preencha se o item vem em caixas. Ex: Soro vem em cx com 30 unidades.</p>
                  <div style={s.r2}>
                    <div>
                      <label style={s.lbl}>Tipo embalagem</label>
                      <select style={{...s.inp}} value={form.unidade_compra||""} onChange={e=>setForm(f=>({...f,unidade_compra:e.target.value}))}>
                        <option value="">Nao se aplica</option>{EMB.map(u=><option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.lbl}>Un. por emb.</label>
                      <input style={s.inp} type="number" min="1" value={form.itens_por_embalagem||1} onChange={e=>setForm(f=>({...f,itens_por_embalagem:parseInt(e.target.value)||1}))} placeholder="Ex: 30"/>
                    </div>
                  </div>
                  {form.unidade_compra&&form.itens_por_embalagem>1&&(
                    <div style={{background:"#fff",borderRadius:8,padding:"8px 12px",marginTop:10}}>
                      <p style={{fontSize:13,color:C.teal,margin:0,fontWeight:700}}>1 {form.unidade_compra} = {form.itens_por_embalagem} {form.unidade||"unidades"}</p>
                      <p style={{fontSize:11,color:C.teal,margin:"3px 0 0",opacity:0.8}}>Entrada por embalagem, baixa por unidade</p>
                    </div>
                  )}
                </div>
                <div style={s.r2}>
                  <div><label style={s.lbl}>Estoque atual (un)</label><input style={s.inp} type="number" min="0" value={form.estoque||""} onChange={e=>setForm(f=>({...f,estoque:e.target.value}))} placeholder="0"/></div>
                  <div><label style={s.lbl}>Minimo (un)</label><input style={s.inp} type="number" min="0" value={form.minimo||""} onChange={e=>setForm(f=>({...f,minimo:e.target.value}))} placeholder="5"/></div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button style={{...s.btnP,flex:1}} onClick={handleSalvar}>{modal==="novo"?"Cadastrar":"Salvar"}</button>
                <button style={s.btnS} onClick={()=>setModal(null)}>Cancelar</button>
              </div>
            </div>}

            {modal==="validade"&&sel&&<div>
              <p style={{fontSize:18,fontWeight:900,marginBottom:4}}>Validades</p>
              <p style={{fontSize:13,color:C.textSub,marginBottom:16,fontWeight:600}}>{sel.nome}</p>
              {(!sel.validades||sel.validades.length===0)&&<div style={{background:C.surfaceAlt,borderRadius:10,padding:14,fontSize:13,color:C.textSub,textAlign:"center",marginBottom:16}}>Nenhum lote cadastrado.</div>}
              {(sel.validades||[]).map((v,idx)=>{
                const d=diffDays(v.validade,today);
                return (
                  <div key={idx} style={{...s.card,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><p style={{margin:0,fontWeight:800}}>Lote: {v.lote}</p><p style={{margin:"3px 0 0",fontSize:12,color:C.textMuted,fontWeight:600}}>{v.quantidade} un - {new Date(v.validade).toLocaleDateString("pt-BR")}</p></div>
                      <span style={pill(d<0?C.redLight:d<=30?C.orangeLight:C.greenLight,d<0?C.red:d<=30?C.orange:C.green)}>{d<0?"Vencido":(d+"d")}</span>
                    </div>
                  </div>
                );
              })}
              <p style={{...s.lbl,marginTop:16,marginBottom:10}}>Adicionar Lote</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input style={s.inp} placeholder="Numero do lote" value={form.novoLote||""} onChange={e=>setForm(f=>({...f,novoLote:e.target.value}))}/>
                <div style={s.r2}>
                  <input style={s.inp} type="date" value={form.novaValidade||""} onChange={e=>setForm(f=>({...f,novaValidade:e.target.value}))}/>
                  <input style={s.inp} type="number" placeholder="Qtd (un)" value={form.novaQtd||""} onChange={e=>setForm(f=>({...f,novaQtd:e.target.value}))}/>
                </div>
                <button style={s.btnP} onClick={handleLote}>Adicionar</button>
              </div>
              <button style={{...s.btnS,width:"100%",marginTop:12}} onClick={()=>setModal(null)}>Fechar</button>
            </div>}
          </div>
        </div>
      )}

      {entModal&&<EntradaModal ins={entModal} onSave={handleEntrada} onClose={()=>setEntModal(null)}/>}

      {/* MODAL NOVO/EDITAR KIT */}
      {(kitModal==="novo"||kitModal==="editar")&&(
        <div style={s.ov} onClick={()=>setKitModal(null)}>
          <div style={s.mb} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
            <p style={{fontSize:18,fontWeight:900,marginBottom:18,color:C.text}}>{kitModal==="novo"?"Novo Kit":"Editar Kit"}</p>

            <label style={s.lbl}>Nome do Kit *</label>
            <input style={{...s.inp,marginBottom:12}} placeholder="Ex: Kit Antibiotico EV" value={kitForm.nome} onChange={e=>setKitForm(f=>({...f,nome:e.target.value}))}/>

            <label style={s.lbl}>Descricao (opcional)</label>
            <input style={{...s.inp,marginBottom:16}} placeholder="Ex: Para antibioticos endovenosos" value={kitForm.descricao} onChange={e=>setKitForm(f=>({...f,descricao:e.target.value}))}/>

            <p style={s.lbl}>Insumos do Kit</p>

            {/* Itens ja adicionados */}
            {(kitForm.itens||[]).map((ki,idx)=>(
              <div key={idx} style={{...s.card,padding:"10px 14px",marginBottom:8,background:C.tealLight,borderColor:C.tealMid}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontSize:13,fontWeight:700,margin:0,flex:1,marginRight:8}}>{ki.nome||insumos.find(i=>i.id===ki.supply_id)?.nome||"Insumo"}</p>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="number" min="1" value={ki.quantidade} onChange={e=>setKitForm(f=>({...f,itens:f.itens.map((x,i)=>i===idx?{...x,quantidade:parseInt(e.target.value)||1}:x)}))} style={{...s.inp,width:60,padding:"4px 8px",fontSize:14,fontWeight:700,textAlign:"center"}}/>
                    <span style={{fontSize:11,color:C.teal}}>un</span>
                    <button onClick={()=>setKitForm(f=>({...f,itens:f.itens.filter((_,i)=>i!==idx)}))} style={{...s.sm(C.red),padding:"4px 8px"}}>X</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Buscar e adicionar insumo */}
            <div style={{background:C.surfaceAlt,borderRadius:12,padding:12,marginBottom:16}}>
              <p style={{fontSize:12,fontWeight:800,color:C.textMuted,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:0.8}}>Adicionar Insumo</p>
              <input style={{...s.inp,marginBottom:8}} placeholder="Buscar insumo..." value={kitBusca} onChange={e=>setKitBusca(e.target.value)}/>
              <div style={{maxHeight:200,overflowY:"auto"}}>
                {insumos.filter(i=>!kitBusca||i.nome.toLowerCase().indexOf(kitBusca.toLowerCase())>=0).filter(i=>!(kitForm.itens||[]).find(ki=>ki.supply_id===i.id)).slice(0,10).map(i=>(
                  <div key={i.id} onClick={()=>{setKitForm(f=>({...f,itens:[...(f.itens||[]),{supply_id:i.id,quantidade:1,nome:i.nome}]}));setKitBusca("");}} style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",marginBottom:4,background:C.surface,border:"1px solid "+C.border}}>
                    <p style={{fontSize:13,fontWeight:600,margin:0}}>{i.nome}</p>
                    <p style={{fontSize:11,color:C.textMuted,margin:"1px 0 0"}}>{i.categoria} - {lblEst(i)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button style={{...s.btnP,flex:1,background:C.teal}} onClick={handleSalvarKit}>Salvar Kit</button>
              <button style={s.btnS} onClick={()=>setKitModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL APLICAR KIT */}
      {kitModal==="aplicar"&&kitSel&&(()=>{
        const [obsKit,setObsKit]=useState("");
        return (
          <div style={s.ov} onClick={()=>setKitModal(null)}>
            <div style={s.mb} onClick={e=>e.stopPropagation()}>
              <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
              <p style={{fontSize:18,fontWeight:900,marginBottom:4,color:C.text}}>Aplicar Kit</p>
              <p style={{fontSize:14,color:C.teal,marginBottom:16,fontWeight:700}}>{kitSel.nome}</p>

              <div style={{background:C.surfaceAlt,borderRadius:12,padding:12,marginBottom:16}}>
                <p style={{fontSize:12,fontWeight:800,color:C.textMuted,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:0.8}}>Baixa automatica em</p>
                {kitSel.kit_items.map((ki,idx)=>{
                  const ins=insumos.find(i=>i.id===ki.supply_id);
                  return (
                    <div key={idx} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:idx<kitSel.kit_items.length-1?("1px solid "+C.border):"none"}}>
                      <p style={{fontSize:13,fontWeight:600,margin:0}}>{ki.supplies?.nome||"Insumo"}</p>
                      <span style={{fontSize:13,color:C.red,fontWeight:700}}>-{ki.quantidade} un {ins?"("+ins.estoque+" disp.)":""}</span>
                    </div>
                  );
                })}
              </div>

              <label style={s.lbl}>Observacao (opcional)</label>
              <input style={{...s.inp,marginBottom:20}} placeholder="Ex: Dose das 08h - Amoxicilina" value={obsKit} onChange={e=>setObsKit(e.target.value)}/>

              <div style={{display:"flex",gap:8}}>
                <button style={{...s.btnP,flex:1,background:C.teal}} onClick={()=>handleAplicarKit(kitSel,obsKit)}>Confirmar Aplicacao</button>
                <button style={s.btnS} onClick={()=>setKitModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
