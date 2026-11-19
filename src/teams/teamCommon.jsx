import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, MONTHS } from "../config";

// ══════════════════════════════════════════════════
//  SERVICE TECHNIQUE
// ══════════════════════════════════════════════════
export function techMonthKey(year,month){return `${year}-${String(month+1).padStart(2,"0")}`;}

export function TechChurchSwitch({T,value,onChange,st}){
  return(
    <div className="csw">
      {T.churches.map(cid=>{const c=CHURCHES[cid];return(
        <button key={cid} className={`cswb${value===cid?" "+cid:""}`} onClick={()=>onChange(cid)}>
          <span className="cswb-dot" style={{background:c.color}}/>{c.fullName}
          {st&&<span className="cswb-cnt">{(st[T.id+"Members"]?.[cid]||[]).length}</span>}
        </button>);})}
    </div>
  );
}

// Postes possibles pour une activité (ex. « Passage de micro » seulement aux cultes)
export function teamPostsForEv(T,ev){return T.roles.filter(p=>!T.postOnlyIf[p]||ev[T.postOnlyIf[p]]);}

export function teamPostIcon(T,p){return T.postIcons[p]||"•";}

export function TechEvTag({T,ev}){
  const col=T.evColors[ev.type]||"#64748B";
  return <span className="atag" style={{background:col+"18",color:col}}>{ev.icon} {ev.label}</span>;
}

export function TechMonthNav({year,month,prevMonth,nextMonth}){
  return(
    <div className="mnav">
      <button className="btn btn-g btn-sm" onClick={prevMonth}>←</button>
      <span className="mnavt">{MONTHS[month]} {year}</span>
      <button className="btn btn-g btn-sm" onClick={nextMonth}>→</button>
    </div>
  );
}

export function findTechMember(T,st,id){
  const L=st[T.id+"Members"]||{};
  for(const cid of Object.keys(L)){const m=(L[cid]||[]).find(x=>x.id===id);if(m)return m;}
  return null;
}
