import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, MONTHS } from "../config";
import { fmt, getTeamDates, teamPosts, techKey } from "../lib/helpers";
import { TechFlyerModal } from "./TeamFlyerModal";
import { TechChurchSwitch, TechEvTag, TechMonthNav, findTechMember, teamPostIcon, teamPostsForEv, techMonthKey } from "./teamCommon";

// ── Modal d'affectation technique ──
export function TechAssignModal({T,cid,d,date,ev,members,avail,assign,onSave,onClose}){
  const ch=CHURCHES[cid];
  const [sel,setSel]=useState({...(assign||{})});
  const evPosts=teamPostsForEv(T,ev);
  const postesFor=m=>{const ps=teamPosts(m,T).filter(p=>evPosts.includes(p));return ps.length?ps:evPosts;};
  const toggle=m=>setSel(s=>{const n={...s};if(n[m.id])delete n[m.id];else{const ps=postesFor(m);const regieTaken=Object.values(n).includes(T.required);n[m.id]=(!regieTaken&&ps.includes(T.required))?T.required:(ps.find(p=>p!==T.required)||ps[0]);}return n;});
  const isAv=m=>!!avail[m.id]?.[techKey(cid,d)];
  const sorted=[...members].sort((a,b)=>(isAv(b)-isAv(a))||a.name.localeCompare(b.name));
  const allPostes=evPosts;
  return(
    <div className="modal">
      <div className="modal-t">{T.icon} {T.teamName}</div>
      <div className="modal-s">{fmt(date)} · {ev.icon} {ev.label} · {ch.fullName}</div>
      {members.length===0&&<div className="ib amb">Aucun membre dans cette assemblée. Ajoutez-les dans « {T.teamName} ».</div>}
      {sorted.map(m=>{
        const on=!!sel[m.id],av=isAv(m);
        return(
          <div key={m.id} className="assign-row" style={{opacity:av||on?1:.6}} onClick={()=>toggle(m)}>
            <div className={`assign-chk${on?" on":""}`}>{on&&"✓"}</div>
            <div className="mav" style={{background:av?ch.bg:"var(--sur2)",color:av?ch.color:"var(--txt3)",width:32,height:32,fontSize:12}}>{m.name.charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13}}>{m.name}</div>
              <div style={{fontSize:11,color:av?"var(--grn)":"var(--txt3)"}}>{av?"✓ Disponible":"Non disponible / non renseigné"}</div>
            </div>
            {on&&(
              <select className="inp" style={{width:"auto",padding:"4px 8px",fontSize:12}} value={sel[m.id]} onClick={e=>e.stopPropagation()} onChange={e=>{const v=e.target.value;setSel(s=>({...s,[m.id]:v}));}}>
                {allPostes.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>
        );
      })}
      {Object.keys(sel).length>0&&!Object.values(sel).includes(T.required)&&<div className="ib amb" style={{marginTop:10}}>⚠️ Personne n'est encore au poste <strong>{T.required}</strong> pour cette date.</div>}
      <div className="flex-end"><button className="btn btn-g" onClick={onClose}>Annuler</button><button className="btn btn-p" onClick={()=>onSave(sel)}>Confirmer ({Object.keys(sel).length}) →</button></div>
    </div>
  );
}

// ── Planification technique (responsable : édition · admin : consultation) ──
export function TechPlanningTab({T,st,canEdit,year,month,prevMonth,nextMonth,A}){
  const [cid,setCid]=useState(T.churches[0]);
  const [modal,setModal]=useState(null);
  const [showFlyer,setShowFlyer]=useState(false);
  const ch=CHURCHES[cid];
  const members=st[T.id+"Members"]?.[cid]||[];
  const plan=st[T.id+"Plans"]?.[cid]||{};
  const dates=getTeamDates(T,year,month,cid);
  const mk=techMonthKey(year,month);
  const validated=!!st[T.id+"Validated"]?.[cid]?.[mk];
  const planned=dates.filter(x=>Object.keys(plan[x.d]||{}).length>0).length;
  const sentCnt=members.filter(m=>st[T.id+"DispoSent"]?.[m.id]?.[techKey(cid,mk)]).length;
  const nameOf=id=>{const m=members.find(x=>x.id===id)||findTechMember(T,st,id);return m?m.name.split(" ")[0]:"?";};
  function share(){
    const lines=[`${T.icon} *${T.planTitle} ${ch.name} — ${MONTHS[month]} ${year}*`,""];
    dates.forEach(({date,d,ev})=>{const a=plan[d]||{};const ids=Object.keys(a);lines.push(`${ev.icon} ${date.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})} — ${ev.label} : ${ids.length?ids.map(id=>`${nameOf(id)} (${a[id]})`).join(", "):"—"}`);});
    lines.push("","_JCLC — Jésus-Christ Le Chemin_");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
  }
  return(
    <div>
      {modal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <TechAssignModal T={T} cid={cid} d={modal.d} date={modal.date} ev={modal.ev} members={members} avail={st[T.id+"Avail"]||{}} assign={plan[modal.d]}
            onSave={a=>{A.setAssign(cid,modal.d,a);setModal(null);}} onClose={()=>setModal(null)}/>
        </div>
      )}
      {T.churches.length>1&&<TechChurchSwitch T={T} value={cid} onChange={setCid} st={st}/>}
      <div className="ph">
        <div><div className="pt">{T.label} · {ch.fullName}</div><div className="ps">{canEdit?"Cliquez sur « Assigner » pour composer l'équipe":`Consultation · ${T.planTitle}`}</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span className={`bdg ${validated?"bdg-val":"bdg-draft"}`}><span className="bdg-dot"/>{validated?"Validé":"Brouillon"}</span>
          {canEdit&&(validated
            ?<button className="btn btn-g btn-sm" onClick={()=>A.setValidated(cid,mk,false)}>Modifier</button>
            :<button className="btn btn-grn" onClick={()=>A.setValidated(cid,mk,true)}>✓ Valider</button>)}
          <button className="btn btn-p btn-sm" onClick={()=>setShowFlyer(true)}>🖼️ Flyer</button>
          <button className="btn btn-g btn-sm" onClick={share}>📲 WhatsApp</button>
          {showFlyer&&<TechFlyerModal T={T} cid={cid} st={st} month={month} year={year} onClose={()=>setShowFlyer(false)}/>}
        </div>
      </div>
      <div className="stats">
        <div className="stat"><div className="statn">{members.length}</div><div className="statl">Membres</div></div>
        <div className="stat"><div className="statn">{dates.length}</div><div className="statl">Dates ce mois</div></div>
        <div className="stat"><div className="statn" style={{color:ch.color}}>{planned}</div><div className="statl">Planifiées</div></div>
        <div className="stat"><div className="statn" style={{color:"var(--grn)"}}>{sentCnt}</div><div className="statl">Dispos reçues</div></div>
      </div>
      <TechMonthNav year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth}/>
      <div className="card">
        {dates.length===0?<div className="empty"><div className="empty-icon">📭</div><div>Aucune date ce mois-ci</div></div>
        :dates.map(({date,d,ev})=>{
          const a=plan[d]||{},ids=Object.keys(a);
          const availCnt=members.filter(m=>st[T.id+"Avail"]?.[m.id]?.[techKey(cid,d)]).length;
          return(
            <div key={d+ev.type} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,marginBottom:6,background:"var(--sur2)",border:`1.5px solid ${ids.length?(T.evColors[ev.type]||ch.color):"transparent"}`,flexWrap:"wrap"}}>
              <div style={{flex:"0 0 170px"}}><div style={{fontWeight:600,fontSize:13}}>{fmt(date)}</div><TechEvTag T={T} ev={ev}/></div>
              <div style={{flex:1,display:"flex",gap:5,flexWrap:"wrap",minWidth:140}}>
                {ids.length?ids.map(id=><span key={id} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:T.postChip[a[id]]?.bg||T.chipBg,color:T.postChip[a[id]]?.fg||T.chipFg}}>{teamPostIcon(T,a[id])} {nameOf(id)} · {a[id]}</span>)
                :<span style={{fontSize:12,color:"var(--txt3)"}}>Non planifié</span>}
                {ids.length>0&&!ids.some(id=>a[id]===T.required)&&<span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:"#FEE2E2",color:"#B91C1C"}}>⚠️ {T.required} à pourvoir</span>}
              </div>
              <span style={{fontSize:11,color:availCnt?"var(--grn)":"var(--txt3)",fontWeight:600}}>{availCnt} dispo(s)</span>
              {canEdit&&!validated&&<button className="btn btn-g btn-xs" onClick={()=>setModal({d,date,ev})}>Assigner</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
