import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, DAYS, MONTHS } from "../config";
import { fmt } from "../lib/helpers";

// ══════════════════════════════════════════════════
//  MON PLANNING TAB
// ══════════════════════════════════════════════════
export function MonPlanningTab({user,st,year,month,prevMonth,nextMonth,activeChurch}){
  const cid=activeChurch||user.church,ch=CHURCHES[cid]||CHURCHES[user.church];
  const plan=st.plans[cid],mk=`${year}-${String(month+1).padStart(2,"0")}`,validated=st.validatedMonths?.[cid]?.[mk]===true||st.planStatus[cid]==="validated";
  const myDates=Object.entries(plan).filter(([,ids])=>(ids||[]).includes(user.id)).map(([d])=>{const[y,m,dd]=d.split("-").map(Number);return new Date(y,m-1,dd);}).sort((a,b)=>a-b);
  const today=new Date();today.setHours(0,0,0,0);
  const upcoming=myDates.filter(d=>d>=today);
  const monthDates=myDates.filter(d=>d.getFullYear()===year&&d.getMonth()===month);
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return(
    <div>
      <div className="ph">
        <div><div className="pt">Mon planning</div><div className="ps">{ch.fullName} · Planning de {user.name}</div></div>
        <span className={`bdg ${validated?"bdg-val":"bdg-draft"}`}><span className="bdg-dot"/>{validated?"Validé":"En attente"}</span>
      </div>
      {!validated&&<div className="ib amb">⏳ Le planning n'est pas encore finalisé. Vous serez notifié(e) dès qu'il sera disponible.</div>}
      {validated&&(
        <>
          {upcoming.length===0
            ?<div className="card" style={{textAlign:"center",padding:32}}><div style={{fontSize:36,marginBottom:10}}>📭</div><div style={{fontWeight:600}}>Aucune date à venir</div></div>
            :<>
              <div style={{fontWeight:700,fontSize:12,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".5px",margin:"4px 0 10px"}}>📌 Prochaines dates de service</div>
              {upcoming.slice(0,5).map((date,i)=>(
                <div key={i} className="mycard" style={{borderLeftColor:ch.color}}>
                  <div className="mycard-d">{fmt(date)}</div>
                  <div className="mycard-t" style={{color:ch.color}}>Service</div>
                  {i===0&&<span className="mycard-next" style={{background:ch.color,color:"#fff"}}>Prochain</span>}
                </div>
              ))}
              {upcoming.length>5&&<div style={{fontSize:12,color:"var(--txt2)",textAlign:"center",marginTop:6}}>+ {upcoming.length-5} autres dates</div>}
            </>
          }
          <div style={{marginTop:22}}>
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
                  const date=new Date(year,month,day);
                  const isW=[0,6].includes(date.getDay());
                  const isT=date.toDateString()===new Date().toDateString();
                  const isM=monthDates.some(d=>d.getDate()===day);
                  return(<div key={day} className={`cald${isM?" me":isT?" td":isW?" wk":""}`}>
                    <div className="calnd" style={isM?{color:"var(--grn)",fontWeight:800}:{}}>{day}</div>
                    {isM&&<div className="calev ev-me">⭐ Service</div>}
                  </div>);
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
