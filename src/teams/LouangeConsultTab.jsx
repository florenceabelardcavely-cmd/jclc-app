import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, MONTHS } from "../config";
import { dk, fmt, getDates, getTypeCls, getTypeLabel } from "../lib/helpers";
import { TechMonthNav, techMonthKey } from "./teamCommon";

// ── Louange en consultation (pour la responsable technique) ──
export function LouangeConsultTab({st,year,month,prevMonth,nextMonth}){
  const [cid,setCid]=useState("creil");
  const ch=CHURCHES[cid];
  const dates=getDates(year,month,cid);
  const mk=techMonthKey(year,month);
  const validated=st.validatedMonths?.[cid]?.[mk]===true;
  const members=st.members[cid]||[];
  return(
    <div>
      <div className="csw">
        {Object.values(CHURCHES).map(c=>(
          <button key={c.id} className={`cswb${cid===c.id?" "+c.id:""}`} onClick={()=>setCid(c.id)}>
            <span className="cswb-dot" style={{background:c.color}}/>{c.fullName}<span style={{fontSize:11,opacity:.55,marginLeft:2}}>· {c.dayLabel}</span>
          </button>
        ))}
      </div>
      <div className="ph">
        <div><div className="pt">Louange · {ch.fullName}</div><div className="ps">🔒 Consultation uniquement</div></div>
        <span className={`bdg ${validated?"bdg-val":"bdg-draft"}`}><span className="bdg-dot"/>{validated?"Validé":"Brouillon"}</span>
      </div>
      <TechMonthNav year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth}/>
      <div className="card">
        {!validated&&<div className="ib amb">⏳ Planning louange pas encore validé pour {MONTHS[month]} — il peut encore changer.</div>}
        {dates.length===0?<div className="empty"><div className="empty-icon">📭</div><div>Aucune date ce mois-ci</div></div>
        :dates.map(({date,type})=>{
          const d=dk(date),ids=st.plans[cid]?.[d]||[],lead=st.planLead?.[cid]?.[d];
          return(
            <div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,marginBottom:6,background:"var(--sur2)",flexWrap:"wrap"}}>
              <div style={{flex:"0 0 160px"}}><div style={{fontWeight:600,fontSize:13}}>{fmt(date)}</div><span className={`atag ${getTypeCls(type)}`}>{getTypeLabel(type)}</span></div>
              <div style={{flex:1,display:"flex",gap:5,flexWrap:"wrap"}}>
                {ids.length?ids.map(id=>{const m=members.find(x=>x.id===id);return m?<span key={id} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:lead===id?"#EAB308":ch.bg,color:lead===id?"#fff":ch.color}}>{lead===id?"🎤 ":""}{m.name.split(" ")[0]} · {(m.role||"").split(" ")[0]}</span>:null;})
                :<span style={{fontSize:12,color:"var(--txt3)"}}>Non planifié</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
