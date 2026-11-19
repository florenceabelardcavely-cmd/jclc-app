import React, { useState, useRef, useEffect } from "react";
import { LOGO_B64 } from "./assets/logoB64";
import { ChangePinModal } from "./components/ChangePinModal";
import { FlyerModal } from "./components/FlyerModal";
import { ImportSongModal } from "./components/ImportSongModal";
import { BottomNav, SkeletonLoader, useSwipe } from "./components/common";
import { MemberModal, MemberNotifModal } from "./components/memberModals";
import { AssignModal, SelectServiceModal } from "./components/planningModals";
import { ProgramFormModal, ProgramViewModal } from "./components/programs";
import { SongFormModal, SongViewModal } from "./components/songs";
import { CHURCHES, TEAMS, TEAM_IDS } from "./config";
import { buildUserData, getVersetSemaine, handleExtraRow, isLouangeMember, isPremierDuMois, isRespTeamMember, isTeamMember, memberBelongsTo, memberChurches, memberRoles, otherTeamLabels, splitMembers, teamPosts, techKey, uid } from "./lib/helpers";
import { fillProgSeminaireJ1, importSongsJuil26, migrateCreilToSunday } from "./lib/migrations";
import { normalizeItems, normalizeSong } from "./lib/music";
import { sbDel, sbGet, sbUpsert } from "./lib/supabase";
import { INIT } from "./state";
import { CSS } from "./styles";
import { AccueilTab } from "./tabs/AccueilTab";
import { BibliothèqueTab } from "./tabs/BibliothequeTab";
import { CalendarTab } from "./tabs/CalendarTab";
import { ChantresTab } from "./tabs/ChantresTab";
import { DispoTab } from "./tabs/DispoTab";
import { FAQTab } from "./tabs/FAQTab";
import { MembresTab, PermissionsTab } from "./tabs/MembresTab";
import { MonPlanningTab } from "./tabs/MonPlanningTab";
import { MusicienTab } from "./tabs/MusicienTab";
import { PasteursTab } from "./tabs/PasteursTab";
import { PianoTab } from "./tabs/PianoTab";
import { PlanningTab } from "./tabs/PlanningTab";
import { ProgrammesTab } from "./tabs/ProgrammesTab";
import { RepetitionTab } from "./tabs/RepetitionTab";
import { StatistiquesTab } from "./tabs/StatistiquesTab";
import { AdminTechTab } from "./teams/AdminTeamTab";
import { LouangeConsultTab } from "./teams/LouangeConsultTab";
import { TechAccueilTab, TechDispoTab, TechMonPlanningTab } from "./teams/TeamMemberTabs";
import { TechMembresTab } from "./teams/TeamMembresTab";
import { TechPlanningTab } from "./teams/TeamPlanningTab";

