import React, { useState, useRef, useEffect } from "react";
import { FlyerModal } from "../components/FlyerModal";
import { CHURCHES, MONTHS } from "../config";
import { dk, fmt, getDates, getTypeCls, getTypeLabel } from "../lib/helpers";

// ══════════════════════════════════════════════════
//  PLANNING TAB
// ══════════════════════════════════════════════════
export function PlanningTab({st,church,year,month,prevMonth,nextMonth,isAvail,M,validate,unvalidate}){
  const ch=CHURCHES[church],plan=st.plans[church],mk=`${year}-${String(month+1).padStart(2,"0")}`,isValidated=st.validatedMonths?.[church]?.[mk]===true,status=isValidated?"validated":"draft",members=st.members[church];
  const [showFlyer,setShowFlyer]=useState(false);
  const dates=getDates(year,month,church);
  const assigned=Object.values(plan).filter(ids=>ids&&ids.length>0).length;
  return(
    <div>
      <div className="ph">
        <div><div className="pt">{ch.fullName}</div><div className="ps">Cliquez sur une date pour assigner les membres</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className={`bdg ${status==="validated"?"bdg-val":"bdg-draft"}`}><span className="bdg-dot"/>{status==="validated"?"Validé":"Brouillon"}</span>
          {status==="draft"?<button className="btn btn-grn" onClick={()=>validate(church,mk)}>✓ Valider</button>:<><button className="btn btn-g btn-sm" onClick={()=>unvalidate(church,mk)}>Modifier</button><button className="btn btn-p btn-sm" onClick={()=>setShowFlyer(true)}>🖼️ Flyer</button></>}{showFlyer&&<FlyerModal church={church} st={st} month={month} year={year} onClose={()=>setShowFlyer(false)}/>}
        </div>
      </div>
      <div className="stats">
        <div className="stat"><div className="statn">{members.length}</div><div className="statl">Membres</div></div>
        <div className="stat"><div className="statn">{dates.length}</div><div className="statl">Dates ce mois</div></div>
        <div className="stat"><div className="statn" style={{color:ch.color}}>{assigned}</div><div className="statl">Planifiées</div></div>
        <div className="stat"><div className="statn" style={{color:"var(--txt3)"}}>{dates.length-assigned}</div><div className="statl">À planifier</div></div>
      </div>
      <div className="mnav">
        <button className="btn btn-g btn-sm" onClick={prevMonth}>←</button>
        <span className="mnavt">{MONTHS[month]} {year}</span>
        <button className="btn btn-g btn-sm" onClick={nextMonth}>→</button>
      </div>
      <div className="card">
        {dates.length===0?<div className="empty"><div className="empty-icon">📭</div><div>Aucune date ce mois-ci</div></div>
        :dates.map(({date,type})=>{
          const d=dk(date),ids=plan[d]||[],availCnt=members.filter(m=>isAvail(m.id,d)).length,isDraft=status==="draft";
          const serviceIds=st.planService[church]?.[d]||[];
          return(<div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,marginBottom:6,background:"var(--sur2)",border:`1.5px solid ${ids.length>0?ch.color:"transparent"}`,transition:"all .15s"}}>
            <div style={{flex:"0 0 160px"}}><div style={{fontWeight:600,fontSize:13}}>{fmt(date)}</div><span className={`atag ${getTypeCls(type)}`}>{getTypeLabel(type)}</span></div>
            <div style={{flex:1,display:"flex",gap:5,flexWrap:"wrap"}}>
              {ids.length>0?ids.map(id=>{const m=members.find(x=>x.id===id);return m?<span key={id} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:st.planLead?.[church]?.[d]===id?"#EAB308":serviceIds.includes(id)?"#16A34A":ch.bg,color:st.planLead?.[church]?.[d]===id||serviceIds.includes(id)?"#fff":ch.color,border:"none"}}>{st.planLead?.[church]?.[d]===id?"🎤 ":""}{m.name.split(" ")[0]} · {m.role.split(" ")[0]}{serviceIds.includes(id)&&st.planLead?.[church]?.[d]!==id?" ✓":""}</span>:null;}):<span style={{fontSize:12,color:"var(--txt3)"}}>Non planifié</span>}
            </div>
            <span style={{fontSize:11,color:availCnt>0?"var(--grn)":"var(--txt3)",fontWeight:600,flexShrink:0}}>{availCnt} dispo(s)</span>
            {isDraft&&<div style={{display:"flex",gap:4}}>
              <button className="btn btn-g btn-xs" onClick={()=>M.assign(church,d,date,type)}>Assigner</button>
              {ids.length>0&&<button className="btn btn-grn btn-xs" title="Sélectionner membres de service" onClick={()=>M.selectService(church,d,date)}>🎤</button>}
            </div>}
          </div>);
        })}
      </div>
    </div>
  );
}
