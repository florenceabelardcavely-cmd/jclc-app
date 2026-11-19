import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, MONTHS } from "../config";
import { dk, fmt, getDates, getTypeCls, getTypeLabel } from "../lib/helpers";

// ══════════════════════════════════════════════════
//  DISPO TAB
// ══════════════════════════════════════════════════
export function DispoTab({user,isAdmin,st,church,year,month,prevMonth,nextMonth,toggleAvail,isAvail,toast_,sendDispo}){
  const ch=CHURCHES[church];
  const [selId,setSelId]=useState(null);
  const members=st.members[church];
  const displayMember=isAdmin?members.find(m=>m.id===selId)||null:members.find(m=>m.id===user.id)||null;
  const dates=getDates(year,month,church);
  const monthKey=`${year}-${String(month+1).padStart(2,"0")}`;
  const hasCheckedThisMonth=displayMember&&dates.some(({date})=>isAvail(displayMember.id,dk(date)));
  const isSent=displayMember&&!!st.dispoSent[displayMember.id]?.[monthKey];
  return(
    <div>
      <div className="ph"><div><div className="pt">Disponibilités</div><div className="ps">{isAdmin?`Vue globale — ${ch.fullName}`:`${ch.fullName} · ${ch.dayLabel}`}</div></div></div>
      <div className="mnav">
        <button className="btn btn-g btn-sm" onClick={prevMonth}>←</button>
        <span className="mnavt">{MONTHS[month]} {year}</span>
        <button className="btn btn-g btn-sm" onClick={nextMonth}>→</button>
      </div>
      <div style={{display:"flex",gap:16}} className="dispo-layout">
        {isAdmin&&(
          <div style={{width:200,flexShrink:0}} className="dispo-sidebar">
            <div className="card" style={{padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:10}}>Membres</div>
              {members.length===0?<div style={{fontSize:12,color:"var(--txt3)",textAlign:"center",padding:"14px 0"}}>Aucun membre</div>
              :<div className="scroll-list" style={{maxHeight:440}}>
                {members.map(m=>{
                  const cnt=dates.filter(({date})=>isAvail(m.id,dk(date))).length;
                  const sent=!!st.dispoSent[m.id]?.[monthKey];
                  const sel=selId===m.id;
                  return(<div key={m.id} style={{padding:"9px 11px",borderRadius:8,marginBottom:4,cursor:"pointer",background:sel?ch.bg:"var(--sur2)",border:`1.5px solid ${sel?ch.color:"transparent"}`,color:sel?ch.color:"var(--txt)",transition:"all .12s"}} onClick={()=>setSelId(m.id)}>
                    <div style={{fontWeight:600,fontSize:13}}>{m.name}</div>
                    <div style={{fontSize:11,color:sel?ch.color:"var(--txt2)"}}>{m.role}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                      <span style={{fontSize:10,color:cnt>0?"var(--grn)":"var(--txt3)",fontWeight:600}}>{cnt>0?`✓ ${cnt} dispo(s)`:"Aucune dispo saisie"}</span>
                      {cnt>0&&<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:8,background:sent?"#ECFDF5":"#FFFBEB",color:sent?"#065F46":"#92400E"}}>{sent?"✅ Transmis":"🕒 En attente"}</span>}
                    </div>
                  </div>);
                })}
              </div>}
            </div>
          </div>
        )}
        <div style={{flex:1}}>
          {displayMember?(
            <div className="card">
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:ch.bg,color:ch.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{displayMember.name.charAt(0)}</div>
                <div><div style={{fontWeight:700,fontSize:15}}>{displayMember.name}</div><div style={{fontSize:12,color:"var(--txt2)"}}>{displayMember.role}</div></div>
              </div>
              {!isAdmin&&<div className="ib ind" style={{marginBottom:14}}>💡 Cochez les dates de service où vous êtes disponible pour <strong>{MONTHS[month]}</strong>.</div>}
              {!isAdmin&&hasCheckedThisMonth&&!isSent&&<div className="ib" style={{marginBottom:14,background:"#FFFBEB",color:"#92400E"}}>📤 Pensez à cliquer sur <strong>« Envoyer mes disponibilités »</strong> ci-dessous pour les transmettre au responsable — les cocher ne suffit pas.</div>}
              {!isAdmin&&isSent&&<div className="ib" style={{marginBottom:14,background:"#ECFDF5",color:"#065F46"}}>✅ Disponibilités transmises pour {MONTHS[month]}.</div>}
              {isAdmin&&<div className="ib" style={{marginBottom:14,background:"var(--sur2)",color:"var(--txt2)"}}>🔒 Lecture seule — ces disponibilités sont saisies par le membre et ne peuvent pas être modifiées ici.</div>}
              {dates.length===0?<div className="empty"><div className="empty-icon">📭</div><div>Aucune date ce mois-ci</div></div>
              :dates.map(({date,type})=>{
                const d=dk(date),av=st.avail[displayMember.id]?.[d],on=!!av,ts=av&&typeof av==="object"?av.ts:null;
                return(<div className="arow" key={d} style={isAdmin?{cursor:"default"}:undefined} onClick={()=>{if(isAdmin)return;toggleAvail(displayMember.id,d);if(!on)toast_("Disponibilité enregistrée","📝");}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{fmt(date)}</div>
                    <span className={`atag ${getTypeCls(type)}`}>{getTypeLabel(type)}</span>
                    {isAdmin&&on&&ts&&<span style={{marginLeft:6,fontSize:9,color:"var(--txt3)"}}>saisi le {new Date(ts).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})} à {new Date(ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>}
                  </div>
                  <div className={`chk${on?" on":""}`}>{on&&"✓"}</div>
                </div>);
              })}
              {!isAdmin&&<div className="flex-end" style={{marginTop:18}}><button className="btn btn-p" disabled={!hasCheckedThisMonth} onClick={()=>{sendDispo(displayMember.id,monthKey);toast_("Disponibilités transmises à l'administrateur !","🎉");}}>Envoyer mes disponibilités →</button></div>}
            </div>
          ):<div className="card"><div className="empty"><div className="empty-icon">{isAdmin?"👈":"⚠️"}</div><div>{isAdmin?"Sélectionnez un membre":"Votre fiche n'a pas encore été créée"}</div></div></div>}
        </div>
      </div>
    </div>
  );
}
