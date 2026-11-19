import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, DAYS, MONTHS } from "../config";
import { dk } from "../lib/helpers";

// ══════════════════════════════════════════════════
//  CALENDRIER TAB
// ══════════════════════════════════════════════════
export function CalendarTab({user,isAdmin,church,st,year,month,prevMonth,nextMonth}){
  const today=new Date();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const churches=isAdmin?Object.keys(CHURCHES):[church];
  function getEvts(day){
    const date=new Date(year,month,day),d=dk(date);
    return churches.flatMap(cid=>{
      if(!isAdmin&&st.planStatus[cid]!=="validated")return[];
      const ids=st.plans[cid][d]||[];if(!ids.length)return[];
      const names=ids.map(id=>st.members[cid].find(m=>m.id===id)?.name.split(" ")[0]).filter(Boolean);
      const isMe=!isAdmin&&ids.includes(user.id);
      return[{cid,names,isMe}];
    });
  }
  return(
    <div>
      <div className="pt" style={{marginBottom:4}}>Calendrier</div>
      <div className="ps" style={{marginBottom:16}}>{isAdmin?"Vue d'ensemble des deux églises":"Votre planning mensuel"}</div>
      {!isAdmin&&st.planStatus[church]!=="validated"&&<div className="ib amb">⏳ Planning non encore validé.</div>}
      {isAdmin&&<div style={{display:"flex",gap:14,marginBottom:14}}>{churches.map(cid=><div key={cid} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:600}}><span style={{width:10,height:10,borderRadius:"50%",background:CHURCHES[cid].color,display:"inline-block"}}/>{CHURCHES[cid].fullName}<span className={`bdg ${st.planStatus[cid]==="validated"?"bdg-val":"bdg-draft"}`} style={{fontSize:10,padding:"2px 8px"}}>{st.planStatus[cid]==="validated"?"Validé":"Brouillon"}</span></div>)}</div>}
      <div className="mnav">
        <button className="btn btn-g btn-sm" onClick={prevMonth}>←</button>
        <span className="mnavt">{MONTHS[month]} {year}</span>
        <button className="btn btn-g btn-sm" onClick={nextMonth}>→</button>
      </div>
      <div className="card" style={{padding:12}}>
        <div className="cal">
          {DAYS.map(d=><div key={d} className="calh">{d}</div>)}
          {cells.map((day,i)=>{
            if(!day)return<div key={i} className="cald em"/>;
            const date=new Date(year,month,day),isW=[0,6].includes(date.getDay()),isT=date.toDateString()===today.toDateString();
            const evts=getEvts(day),isMe=evts.some(e=>e.isMe);
            return(<div key={day} className={`cald${isMe?" me":isT?" td":isW?" wk":""}`}>
              <div className="calnd" style={isMe?{color:"var(--grn)",fontWeight:800}:{}}>{day}</div>
              {evts.map(({cid,names,isMe})=><div key={cid} className={"calev"+(isMe?" ev-me":" ev-"+cid)} title={names.join(", ")}>{isMe?"⭐ Vous":names.slice(0,2).join(", ")}{names.length>2&&` +${names.length-2}`}</div>)}
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}
