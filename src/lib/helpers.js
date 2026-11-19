import { ALL_TEAM_ROLES, CHURCHES, DAYS, MONTHS, TEAMS, TEAM_IDS, VERSETS } from "../config";

export function uid(){return Math.random().toString(36).slice(2,9);}

// Un membre appartient à cid si c'est son assemblée principale, OU si cid figure
// dans sa liste d'assemblées supplémentaires (churches), avec compatibilité
// vers l'ancien champ church2 (une seule assemblée supplémentaire).
export function memberChurches(m){
  if(m.churches&&m.churches.length)return [m.church,...m.churches];
  if(m.church2)return [m.church,m.church2];
  return [m.church];
}

export function memberBelongsTo(m,cid){
  return memberChurches(m).includes(cid);
}

// Équipe(s) d'un membre selon ses rôles : un même membre peut être louange ET technique
export function memberRoles(m){return (m.roles&&m.roles.length?m.roles:[m.role]).filter(Boolean);}

export function isTeamMember(m,T){return memberRoles(m).some(r=>T.roles.includes(r)||r===T.resp);}

export function isLouangeMember(m){const rs=memberRoles(m);return rs.length===0||rs.some(r=>!ALL_TEAM_ROLES.includes(r));}

export function isRespTeamMember(m,T){return memberRoles(m).includes(T.resp);}

export function teamPosts(m,T){return memberRoles(m).filter(r=>T.roles.includes(r));}

// Autres équipes (que T) auxquelles appartient le membre — pour les badges « … aussi »
export function otherTeamLabels(m,T){const out=[];if(isLouangeMember(m))out.push("Louange");TEAM_IDS.forEach(id=>{if(id!==T.id&&isTeamMember(m,TEAMS[id]))out.push(TEAMS[id].label);});return out;}

export function getTeamDates(T,year,month,cid){
  const evs=T.events[cid]||[],out=[];
  const d=new Date(year,month,1);
  while(d.getMonth()===month){
    const dow=d.getDay();
    evs.filter(e=>e.day===dow).forEach(ev=>out.push({date:new Date(d),d:dk(d),ev}));
    d.setDate(d.getDate()+1);
  }
  return out;
}

// Clé de dispo technique : assemblée + date (un membre peut servir à Creil et à Lognes)
export function techKey(cid,d){return cid+"|"+d;}

// Répartit les membres Supabase entre louange et technique, par assemblée
export function splitMembers(mbrs,n){
  const mapM=m=>({...m,canEditLib:m.can_edit_lib||false,canEditProg:m.can_edit_prog||false,roles:m.roles||[m.role]});
  TEAM_IDS.forEach(id=>{if(!n[id+"Members"])n[id+"Members"]={};});
  Object.keys(CHURCHES).forEach(cid=>{
    const cM=mbrs.filter(m=>memberBelongsTo(m,cid)).map(mapM);
    if(cM.length)n.members[cid]=cM.filter(isLouangeMember);
    TEAM_IDS.forEach(id=>{n[id+"Members"][cid]=cM.filter(m=>isTeamMember(m,TEAMS[id]));});
  });
}

// Lignes "plannings" propres à la technique (et drapeau de migration) — ignorées par la louange
export function handleExtraRow(p,n){
  if(p.member_id==="migration")return true;
  TEAM_IDS.forEach(P=>["Plans","Avail","DispoSent","Validated"].forEach(k=>{if(!n[P+k])n[P+k]={};}));
  for(const P of TEAM_IDS){
    if(p.member_id===P&&p.church&&p.date){try{const a=JSON.parse(p.availability||"{}");if(!n[P+"Plans"][p.church])n[P+"Plans"][p.church]={};n[P+"Plans"][p.church][p.date]=a&&typeof a==="object"?a:{};}catch{}return true;}
    if(p.date===P+"_availability"&&p.member_id){try{const a=JSON.parse(p.availability||"{}");if(a&&typeof a==="object")n[P+"Avail"][p.member_id]=a;}catch{}return true;}
    if(p.date===P+"_dispo_sent"&&p.member_id){try{const a=JSON.parse(p.availability||"{}");if(a&&typeof a==="object")n[P+"DispoSent"][p.member_id]=a;}catch{}return true;}
    if(p.date===P+"_validated"&&p.church){try{const a=JSON.parse(p.availability||"{}");if(a&&typeof a==="object")n[P+"Validated"][p.church]=a;}catch{}return true;}
  }
  return false;
}

export function buildUserData(m,team){
  const isMusicien=["Directeur Musical (DM)","Pianiste","Batteur","Bassiste","Guitare sèche","Guitare électrique","Congas"].includes(m.role);
  const cs=memberChurches(m);
  return {id:m.id,name:m.name,role:m.role,church:m.church,church2:cs[1]||null,churches:cs.slice(1),canEditLib:m.canEditLib||false,canEditProg:m.canEditProg||false,roles:m.roles||[m.role],isMusicien,
    team:TEAMS[team]?team:"louange",isRespTech:!!TEAMS[team]&&isRespTeamMember(m,TEAMS[team])};
}

export function dk(d){const mm=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0");return `${d.getFullYear()}-${mm}-${dd}`;}

export function fmt(d){return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;}

export function fmtSh(d){return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`;}

export function getDates(year,month,churchId){
  const ch=CHURCHES[churchId],out=[];
  const d=new Date(year,month,1);
  while(d.getMonth()===month){
    const dow=d.getDay();
    // Services : jours définis dans serviceDays (ou anciens jours avant changement)
    const days=(ch.legacy&&dk(d)<ch.legacy.until)?ch.legacy.serviceDays:ch.serviceDays;
    if(days.includes(dow)){
      const typeMap={6:"sam",3:"mer",0:"dim",2:"mar"};
      out.push({date:new Date(d),type:typeMap[dow]||"serv",isService:true});
    }
    d.setDate(d.getDate()+1);
  }
  return out;
}

export function getTypeLabel(type){
  const m={sam:"Service Samedi",dim:"Service Dimanche",mer:"Service Mercredi",mar:"Service Mardi"};
  return m[type]||"Service";
}

export function getTypeCls(type){
  const m={sam:"t-sam",dim:"t-dim",mer:"t-mer",mar:"t-mar"};
  return m[type]||"t-sam";
}

export function getVersetSemaine(){
  const now=new Date();
  const startOfYear=new Date(now.getFullYear(),0,1);
  const week=Math.floor((now-startOfYear)/(7*24*3600*1000));
  return VERSETS[week%VERSETS.length];
}

export function isPremierDuMois(){return new Date().getDate()===1;}