// ══════════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════════
export default function App() {
  const [st, setSt]    = useState(INIT);
  const [appLoaded, setAppLoaded] = useState(false);
  useEffect(()=>{
    (async()=>{
      const [mbrs,sngs,plans,progs]=await Promise.all([sbGet("members"),sbGet("songs"),sbGet("plannings"),sbGet("programs")]);
      setSt(s=>{
        const n=JSON.parse(JSON.stringify(s));
        // members can belong to two churches via church2 field
        splitMembers(mbrs,n);
        if(sngs.length)n.songs=sngs.map(normalizeSong);
        n.planService=Object.fromEntries(Object.keys(CHURCHES).map(cid=>[cid,{}]));n.planLead=Object.fromEntries(Object.keys(CHURCHES).map(cid=>[cid,{}]));TEAM_IDS.forEach(id=>{n[id+"Plans"]=Object.fromEntries(TEAMS[id].churches.map(cid=>[cid,{}]));});
        plans.forEach(p=>{
          if(handleExtraRow(p,n)){}
          else if(p.date==="availability"&&p.member_id&&p.availability){try{const av=JSON.parse(p.availability);if(typeof av==="object"&&!Array.isArray(av)){n.avail[p.member_id]=av;}}catch{}}
            else if(p.date==="dispo_sent"&&p.member_id&&p.availability){try{const ds=JSON.parse(p.availability);if(typeof ds==="object"&&!Array.isArray(ds)){n.dispoSent[p.member_id]=ds;}}catch{}}
          else if(p.member_id==="service"&&p.availability&&p.church&&p.date){try{const raw=JSON.parse(p.availability);const ids=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.ids)?raw.ids:null);if(ids){if(!n.planService[p.church])n.planService[p.church]={};n.planService[p.church][p.date]=ids;if(!n.planLead)n.planLead={};if(!n.planLead[p.church])n.planLead[p.church]={};n.planLead[p.church][p.date]=(!Array.isArray(raw)&&raw.leadId)||null;}}catch{}}
          else if(p.date==="status"&&p.member_id&&p.church){try{n.planStatus[p.church]=p.availability||"draft";}catch{}}
          else if(p.date==="validated_months"&&p.church){try{n.validatedMonths[p.church]=JSON.parse(p.availability||"{}");}catch{}}
          else if(p.church&&p.date&&p.member_id&&p.member_id!=="plan"&&p.member_id!=="service"&&p.date!=="availability"&&p.date!=="status"){if(!n.plans[p.church])n.plans[p.church]={};if(!n.plans[p.church][p.date])n.plans[p.church][p.date]=[];if(!n.plans[p.church][p.date].includes(p.member_id))n.plans[p.church][p.date].push(p.member_id);}
        });
        if(progs.length)n.programs=progs.map(p=>{p={...p,churchId:p.churchId||p.church_id||p.church};
          let items=p.items||p.songs||[];
          if(typeof items==="string"){try{items=JSON.parse(items);}catch{items=[];}}
          let pages=p.pages||1;
          if(typeof pages==="string"){try{pages=JSON.parse(pages);}catch{pages=1;}}
          return{...p,items:normalizeItems(items),pages};
        });
        return n;
      });
      setAppLoaded(true);
      // Auto-archivage des programmes passés
      setSt(s=>{
        const n=JSON.parse(JSON.stringify(s));
        const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);yesterday.setHours(23,59,59,0);
        const toArchive=n.programs.filter(p=>p.status==="draft"&&p.date&&new Date(p.date+"T00:00:00")<=yesterday);
        if(toArchive.length>0){
          toArchive.forEach(p=>{
            p.status="archived";
            sbUpsert("programs",{id:p.id,title:p.title||"",church:p.churchId||p.church||"creil",date:p.date||"",pages:p.pages||1,items:p.items||[],notes:p.notes||"",status:"archived"});
          });
        }
        return n;
      });
    })();
  },[]);

  useEffect(()=>{
    const loadData=async()=>{
      try{
        const [mbrs,sngs,plans,progs]=await Promise.all([sbGet("members"),sbGet("songs"),sbGet("plannings"),sbGet("programs")]);
        setSt(s=>{
          const n=JSON.parse(JSON.stringify(s));
          splitMembers(mbrs,n);
          if(sngs.length)n.songs=sngs.map(normalizeSong);
          n.plans=Object.fromEntries(Object.keys(CHURCHES).map(cid=>[cid,{}]));
          n.planService=Object.fromEntries(Object.keys(CHURCHES).map(cid=>[cid,{}]));n.planLead=Object.fromEntries(Object.keys(CHURCHES).map(cid=>[cid,{}]));TEAM_IDS.forEach(id=>{n[id+"Plans"]=Object.fromEntries(TEAMS[id].churches.map(cid=>[cid,{}]));});
          // Garder planStatus existant, juste mettre à jour depuis Supabase
          plans.forEach(p=>{
            if(handleExtraRow(p,n)){}
            else if(p.date==="availability"&&p.member_id&&p.availability){try{const av=JSON.parse(p.availability);if(typeof av==="object"&&!Array.isArray(av)){n.avail[p.member_id]=av;}}catch{}}
            else if(p.date==="dispo_sent"&&p.member_id&&p.availability){try{const ds=JSON.parse(p.availability);if(typeof ds==="object"&&!Array.isArray(ds)){n.dispoSent[p.member_id]=ds;}}catch{}}
            else if(p.member_id==="service"&&p.availability&&p.church&&p.date){try{const raw=JSON.parse(p.availability);const ids=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.ids)?raw.ids:null);if(ids){if(!n.planService[p.church])n.planService[p.church]={};n.planService[p.church][p.date]=ids;if(!n.planLead)n.planLead={};if(!n.planLead[p.church])n.planLead[p.church]={};n.planLead[p.church][p.date]=(!Array.isArray(raw)&&raw.leadId)||null;}}catch{}}
            else if(p.date==="status"&&p.member_id&&p.church){try{n.planStatus[p.church]=p.availability||"draft";}catch{}}
            else if(p.date==="validated_months"&&p.church){try{n.validatedMonths[p.church]=JSON.parse(p.availability||"{}");}catch{}}
            else if(p.date&&p.member_id==="plan"&&p.availability){try{const ids=JSON.parse(p.availability);if(Array.isArray(ids)&&p.church){if(!n.plans[p.church])n.plans[p.church]={};n.plans[p.church][p.date]=ids;}}catch{}}
            else if(p.church&&p.date&&p.member_id&&p.member_id!=="plan"&&p.member_id!=="service"&&p.date!=="availability"&&p.date!=="status"){if(!n.plans[p.church])n.plans[p.church]={};if(!n.plans[p.church][p.date])n.plans[p.church][p.date]=[];if(!n.plans[p.church][p.date].includes(p.member_id))n.plans[p.church][p.date].push(p.member_id);}
          });
          if(progs.length)n.programs=progs.map(p=>{p={...p,churchId:p.churchId||p.church_id||p.church};
            let items=p.items||p.songs||[];
            if(typeof items==="string"){try{items=JSON.parse(items);}catch{items=[];}}
            let pages=p.pages||1;
            if(typeof pages==="string"){try{pages=JSON.parse(pages);}catch{pages=1;}}
            return{...p,items:normalizeItems(items),pages};
          });
          return n;
        });
      }catch(e){console.error("Refresh error:",e);}
    };
    const interval=setInterval(loadData,30000);
    const onVisible=()=>{if(document.visibilityState==="visible")loadData();};
    document.addEventListener("visibilitychange",onVisible);
    return()=>{clearInterval(interval);document.removeEventListener("visibilitychange",onVisible);};
  },[]);

  const [user, setUser]= useState(()=>{
    try{
      const u=localStorage.getItem("jclc_user");
      if(!u)return null;
      const parsed=JSON.parse(u);
      const loginTime=parsed.loginTime||0;
      const eightHours=8*60*60*1000;
      if(Date.now()-loginTime>eightHours){localStorage.removeItem("jclc_user");localStorage.setItem("jclc_session_expired","1");return null;}
      return parsed;
    }catch{return null;}
  });
  const [loginId, setLoginId] = useState("admin");
  const [loginSearch, setLoginSearch] = useState("");
  const [loginTeam, setLoginTeam] = useState("louange"); // "louange" | "tech" | "com"
  const [changePinModal, setChangePinModal] = useState(false);
  const [loginPwd, setLoginPwd] = useState("");
  const [sessionExpired,setSessionExpired]=useState(()=>{
    const exp=localStorage.getItem("jclc_session_expired");
    if(exp){localStorage.removeItem("jclc_session_expired");return true;}
    return false;
  });
  const [loginPin, setLoginPin] = useState(["","","",""]);
  const [loginErr, setLoginErr] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLocked, setLoginLocked] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [tab, setTab]  = useState("accueil");
  const swipe=useSwipe(
    ()=>{const i=tabs.findIndex(t=>t.id===tab);if(i<tabs.length-1)setTab(tabs[i+1].id);},
    ()=>{const i=tabs.findIndex(t=>t.id===tab);if(i>0)setTab(tabs[i-1].id);}
  );
  const [church, setChurch] = useState("creil");
  const [modal, setModal]   = useState(null);
  const [toast, setToast]   = useState(null);
  const [year, setYear]     = useState(new Date().getFullYear());
  const [month, setMonth]   = useState(new Date().getMonth());
  const toastRef = useRef();
  const verset = getVersetSemaine();
  const [notifDismissed, setNotifDismissed] = useState(false);
  const [showFlyerModal, setShowFlyerModal] = useState(null); // church id pour flyer
  const showNotifBanner = isPremierDuMois() && !notifDismissed;

  const isAdmin  = user && (user.role==="admin"||user.role==="pasteur");
  const isMusicien = user && user.role!=="admin";
  const canSongs = user && (isAdmin || user.canEditLib===true);
  const canProgs = user && (isAdmin || user.canEditProg===true);
  const myChurch = isAdmin ? church : (user?.church||"creil");
  const [activeChurch2, setActiveChurch2] = useState(null); // null = église principale
  const myChurch2 = isAdmin ? church : (activeChurch2 || user?.church || "creil");
  const myOtherChurches = !isAdmin ? (user?.churches||(user?.church2?[user.church2]:[])).filter(cid=>CHURCHES[cid]) : [];
  const hasChurch2 = myOtherChurches.length>0;

  function toast_(msg,icon="✅"){setToast({msg,icon});clearTimeout(toastRef.current);toastRef.current=setTimeout(()=>setToast(null),3200);}
  function upd(fn){setSt(s=>{const n=JSON.parse(JSON.stringify(s));fn(n);return n;});}

  // Members
  const addMember=(cid,m)=>{
    const nm={...m,id:uid(),canEditLib:false};
    upd(s=>{
      s.members[cid].push(nm);
      s.memberNotifications.push({id:uid(),memberId:nm.id,name:nm.name,church:CHURCHES[cid].fullName,pin:nm.pin||"0000",createdAt:new Date().toLocaleString("fr-FR"),seen:false});
    });
    sbUpsert("members",{id:nm.id,name:nm.name,role:nm.role,roles:nm.roles||[nm.role],church:cid,churches:nm.churches||[],pin:nm.pin||"0000",can_edit_lib:nm.canEditLib||false,can_edit_prog:nm.canEditProg||false});
    toast_(`${m.name} ajouté(e) ✓`,"👤");
  };
  const editMember=(cid,m)=>{upd(s=>{const i=s.members[cid].findIndex(x=>x.id===m.id);if(i>=0)s.members[cid][i]=m;TEAM_IDS.forEach(id=>{const K=id+"Members";Object.keys(s[K]||{}).forEach(c=>{const j=s[K][c].findIndex(x=>x.id===m.id);if(j>=0)s[K][c][j]={...s[K][c][j],...m};});});});sbUpsert("members",{id:m.id,name:m.name,role:m.role,roles:m.roles||[m.role],church:cid,churches:m.churches||[],pin:m.pin||"0000",can_edit_lib:m.canEditLib||false,can_edit_prog:m.canEditProg||false});toast_("Fiche mise à jour","✏️");};
  function changePin(newPin){
    if(!user||user.role==="admin"||user.role==="pasteur")return;
    for(const cid of Object.keys(CHURCHES)){
      const m=(st.members[cid]||[]).find(x=>x.id===user.id)||TEAM_IDS.map(id=>(st[id+"Members"]?.[cid]||[]).find(x=>x.id===user.id)).find(Boolean);
      if(m){
        const updated={...m,pin:newPin};
        upd(s=>{["members",...TEAM_IDS.map(id=>id+"Members")].forEach(k=>Object.keys(s[k]||{}).forEach(c=>{s[k][c]=(s[k][c]||[]).map(x=>x.id===user.id?{...x,pin:newPin}:x);}));});
        sbUpsert("members",{id:updated.id,name:updated.name,role:updated.role,church:cid,pin:newPin,can_edit_lib:updated.canEditLib||false});
        window.__jclcMemberPin=newPin;
        toast_("Code PIN modifié avec succès","🔐");
        setChangePinModal(false);
        return;
      }
    }
  }
  const deleteMember=(cid,id)=>{upd(s=>{s.members[cid]=s.members[cid].filter(m=>m.id!==id);delete s.avail[id];TEAM_IDS.forEach(t=>{const K=t+"Members";Object.keys(s[K]||{}).forEach(c=>{s[K][c]=s[K][c].filter(m=>m.id!==id);});});});sbDel("members",id);toast_("Membre supprimé","🗑️");};
  const toggleLib=(cid,id)=>{
    const m=st.members[cid]?.find(x=>x.id===id);
    if(!m)return;
    const newVal=!m.canEditLib;
    upd(s=>{const mm=s.members[cid].find(x=>x.id===id);if(mm)mm.canEditLib=newVal;});
    sbUpsert("members",{id:m.id,name:m.name,role:m.role,roles:m.roles||[m.role],church:cid,churches:m.churches||[],pin:m.pin||"0000",can_edit_lib:newVal,can_edit_prog:m.canEditProg||false});
  };
  const toggleProg=(cid,id)=>{
    const m2=st.members[cid]?.find(x=>x.id===id);
    if(!m2)return;
    const newVal2=!m2.canEditProg;
    upd(s=>{const mm=s.members[cid].find(x=>x.id===id);if(mm)mm.canEditProg=newVal2;});
    sbUpsert("members",{id:m2.id,name:m2.name,role:m2.role,roles:m2.roles||[m2.role],church:cid,churches:m2.churches||[],pin:m2.pin||"0000",can_edit_lib:m2.canEditLib||false,can_edit_prog:newVal2});
  };

  // Avail
  const toggleAvail=(mid,d)=>{
    const curAvail=st.avail[mid]||{};
    const newAvail={...curAvail};
    if(newAvail[d])delete newAvail[d];else newAvail[d]={on:true,ts:new Date().toISOString()};
    const memberChurch=Object.keys(CHURCHES).map(cid=>st.members[cid]?.find(m=>m.id===mid)).find(Boolean)?.church||"lognes";
    upd(s=>{
      s.avail[mid]=newAvail;
      const monthKey=d.slice(0,7);
      if(s.dispoSent[mid]?.[monthKey]){
        const ds={...s.dispoSent[mid]};delete ds[monthKey];s.dispoSent[mid]=ds;
        sbUpsert("plannings",{id:mid+"_dispo_sent",member_id:mid,church:memberChurch,date:"dispo_sent",availability:JSON.stringify(ds)});
      }
    });
    sbUpsert("plannings",{id:mid+"_avail",member_id:mid,church:memberChurch,date:"availability",availability:JSON.stringify(newAvail)});
  };
  const isAvail=(mid,d)=>!!st.avail[mid]?.[d];
  const sendDispo=(mid,monthKey)=>{
    const memberChurch=Object.keys(CHURCHES).map(cid=>st.members[cid]?.find(m=>m.id===mid)).find(Boolean)?.church||"lognes";
    upd(s=>{s.dispoSent[mid]={...(s.dispoSent[mid]||{}),[monthKey]:true};});
    const ds={...(st.dispoSent[mid]||{}),[monthKey]:true};
    sbUpsert("plannings",{id:mid+"_dispo_sent",member_id:mid,church:memberChurch,date:"dispo_sent",availability:JSON.stringify(ds)});
  };

  // ── Équipes de service (technique, communication / audiovisuel) ──
  const userTeam   = user && TEAMS[user.team] ? TEAMS[user.team] : null;
  const isTech     = !!userTeam;              // connecté via une équipe de service (pas la louange)
  const isRespTech = isTech && user.isRespTech===true;
  // Place un membre dans les bonnes listes (louange / équipes) de chaque assemblée
  function placeMember(s,m){
    Object.keys(CHURCHES).forEach(c=>{
      ["members",...TEAM_IDS.map(id=>id+"Members")].forEach(k=>{if(!s[k])s[k]={};s[k][c]=(s[k][c]||[]).filter(x=>x.id!==m.id);});
      if(memberBelongsTo(m,c)){
        if(isLouangeMember(m))s.members[c].push(m);
        TEAM_IDS.forEach(id=>{if(isTeamMember(m,TEAMS[id]))s[id+"Members"][c].push(m);});
      }
    });
  }
  function makeTeamActions(T){
    const P=T.id,KM=P+"Members",KP=P+"Plans",KA=P+"Avail",KS=P+"DispoSent",KV=P+"Validated";
    const saveMember=(cid,m,isNew)=>{
      const nm={...m,id:m.id||uid(),church:m.church||cid,canEditLib:m.canEditLib||false,canEditProg:m.canEditProg||false};
      upd(s=>{
        placeMember(s,nm);
        if(isNew)s.memberNotifications.push({id:uid(),memberId:nm.id,name:nm.name,church:CHURCHES[nm.church].fullName+" · "+T.label,pin:nm.pin||"0000",createdAt:new Date().toLocaleString("fr-FR"),seen:false});
      });
      sbUpsert("members",{id:nm.id,name:nm.name,role:nm.role,roles:nm.roles,church:nm.church,churches:nm.churches||[],pin:nm.pin||"0000",can_edit_lib:nm.canEditLib,can_edit_prog:nm.canEditProg});
      toast_(isNew?`${nm.name} ajouté(e) — ${T.label} ✓`:"Fiche mise à jour",isNew?T.icon:"✏️");
    };
    const deleteMember=(m)=>{
      const rest=memberRoles(m).filter(r=>!T.roles.includes(r)&&r!==T.resp);
      if(rest.length>0){
        // Membre aussi dans une autre équipe : on lui retire seulement les postes de celle-ci
        if(!window.confirm(`${m.name} fait aussi partie d'une autre équipe (${otherTeamLabels(m,T).join(", ")}). Le/la retirer uniquement ${T.ofTeam} ?`))return;
        const nm={...m,roles:rest,role:rest.includes(m.role)?m.role:rest[0]};
        upd(s=>placeMember(s,nm));
        sbUpsert("members",{id:nm.id,name:nm.name,role:nm.role,roles:nm.roles,church:nm.church,churches:nm.churches||[],pin:nm.pin||"0000",can_edit_lib:nm.canEditLib||false,can_edit_prog:nm.canEditProg||false});
        toast_(`${m.name} retiré(e) ${T.ofTeam}`,"🗑️");
      }else{
        if(!window.confirm(`Supprimer ${m.name} ?`))return;
        upd(s=>{Object.keys(CHURCHES).forEach(c=>{s[KM][c]=(s[KM][c]||[]).filter(x=>x.id!==m.id);});delete s[KA][m.id];});
        sbDel("members",m.id);
        toast_("Membre supprimé","🗑️");
      }
    };
    const toggleAvail=(mid,cid,d)=>{
      const k=techKey(cid,d),mk=techKey(cid,d.slice(0,7));
      const na={...(st[KA]?.[mid]||{})};
      if(na[k])delete na[k];else na[k]={on:true,ts:new Date().toISOString()};
      upd(s=>{
        if(!s[KA])s[KA]={};if(!s[KS])s[KS]={};
        s[KA][mid]=na;
        if(s[KS][mid]?.[mk]){
          const ds={...s[KS][mid]};delete ds[mk];s[KS][mid]=ds;
          sbUpsert("plannings",{id:mid+"_"+P+"dispo_sent",member_id:mid,church:cid,date:P+"_dispo_sent",availability:JSON.stringify(ds)});
        }
      });
      sbUpsert("plannings",{id:mid+"_"+P+"avail",member_id:mid,church:cid,date:P+"_availability",availability:JSON.stringify(na)});
    };
    const sendDispo=(mid,cid,monthKey)=>{
      const mk=techKey(cid,monthKey);
      const ds={...(st[KS]?.[mid]||{}),[mk]:true};
      upd(s=>{if(!s[KS])s[KS]={};s[KS][mid]=ds;});
      sbUpsert("plannings",{id:mid+"_"+P+"dispo_sent",member_id:mid,church:cid,date:P+"_dispo_sent",availability:JSON.stringify(ds)});
    };
    const setAssign=(cid,d,assign)=>{
      upd(s=>{if(!s[KP])s[KP]={};if(!s[KP][cid])s[KP][cid]={};if(Object.keys(assign).length)s[KP][cid][d]=assign;else delete s[KP][cid][d];});
      if(Object.keys(assign).length)sbUpsert("plannings",{id:P+"_"+cid+"_"+d,member_id:P,church:cid,date:d,availability:JSON.stringify(assign)});
      else sbDel("plannings",P+"_"+cid+"_"+d);
    };
    const setValidated=(cid,mk,val)=>{
      const cur={...(st[KV]?.[cid]||{})};
      if(val)cur[mk]=true;else delete cur[mk];
      upd(s=>{if(!s[KV])s[KV]={};s[KV][cid]=cur;});
      sbUpsert("plannings",{id:P+"_validated_"+cid,member_id:P+"_status",church:cid,date:P+"_validated",availability:JSON.stringify(cur)});
      toast_(val?`${T.planTitle} validé et publié`:`${T.planTitle} repassé en brouillon`,val?"✅":"✏️");
    };
    return {toggleAvail,sendDispo,setAssign,setValidated,saveMember,deleteMember};
  }
  const teamActions=Object.fromEntries(TEAM_IDS.map(id=>[id,makeTeamActions(TEAMS[id])]));

  // Migration unique Creil samedi → dimanche : lancée automatiquement à la connexion admin
  useEffect(()=>{
    if(!appLoaded||!user||user.role!=="admin")return;
    migrateCreilToSunday().then(done=>{
      if(done){toast_("Creil : les services du samedi ont été déplacés au dimanche","📅");setTimeout(()=>window.location.reload(),2000);}
    }).catch(e=>console.error("Migration Creil:",e));
    importSongsJuil26().then(add=>{
      if(add.length){upd(x=>{add.forEach(sg=>{if(!x.songs.some(y=>y.id===sg.id))x.songs.push(normalizeSong(sg));});});toast_(`${add.length} chants du livret de juillet ajoutés à la bibliothèque`,"🎵");}
    }).catch(e=>console.error("Import chants juillet:",e))
    .then(()=>fillProgSeminaireJ1()).then(r=>{
      if(!r)return;
      if(r.error){toast_(r.error+" — vérifiez son titre","⚠️");return;}
      upd(x=>{const i=x.programs.findIndex(y=>y.id===r.program.id);if(i>=0)x.programs[i]={...x.programs[i],items:r.program.items};});
      toast_(`Séminaire jour 1 : ${r.added} chants ajoutés au programme`+(r.missing.length?` (${r.missing.length} introuvables : ${r.missing.join(", ")})`:""),"📋");
    }).catch(e=>console.error("Programme séminaire J1:",e));
  },[appLoaded,user?.role]);

  // Planning
  const assignDate=(cid,d,ids)=>{
    upd(s=>{if(!s.plans[cid])s.plans[cid]={};s.plans[cid][d]=ids;});
    // Sauvegarder chaque membre assigné dans Supabase
    ids.forEach(mid=>{
      sbUpsert("plannings",{id:cid+"_"+d+"_"+mid,member_id:mid,church:cid,date:d,availability:"assigned"});
    });
    // Supprimer les membres désassignés
    sbGet("plannings").then(rows=>{
      rows.filter(r=>r.church===cid&&r.date===d&&r.availability==="assigned"&&!ids.includes(r.member_id))
          .forEach(r=>sbDel("plannings",r.id));
    });
  };
  const setServiceMembers=(cid,d,ids,leadId)=>{
    upd(s=>{
      if(!s.planService[cid])s.planService[cid]={};
      s.planService[cid][d]=ids;
      if(!s.planLead)s.planLead={};
      if(!s.planLead[cid])s.planLead[cid]={};
      s.planLead[cid][d]=leadId||null;
    });
    sbUpsert("plannings",{id:cid+"_service_"+d,member_id:"service",church:cid,date:d,availability:JSON.stringify({ids,leadId:leadId||null})});
  };
  const validate=(cid,mk)=>{
    const monthKey=mk||`${year}-${String(month+1).padStart(2,"0")}`;
    upd(s=>{
      s.planStatus[cid]="validated";
      if(!s.validatedMonths)s.validatedMonths={creil:{},lognes:{},toulouse:{}};
      if(!s.validatedMonths[cid])s.validatedMonths[cid]={};
      s.validatedMonths[cid][monthKey]=true;
      const plan=s.plans[cid];
      Object.values(plan).forEach(ids=>{(ids||[]).forEach(mid=>{const m=s.members[cid].find(x=>x.id===mid);if(m){if(!m.servicesCount)m.servicesCount=0;m.servicesCount++;}});});
    });
    sbUpsert("plannings",{id:cid+"_status",member_id:cid,church:cid,date:"status",availability:"validated"});
    const newVM={...(st.validatedMonths?.[cid]||{}),[monthKey]:true};
    sbUpsert("plannings",{id:cid+"_validated_months",member_id:cid,church:cid,date:"validated_months",availability:JSON.stringify(newVM)});
    toast_(`Planning ${CHURCHES[cid].name} ${monthKey} validé ! 🎉`,"🎉");
    setTimeout(()=>setShowFlyerModal(cid),1500);
  };
  const unvalidate=(cid,mk)=>{
    const monthKey=mk||`${year}-${String(month+1).padStart(2,"0")}`;
    upd(s=>{
      if(!s.validatedMonths)s.validatedMonths={creil:{},lognes:{},toulouse:{}};
      if(s.validatedMonths[cid])delete s.validatedMonths[cid][monthKey];
      if(!s.validatedMonths[cid]||Object.keys(s.validatedMonths[cid]).length===0)s.planStatus[cid]="draft";
    });
    const newVM={...(st.validatedMonths?.[cid]||{})};delete newVM[monthKey];
    sbUpsert("plannings",{id:cid+"_validated_months",member_id:cid,church:cid,date:"validated_months",availability:JSON.stringify(newVM)});
  };
  const sendNotifs=(cid,method)=>{
    const logs=[];
    Object.entries(st.plans[cid]).forEach(([d,ids])=>{
      (ids||[]).forEach(mid=>{
        const m=st.members[cid].find(x=>x.id===mid);
        if(m)logs.push({id:uid(),member:m.name,church:CHURCHES[cid].fullName,d,method,email:m.email,phone:m.phone,sent:new Date().toLocaleString("fr-FR")});
      });
    });
    upd(s=>s.notifLog=[...s.notifLog,...logs]);
    toast_(`${logs.length} notification(s) envoyée(s)`,"📨");
  };

  // Songs
  const addSong=s=>{const ns={...s,id:uid()};upd(x=>x.songs.push(ns));sbUpsert("songs",ns);toast_("Chant ajouté","🎵");};
  const editSong=s=>{upd(x=>{const i=x.songs.findIndex(y=>y.id===s.id);if(i>=0)x.songs[i]=s;});sbUpsert("songs",s);toast_("Chant mis à jour","✏️");};
  const deleteSong=id=>{upd(x=>x.songs=x.songs.filter(s=>s.id!==id));sbDel("songs",id);toast_("Chant supprimé","🗑️");};

  // Programs
  const addProg=p=>{
    const np={...p,id:uid()};
    upd(x=>x.programs.push(np));
    const row={id:np.id,title:np.title||"",church:np.churchId||np.church||myChurch,date:np.date||"",pages:np.pages||1,items:np.items||[],notes:np.notes||"",status:np.status||"draft"};
    sbUpsert("programs",row);
    toast_("Programme créé","📋");
  };
  const editProg=p=>{
    upd(x=>{const i=x.programs.findIndex(y=>y.id===p.id);if(i>=0)x.programs[i]=p;});
    const row={id:p.id,title:p.title||"",church:p.churchId||p.church||myChurch,date:p.date||"",pages:p.pages||1,items:p.items||[],notes:p.notes||"",status:p.status||"draft"};
    sbUpsert("programs",row);
    toast_("Programme mis à jour","✏️");
  };
  const deleteProg=id=>{if(!window.confirm("Supprimer ce programme ?"))return;upd(x=>x.programs=x.programs.filter(p=>p.id!==id));sbDel("programs",id);toast_("Programme supprimé","🗑️");};
  const archiveProg=id=>{
    upd(x=>{const p=x.programs.find(p=>p.id===id);if(p)p.status="archived";});
    const p=st.programs.find(p=>p.id===id);
    if(p)sbUpsert("programs",{id:p.id,title:p.title||"",church:p.churchId||p.church||myChurch,date:p.date||"",pages:p.pages||1,items:p.items||[],notes:p.notes||"",status:"archived"});
    toast_("Programme archivé","🗄️");
  };
  const duplicateProg=p=>{
    const np={...p,id:uid(),title:(p.title||"Programme")+" (copie)",date:"",status:"draft",churchId:p.churchId||p.church||myChurch};
    upd(x=>x.programs.push(np));
    sbUpsert("programs",{id:np.id,title:np.title,church:np.churchId,date:"",pages:np.pages||1,items:np.items||[],notes:np.notes||"",status:"draft"});
    toast_("Programme dupliqué — modifiez la date !","📋");
  };

  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};

  // ─── LOGIN ───
  function login(){
    if(loginLocked)return;
    setLoginErr("");
    if(loginTeam==="louange"&&(loginId==="admin"||loginId==="pasteur")){
      const expected=loginId==="admin"?"Admin2024!":"Pasteur2024!";
      if(loginPwd!==expected){
        const att=loginAttempts+1;setLoginAttempts(att);
        if(att>=3){setLoginLocked(true);setLoginErr("Compte bloqué 30s après 3 tentatives.");setTimeout(()=>{setLoginLocked(false);setLoginAttempts(0);setLoginErr("");},30000);}
        else setLoginErr(`Mot de passe incorrect. ${3-att} tentative(s) restante(s).`);
        return;
      }
      const u=loginId==="admin"?{id:"admin",name:"Administrateur",role:"admin",church:"both"}:{id:"pasteur",name:"Pasteur Alexandre",role:"pasteur",church:"both"};
      const uWithTime={...u,loginTime:Date.now()};setUser(uWithTime);localStorage.setItem("jclc_user",JSON.stringify(uWithTime));setLoginPwd("");setLoginAttempts(0);setTab("accueil");return;
    }
    const enteredPin=loginPin.join("");
    if(enteredPin.length<4){setLoginErr("Saisissez votre code PIN à 4 chiffres.");return;}
    const allMembers=Object.keys(CHURCHES).flatMap(cid=>(loginTeam==="louange"?st.members:(st[loginTeam+"Members"]||{}))[cid]||[]);
    const seen=new Set();
    const uniqueMembers=allMembers.filter(m=>{if(seen.has(m.id))return false;seen.add(m.id);return true;});
    const m=uniqueMembers.find(x=>x.id===loginId);
    if(m){
      if(enteredPin!==(m.pin||"0000")){
        const att=loginAttempts+1;setLoginAttempts(att);
        if(att>=3){setLoginLocked(true);setLoginErr("Compte bloqué 30s après 3 tentatives.");setTimeout(()=>{setLoginLocked(false);setLoginAttempts(0);setLoginErr("");},30000);}
        else setLoginErr(`Code PIN incorrect. ${3-att} tentative(s) restante(s).`);
        setLoginPin(["","","",""]);
      }else{
        const userData=buildUserData(m,loginTeam);
        window.__jclcMemberPin=(m.pin||"0000");
        setUser({...userData,loginTime:Date.now()});localStorage.setItem("jclc_user",JSON.stringify({...userData,loginTime:Date.now()}));
        setLoginPin(["","","",""]);setLoginAttempts(0);setTab("accueil");
      }
      return;
    }
    setLoginErr("Compte introuvable. Vérifiez votre prénom.");
  }

  const isAdminLogin=loginTeam==="louange"&&(loginId==="admin"||loginId==="pasteur");
  const LT=TEAMS[loginTeam]||null; // équipe de connexion (null = louange)
  const switchLoginTeam=t=>{setLoginTeam(t);setLoginSearch("");setLoginId("admin");setLoginPwd("");setLoginPin(["","","",""]);setLoginErr("");setLoginAttempts(0);};
  const pinRefs=[useRef(),useRef(),useRef(),useRef()];

  function handlePinInput(i,val){
    if(!/^\d?$/.test(val))return;
    const np=[...loginPin];np[i]=val;setLoginPin(np);setLoginErr("");
    if(val&&i<3)pinRefs[i+1].current?.focus();
    if(!val&&i>0)pinRefs[i-1].current?.focus();
    if(val&&i===3&&np.every(d=>d!=="")){
      const pin=np.join("");
      const allM=Object.keys(CHURCHES).flatMap(cid=>(loginTeam==="louange"?st.members:(st[loginTeam+"Members"]||{}))[cid]||[]);
      const seen2=new Set();
      const uniqM=allM.filter(m=>{if(seen2.has(m.id))return false;seen2.add(m.id);return true;});
      const m=uniqM.find(x=>x.id===loginId);
      if(m){
        if(pin===(m.pin||"0000")){
          const userData=buildUserData(m,loginTeam);
          window.__jclcMemberPin=(m.pin||"0000");
          setUser(userData);setLoginPin(["","","",""]);setLoginAttempts(0);
          localStorage.setItem("jclc_user",JSON.stringify({...userData,loginTime:Date.now()}));setTab("accueil");
        }else{
          const att=loginAttempts+1;setLoginAttempts(att);
          if(att>=3){setLoginLocked(true);setLoginErr("Compte bloqué 30s.");setTimeout(()=>{setLoginLocked(false);setLoginAttempts(0);setLoginErr("");},30000);}
          else setLoginErr(`Code PIN incorrect. ${3-att} tentative(s) restante(s).`);
          setLoginPin(["","","",""]);setTimeout(()=>pinRefs[0].current?.focus(),50);
        }
      }
    }
  }

  // Toutes les notifications non lues
  const unreadNotifs=st.memberNotifications?.filter(n=>!n.seen)||[];

  // ─── ÉCRAN LOGIN ───
  if(!user) return(
    <>
      <style>{CSS}</style>
      <div className="login">
        <div className="lcard">
          <img src={LOGO_B64} alt="JCLC" style={{width:88,height:88,objectFit:"contain",filter:"drop-shadow(0 4px 20px rgba(255,170,0,.4))",marginBottom:18}}/>
          <div className="ltitle">Louange, Technique<br/>& Communication</div>
          <div className="lsub">Jésus-Christ Le Chemin</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,margin:"4px auto 10px",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,
            background:LT?LT.login.badgeBg:"rgba(245,158,11,.15)",color:LT?LT.login.fg:"#FCD34D",border:`1px solid ${LT?LT.login.border:"rgba(252,211,77,.3)"}`}}>
            {LT?`${LT.icon} ${LT.login.label}`:"🎵 Connexion Louange"}
          </div>

          <label className="llabel" style={{marginTop:8}}>Votre prénom</label>
          <input className="lsel" type="text" placeholder="Tapez votre prénom..." value={loginSearch||""} autoComplete="off"
            onChange={e=>{setLoginSearch(e.target.value);setLoginId("admin");setLoginErr("");setLoginPwd("");setLoginPin(["","","",""]);setLoginAttempts(0);}}
            style={{marginBottom:8}}/>

          {loginSearch&&loginSearch.length>=2&&(()=>{
            const q=loginSearch.toLowerCase();
            const specials=LT?[]:[
              {id:"admin",name:"Administrateur",role:"admin",church:"both"},
              {id:"pasteur",name:"Pasteur Alexandre",role:"pasteur",church:"both"}
            ].filter(s=>s.name.toLowerCase().includes(q));
            const allMembers=Object.keys(CHURCHES).flatMap(cid=>(loginTeam==="louange"?st.members:(st[loginTeam+"Members"]||{}))[cid]||[]);
            const seen=new Set();
            const members=allMembers.filter(m=>{if(seen.has(m.id))return false;if(m.name.toLowerCase().includes(q)){seen.add(m.id);return true;}return false;});
            const results=[...specials,...members];
            if(results.length===0)return<div style={{fontSize:12,color:"rgba(255,255,255,.4)",textAlign:"center",marginBottom:10}}>Aucun membre trouvé</div>;
            return(
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12,maxHeight:180,overflowY:"auto"}}>
                {results.map(m=>(
                  <div key={m.id} onClick={()=>{setLoginId(m.id);setLoginSearch(m.name);setLoginErr("");setLoginPin(["","","",""]);setTimeout(()=>pinRefs[0].current?.focus(),100);}}
                    style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",
                      background:loginId===m.id?"rgba(79,70,229,.4)":"rgba(255,255,255,.07)",
                      border:loginId===m.id?"1.5px solid rgba(79,70,229,.7)":"1.5px solid rgba(255,255,255,.1)",
                      transition:"all .15s",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:8,background:"rgba(79,70,229,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#a5b4fc",flexShrink:0}}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:"#fff"}}>{m.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{m.role==="admin"?"Administrateur":m.role==="pasteur"?"Pasteur":LT?(isRespTeamMember(m,LT)?LT.resp:teamPosts(m,LT).join(" · ")):m.role||""}</div>
                    </div>
                    {loginId===m.id&&<div style={{marginLeft:"auto",color:"#a5b4fc",fontSize:16}}>✓</div>}
                  </div>
                ))}
              </div>
            );
          })()}

          {isAdminLogin?(
            <div style={{marginBottom:14}}>
              <label className="llabel">Mot de passe</label>
              <div style={{position:"relative"}}>
                {sessionExpired&&<div className="ib amb" style={{marginBottom:12,textAlign:"center"}}>⏱️ Session expirée après 8h. Veuillez vous reconnecter.</div>}
                <input className="lsel" type={showPwd?"text":"password"} placeholder="••••••••" value={loginPwd}
                  onChange={e=>{setLoginPwd(e.target.value);setLoginErr("");}} onKeyDown={e=>e.key==="Enter"&&login()}
                  disabled={loginLocked} style={{marginBottom:0,paddingRight:46}}/>
                <button onClick={()=>setShowPwd(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,.45)",fontSize:15,cursor:"pointer",padding:4}}>
                  {showPwd?"👁️‍🗨️":"👁️"}
                </button>
              </div>
            </div>
          ):loginId&&loginId!=="admin"&&loginId!=="pasteur"?(
            <div style={{marginBottom:14}}>
              <label className="llabel">Code PIN à 4 chiffres</label>
              <div style={{display:"flex",gap:10,justifyContent:"center",margin:"8px 0"}}>
                {loginPin.map((digit,i)=>(
                  <input key={i} ref={pinRefs[i]} type="password" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e=>handlePinInput(i,e.target.value)}
                    onKeyDown={e=>{if(e.key==="Backspace"&&!digit&&i>0)pinRefs[i-1].current?.focus();if(e.key==="Enter"&&i===3)login();}}
                    disabled={loginLocked}
                    style={{width:54,height:58,textAlign:"center",fontSize:24,fontWeight:800,background:digit?"rgba(79,70,229,.3)":"rgba(255,255,255,.08)",border:`2px solid ${digit?"rgba(79,70,229,.7)":"rgba(255,255,255,.15)"}`,borderRadius:12,color:"#fff",outline:"none",transition:"all .15s",caretColor:"transparent"}}
                  />
                ))}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.25)",textAlign:"center"}}>Code PIN fourni par l'administrateur</div>
            </div>
          ):null}

          {loginAttempts>0&&!loginLocked&&(
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:10}}>
              {[1,2,3].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<=loginAttempts?"#EF4444":"rgba(255,255,255,.2)",transition:"background .2s"}}/>)}
            </div>
          )}

          {loginErr&&<div style={{background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.35)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#FCA5A5",marginBottom:12,textAlign:"center",lineHeight:1.5}}>⚠️ {loginErr}</div>}

          <button className="lbtn" onClick={login} disabled={loginLocked||(isAdminLogin?!loginPwd:loginPin.some(d=>d===""))}>
            {loginLocked?"⏳ Bloqué temporairement…":"Se connecter →"}
          </button>

          {Object.keys(CHURCHES).every(cid=>(st.members[cid]||[]).length===0)&&(
            <p className="lnote" style={{marginTop:10}}>Les membres apparaissent après ajout par l'administrateur</p>
          )}

          <div style={{display:"flex",alignItems:"center",gap:10,margin:"22px 0 12px"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.12)"}}/>
            <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Vous êtes d'une autre équipe ?</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.12)"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[{id:"louange",icon:"🎵",label:"Connexion Louange",bg:"rgba(245,158,11,.12)",border:"rgba(245,158,11,.45)",fg:"#FCD34D"},
              ...TEAM_IDS.map(id=>({id,icon:TEAMS[id].icon,...TEAMS[id].login}))].filter(o=>o.id!==loginTeam).map(o=>(
              <button key={o.id} onClick={()=>switchLoginTeam(o.id)}
                style={{width:"100%",padding:"13px",borderRadius:14,cursor:"pointer",fontSize:14,fontWeight:800,letterSpacing:.2,transition:"all .2s",
                  background:o.bg,border:`1.5px solid ${o.border}`,color:o.fg}}>
                {o.icon} {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ─── TABS & ROUTING ───
  const tabs = isTech
    ? [{id:"accueil",l:"Accueil",i:"🏠"},{id:"tech-mon-planning",l:"Mon planning",i:"⭐"},{id:"tech-dispos",l:"Disponibilités",i:"📅"},
       ...(isRespTech?[{id:"tech-planning",l:"Planification",i:"📋"},{id:"tech-membres",l:userTeam.teamName,i:"👥"},{id:"louange-consult",l:"Louange",i:"🎵"}]:[])]
    : isAdmin
    ? [{id:"accueil",l:"Accueil",i:"🏠"},{id:"membres",l:"Membres",i:"👥"},{id:"permissions",l:"Permissions",i:"🔑"},{id:"disponibilites",l:"Disponibilités",i:"📅"},{id:"planning",l:"Planification",i:"📋"},{id:"calendrier",l:"Calendrier",i:"🗓️"},{id:"bibliotheque",l:"Bibliothèque",i:"🎵"},{id:"programmes",l:"Programmes",i:"📄"},{id:"repetition",l:"Répétition",i:"🎼"},{id:"pasteurs",l:"Pasteurs",i:"🙏"},{id:"statistiques",l:"Statistiques",i:"📊"},{id:"technique",l:"Technique",i:"🎛️"},{id:"communication",l:"Communication",i:"📸"},{id:"faq",l:"FAQ",i:"❓"}]
    : isMusicien
    ? [{id:"accueil",l:"Accueil",i:"🏠"},{id:"musicien",l:"Musicien",i:"🎸"},{id:"mon-planning",l:"Mon planning",i:"⭐"},{id:"disponibilites",l:"Disponibilités",i:"📅"},{id:"bibliotheque",l:"Chants",i:"🎵"},...(user.canEditProg?[{id:"programmes",l:"Programmes",i:"📄"}]:[]),...(user.canEditProg?[{id:"repetition",l:"Répétition",i:"🎼"}]:[]),...(user.canEditProg?[{id:"pasteurs",l:"Pasteurs",i:"🙏"}]:[]),{id:"faq",l:"FAQ",i:"❓"},{id:"chantres",l:"Chantres",i:"🎤"},...(user.role==="Pianiste"?[{id:"piano",l:"Piano",i:"🎹"}]:[])]
    : [{id:"accueil",l:"Accueil",i:"🏠"},{id:"mon-planning",l:"Mon planning",i:"⭐"},{id:"disponibilites",l:"Disponibilités",i:"📅"},{id:"bibliotheque",l:"Chants",i:"🎵"},...(user.canEditProg?[{id:"programmes",l:"Programmes",i:"📄"}]:[]),...(user.canEditProg?[{id:"repetition",l:"Répétition",i:"🎼"}]:[]),...(user.canEditProg?[{id:"pasteurs",l:"Pasteurs",i:"🙏"}]:[]),{id:"faq",l:"FAQ",i:"❓"},{id:"chantres",l:"Chantres",i:"🎤"}];

  const pillCls=isTech?userTeam.pill:user.role==="admin"?"pill-admin":user.role==="pasteur"?"pill-pasteur":user.canEditLib?"pill-bib":user.role==="Directeur Musical (DM)"?"pill-dm":"pill-member";

  const M={
    addMember:(cid)=>setModal({t:"addMember",cid}),
    editMember:(cid,m)=>setModal({t:"editMember",cid,m}),
    assign:(cid,d,date,type)=>setModal({t:"assign",cid,d,date,type}),
    selectService:(cid,d,date)=>setModal({t:"selectService",cid,d,date}),
    viewSong:(s)=>setModal({t:"viewSong",s}),
    addSong:()=>setModal({t:"addSong"}),
    editSong:(s)=>setModal({t:"editSong",s}),
    importSong:()=>setModal({t:"importSong"}),
    addProg:(cid)=>setModal({t:"addProg",cid}),
    editProg:(p)=>setModal({t:"editProg",p}),
    viewProg:(p)=>setModal({t:"viewProg",p}),
    flyer:(p)=>setModal({t:"flyer",p}),
    memberNotif:(n)=>setModal({t:"memberNotif",n}),
  };

  return(
    <>
      <style>{CSS}</style>
      <div className="app" {...swipe}>
        {showFlyerModal&&<FlyerModal church={showFlyerModal} st={st} month={month} year={year} onClose={()=>setShowFlyerModal(null)}/>}
      {toast&&<div className="toast">{toast.icon} {toast.msg}</div>}

        {modal&&(
          <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
            {modal.t==="addMember"  &&<MemberModal churchId={modal.cid} onSave={m=>{addMember(modal.cid,m);setModal(null);}} onClose={()=>setModal(null)}/>}
            {modal.t==="editMember" &&<MemberModal churchId={modal.cid} member={modal.m} onSave={m=>{editMember(modal.cid,m);setModal(null);}} onClose={()=>setModal(null)}/>}
            {modal.t==="assign"     &&<AssignModal cid={modal.cid} d={modal.d} date={modal.date} type={modal.type} members={st.members[modal.cid]} isAvail={isAvail} assigned={st.plans[modal.cid][modal.d]||[]} onSave={ids=>{assignDate(modal.cid,modal.d,ids);setModal(null);toast_("Assignation sauvegardée","📋");}} onClose={()=>setModal(null)}/>}
            {modal.t==="selectService"&&<SelectServiceModal cid={modal.cid} d={modal.d} date={modal.date} members={st.members[modal.cid]} assigned={st.plans[modal.cid][modal.d]||[]} selected={st.planService[modal.cid]?.[modal.d]||[]} leadId={st.planLead?.[modal.cid]?.[modal.d]||null} onSave={(ids,leadId)=>{setServiceMembers(modal.cid,modal.d,ids,leadId);setModal(null);toast_("Membres de service sélectionnés","✅");}} onClose={()=>setModal(null)}/>}
            {modal.t==="viewSong"   &&<SongViewModal song={modal.s} onSave={s=>{editSong(s);}} onClose={()=>setModal(null)}/>}
            {modal.t==="addSong"    &&<SongFormModal onSave={s=>{addSong(s);setModal(null);}} onClose={()=>setModal(null)}/>}
            {modal.t==="editSong"   &&<SongFormModal song={modal.s} onSave={s=>{editSong(s);setModal(null);}} onClose={()=>setModal(null)}/>}
            {modal.t==="importSong" &&<ImportSongModal onSave={s=>{addSong(s);toast_("Chant importé !","📥");}} onSaveMany={songs=>{songs.forEach(s=>addSong(s));setModal(null);toast_(`${songs.length} chant(s) importé(s) !`,"📥");}} onClose={()=>setModal(null)}/>}
            {modal.t==="addProg"    &&<ProgramFormModal songs={st.songs} churchId={modal.cid||myChurch2} onSave={p=>{addProg(p);setModal(null);}} onClose={()=>setModal(null)}/>}
            {modal.t==="editProg"   &&<ProgramFormModal songs={st.songs} churchId={myChurch2} program={modal.p} onSave={p=>{editProg(p);setModal(null);}} onClose={()=>setModal(null)}/>}
            {modal.t==="viewProg"   &&<ProgramViewModal program={modal.p} songs={st.songs} onClose={()=>setModal(null)}/>}
            {modal.t==="flyer"      &&<FlyerModal program={modal.p} st={st} onClose={()=>setModal(null)}/>}
            {modal.t==="memberNotif"&&<MemberNotifModal notif={modal.n} onClose={()=>{upd(s=>{const n=s.memberNotifications.find(x=>x.id===modal.n.id);if(n)n.seen=true;});setModal(null);}}/>}
          </div>
        )}
        {changePinModal&&<ChangePinModal user={user} onSave={changePin} onClose={()=>setChangePinModal(false)}/>}

        <header className="hdr">
          <div className="hbrand">
            <img src={LOGO_B64} alt="JCLC"/>
            <div className="hbrand-t">
              <span className="hbrand-n">Louange, Technique & Communication</span>
              <span className="hbrand-s">Jésus-Christ Le Chemin</span>
            </div>
          </div>
          <div className="hrgt">
            {unreadNotifs.length>0&&isAdmin&&(
              <button className="btn btn-amb btn-sm" onClick={()=>M.memberNotif(unreadNotifs[0])} style={{position:"relative"}}>
                🔔 {unreadNotifs.length} nouveau{unreadNotifs.length>1?"x":""}
              </button>
            )}
            <span className="husr">{user.name}</span>
            <span className={`pill ${pillCls}`}>{isTech?(isRespTech?userTeam.respShort:userTeam.label):user.role==="admin"?"Admin":user.role==="pasteur"?"Pasteur":user.canEditLib?"Bibliothèque":user.role==="Directeur Musical (DM)"?"DM":"Membre"}</span>
            {user.role!=="admin"&&user.role!=="pasteur"&&<button className="btn btn-g btn-sm" title="Changer mon code PIN" onClick={()=>setChangePinModal(true)}>🔐 PIN</button>}
            <button className="btn btn-g btn-sm" onClick={()=>{setUser(null);localStorage.removeItem("jclc_user");}}>Déconnexion</button>
          </div>
        </header>

        <nav className="nav">{tabs.map(t=><button key={t.id} className={`nbtn${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.i} {t.l}</button>)}</nav>
        {hasChurch2&&(
          <div style={{display:"flex",gap:6,padding:"6px 16px",background:"var(--sur2)",borderBottom:"1px solid var(--bdr)"}}>
            <span style={{fontSize:11,color:"var(--txt3)",alignSelf:"center"}}>Assemblée :</span>
            {[user.church,...myOtherChurches].map(cid=>(
              <button key={cid} className={`btn btn-xs ${myChurch2===cid?"btn-p":"btn-g"}`} onClick={()=>setActiveChurch2(cid)}>
                {CHURCHES[cid]?.name}
              </button>
            ))}
          </div>
        )}

        <main className="main">
          {!appLoaded&&user&&<SkeletonLoader/>}
          {isAdmin&&["disponibilites","planning","calendrier","programmes","statistiques"].includes(tab)&&(
            <div className="csw">
              {Object.values(CHURCHES).map(c=>(
                <button key={c.id} className={`cswb${church===c.id?" "+c.id:""}`} onClick={()=>setChurch(c.id)}>
                  <span className="cswb-dot" style={{background:c.color}}/>
                  {c.fullName}
                  <span style={{fontSize:11,opacity:.55,marginLeft:2}}>· {c.dayLabel}</span>
                  <span className="cswb-cnt">{st.members[c.id].length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="tab-content">
          {tab==="accueil"       &&isTech&&<TechAccueilTab T={userTeam} user={user} st={st} verset={verset} onGo={setTab}/>}
          {tab==="tech-mon-planning"&&isTech&&<TechMonPlanningTab T={userTeam} user={user} st={st}/>}
          {tab==="tech-dispos"   &&isTech&&<TechDispoTab T={userTeam} user={user} st={st} church={userTeam.churches.includes(myChurch2)?myChurch2:(memberChurches(user).find(c=>userTeam.churches.includes(c))||userTeam.churches[0])} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} A={teamActions[userTeam.id]} toast_={toast_}/>}
          {tab==="tech-planning" &&isRespTech&&<TechPlanningTab T={userTeam} st={st} canEdit={true} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} A={teamActions[userTeam.id]}/>}
          {tab==="tech-membres"  &&isRespTech&&<TechMembresTab T={userTeam} st={st} canSetResp={false} A={teamActions[userTeam.id]}/>}
          {tab==="louange-consult"&&isRespTech&&<LouangeConsultTab st={st} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth}/>}
          {tab==="technique"     &&isAdmin&&<AdminTechTab T={TEAMS.tech} st={st} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} A={teamActions.tech}/>}
          {tab==="communication" &&isAdmin&&<AdminTechTab T={TEAMS.com} st={st} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} A={teamActions.com}/>}
          {tab==="accueil"       &&!isTech&&<AccueilTab user={user} isAdmin={isAdmin} st={st} verset={verset} showNotifBanner={showNotifBanner} onDismissNotif={()=>setNotifDismissed(true)} onGoDispos={()=>setTab("disponibilites")} month={month} year={year} prevMonth={prevMonth} nextMonth={nextMonth} church={myChurch}/>}
          {tab==="membres"       &&isAdmin&&<MembresTab st={st} M={M} deleteMember={deleteMember}/>}
          {tab==="permissions"   &&isAdmin&&<PermissionsTab st={st} toggleLib={toggleLib} toggleProg={toggleProg}/>}
          {tab==="mon-planning"  &&!isAdmin&&<MonPlanningTab user={user} st={st} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} activeChurch={myChurch2}/>}
          {tab==="musicien"      &&<MusicienTab user={user} st={st} church={myChurch2}/>}
          {tab==="disponibilites"&&<DispoTab user={user} isAdmin={isAdmin} st={st} church={myChurch2} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} toggleAvail={toggleAvail} isAvail={isAvail} toast_={toast_} sendDispo={sendDispo}/>}
          {tab==="planning"      &&isAdmin&&<PlanningTab st={st} church={church} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} isAvail={isAvail} M={M} validate={validate} unvalidate={unvalidate}/>}
          {tab==="calendrier"    &&<CalendarTab user={user} isAdmin={isAdmin} church={myChurch2} st={st} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth}/>}

          {tab==="bibliotheque"  &&<BibliothèqueTab st={st} canManage={canSongs} M={M} deleteSong={deleteSong}/>}
          {tab==="programmes"    &&canProgs&&<ProgrammesTab st={st} church={isAdmin?church:(user?.church||"creil")} churches={isAdmin?[]:myOtherChurches} M={M} deleteProg={deleteProg} archiveProg={archiveProg} duplicateProg={duplicateProg}/>}
          {tab==="statistiques"  &&isAdmin&&<StatistiquesTab st={st} church={church}/>}
          {tab==="faq"           &&<FAQTab isAdmin={isAdmin}/>}
          {tab==="chantres"       &&<ChantresTab/>}
          {tab==="piano"          &&<PianoTab user={user}/>}
          {tab==="repetition"    &&<RepetitionTab st={st} church={myChurch2} isAdmin={isAdmin} user={user}/>
          }{tab==="pasteurs"      &&(canProgs||isAdmin)&&<PasteursTab st={st} user={user}/>}
          </div>
        </main>

        <BottomNav tabs={tabs} tab={tab} setTab={setTab}/>
      </div>
    </>
  );
}
