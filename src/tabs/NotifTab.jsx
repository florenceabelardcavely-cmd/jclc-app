import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";
import { fmtSh } from "../lib/helpers";

// ══════════════════════════════════════════════════
//  NOTIFICATIONS TAB
// ══════════════════════════════════════════════════
export function NotifTab({st,church,sendNotifs}){
  const ch=CHURCHES[church];
  const [method,setMethod]=useState("both");
  const plan=st.plans[church],members=st.members[church],status=st.planStatus[church];
  const assignments=Object.entries(plan).flatMap(([d,ids])=>(ids||[]).map(id=>({d,member:members.find(m=>m.id===id)}))).filter(a=>a.member);
  const sent=st.notifLog.filter(n=>n.church===ch.fullName);
  return(
    <div>
      <div className="pt" style={{marginBottom:2}}>Notifications</div>
      <div className="ps" style={{marginBottom:16}}>{ch.fullName} · Envoi des rappels de service</div>
      {status!=="validated"&&<div className="ib amb">⚠️ Validez d'abord le planning avant d'envoyer les notifications.</div>}
      <div className="card">
        <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Méthode d'envoi</div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[{v:"email",l:"✉️ Email"},{v:"sms",l:"📱 SMS"},{v:"both",l:"✉️📱 Email + SMS"}].map(o=>(
            <button key={o.v} className="btn btn-sm" style={{background:method===o.v?ch.color:"var(--sur2)",color:method===o.v?"#fff":"var(--txt)",border:`1.5px solid ${method===o.v?ch.color:"var(--bdr)"}`}} onClick={()=>setMethod(o.v)}>{o.l}</button>
          ))}
        </div>
        <div className="divider" style={{marginTop:0}}/>
        {assignments.length===0?<div className="empty"><div className="empty-icon">📭</div><div>Aucun membre assigné</div></div>
        :<div className="scroll-list">{assignments.map(({d,member},i)=>{
          const[y,m,dd]=d.split("-").map(Number),date=new Date(y,m,dd),wasSent=sent.some(n=>n.member===member.name);
          return(<div className="mrow" key={i}>
            <div className="mav" style={{background:ch.bg,color:ch.color}}>{member.name.charAt(0)}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{member.name}</div><div style={{fontSize:11,color:"var(--txt2)"}}>{member.email&&`✉ ${member.email}`}{member.email&&member.phone&&" · "}{member.phone&&`📱 ${member.phone}`}</div></div>
            <span style={{fontSize:11,color:"var(--txt2)",flexShrink:0}}>{fmtSh(date)}</span>
            <span className={`bdg ${wasSent?"bdg-val":"bdg-draft"}`}>{wasSent?"✓ Envoyée":"En attente"}</span>
          </div>);
        })}</div>}
        <div className="flex-end"><button className="btn btn-p" disabled={status!=="validated"||!assignments.length} onClick={()=>sendNotifs(church,method)}>📨 Envoyer ({assignments.length})</button></div>
      </div>
      {sent.length>0&&<div className="card"><div className="card-t">Historique</div><div className="card-s">{sent.length} envoi(s)</div><div className="scroll-list">{sent.map(n=><div className="notif-row" key={n.id}><span style={{fontSize:18}}>{n.method==="email"?"✉️":n.method==="sms"?"📱":"✉️📱"}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{n.member}</div><div style={{fontSize:11,color:"var(--txt2)"}}>{n.email}{n.email&&n.phone&&" · "}{n.phone}</div></div><div style={{textAlign:"right"}}><span className="bdg bdg-val">Envoyée</span><div style={{fontSize:10,color:"var(--txt3)",marginTop:2}}>{n.sent}</div></div></div>)}</div></div>}
    </div>
  );
}
