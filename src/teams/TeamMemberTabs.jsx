import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, MONTHS } from "../config";
import { dk, fmt, getTeamDates, memberChurches, teamPosts, techKey } from "../lib/helpers";
import { TechEvTag, TechMonthNav, findTechMember, teamPostIcon, teamPostsForEv, techMonthKey } from "./teamCommon";

// ── Accueil technique ──
export function TechAccueilTab({T,user,st,verset,onGo}){
  const today=dk(new Date());
  const mine=[];
  T.churches.forEach(cid=>{
    Object.entries(st[T.id+"Plans"]?.[cid]||{}).forEach(([d,assign])=>{
      if(d>=today&&assign&&assign[user.id]&&st[T.id+"Validated"]?.[cid]?.[d.slice(0,7)]){
        const date=new Date(d+"T12:00:00");
        const ev=(T.events[cid]||[]).find(e=>e.day===date.getDay());
        mine.push({cid,d,date,ev,poste:assign[user.id]});
      }
    });
  });
  mine.sort((a,b)=>a.d.localeCompare(b.d));
  const nm=new Date();nm.setMonth(nm.getMonth()+1);
  const nextMk=techMonthKey(nm.getFullYear(),nm.getMonth());
  const myTechChurches=memberChurches(user).filter(c=>T.churches.includes(c));
  const notSent=myTechChurches.some(c=>!st[T.id+"DispoSent"]?.[user.id]?.[techKey(c,nextMk)]);
  return(
    <div>
      <div className="ph"><div><div className="pt">Bonjour {user.name.split(" ")[0]} 👋</div><div className="ps">{T.service} · {user.isRespTech?T.resp:teamPosts(user,T).join(" · ")||T.label}</div></div></div>
      {verset&&<div className="card" style={{borderLeft:`4px solid ${T.accent}`}}><div style={{fontStyle:"italic",fontSize:14,lineHeight:1.6}}>« {verset.text} »</div><div style={{fontSize:12,color:"var(--txt3)",marginTop:6,fontWeight:700}}>{verset.ref}</div></div>}
      {notSent&&<div className="ib amb" style={{cursor:"pointer"}} onClick={()=>onGo("tech-dispos")}>📅 Pensez à renseigner et envoyer vos disponibilités pour <strong>{MONTHS[nm.getMonth()]}</strong> →</div>}
      <div className="card">
        <div style={{fontWeight:700,marginBottom:12}}>⭐ Mes prochains services</div>
        {mine.length===0
          ?<div className="empty" style={{padding:"18px 0"}}><div style={{fontSize:28}}>{T.icon}</div><div style={{fontSize:12,marginTop:6}}>Aucun service planifié pour le moment</div></div>
          :mine.slice(0,5).map(x=>(
            <div key={x.cid+x.d} className="arow" style={{cursor:"default"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{fmt(x.date)} · {CHURCHES[x.cid].name}</div>
                {x.ev&&<TechEvTag T={T} ev={x.ev}/>}
              </div>
              <span style={{fontSize:12,fontWeight:700,color:T.accent}}>{teamPostIcon(T,x.poste)} {x.poste}</span>
            </div>
          ))}
        {mine.length>5&&<button className="btn btn-g btn-sm" style={{marginTop:8}} onClick={()=>onGo("tech-mon-planning")}>Voir tout ({mine.length}) →</button>}
      </div>
    </div>
  );
}

// ── Mon planning technique ──
export function TechMonPlanningTab({T,user,st}){
  const today=dk(new Date());
  const rows=[];
  T.churches.forEach(cid=>{
    Object.entries(st[T.id+"Plans"]?.[cid]||{}).forEach(([d,assign])=>{
      if(d>=today&&assign&&assign[user.id]&&st[T.id+"Validated"]?.[cid]?.[d.slice(0,7)]){
        const date=new Date(d+"T12:00:00");
        const ev=(T.events[cid]||[]).find(e=>e.day===date.getDay());
        const others=Object.entries(assign).filter(([id])=>id!==user.id).map(([id,poste])=>{const m=findTechMember(T,st,id);return m?`${m.name.split(" ")[0]} (${poste})`:null;}).filter(Boolean);
        rows.push({cid,d,date,ev,poste:assign[user.id],others});
      }
    });
  });
  rows.sort((a,b)=>a.d.localeCompare(b.d));
  return(
    <div>
      <div className="ph"><div><div className="pt">Mon planning · {T.label}</div><div className="ps">Services à venir (plannings validés)</div></div></div>
      <div className="card">
        {rows.length===0
          ?<div className="empty"><div className="empty-icon">📭</div><div>Aucun service à venir</div><div style={{fontSize:12,marginTop:6}}>Le planning apparaît ici une fois validé par {T.respTitle}.</div></div>
          :rows.map(x=>(
            <div key={x.cid+x.d} style={{padding:"12px 14px",borderRadius:10,marginBottom:6,background:"var(--sur2)",borderLeft:`4px solid ${CHURCHES[x.cid].color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div><div style={{fontWeight:700,fontSize:14}}>{fmt(x.date)} · {CHURCHES[x.cid].name}</div>{x.ev&&<TechEvTag T={T} ev={x.ev}/>}</div>
                <span style={{padding:"4px 12px",borderRadius:20,background:T.chipBg,color:T.chipFg,fontSize:12,fontWeight:700}}>{teamPostIcon(T,x.poste)} {x.poste}</span>
              </div>
              {x.others.length>0&&<div style={{fontSize:12,color:"var(--txt2)",marginTop:6}}>Avec : {x.others.join(", ")}</div>}
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Disponibilités technique (membre) ──
export function TechDispoTab({T,user,st,church,year,month,prevMonth,nextMonth,A,toast_}){
  const ch=CHURCHES[church];
  const dates=getTeamDates(T,year,month,church);
  const mk=techMonthKey(year,month);
  const av=st[T.id+"Avail"]?.[user.id]||{};
  const hasChecked=dates.some(x=>av[techKey(church,x.d)]);
  const isSent=!!st[T.id+"DispoSent"]?.[user.id]?.[techKey(church,mk)];
  return(
    <div>
      <div className="ph"><div><div className="pt">Mes disponibilités</div><div className="ps">{ch.fullName} · {T.service}</div></div></div>
      <TechMonthNav year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth}/>
      <div className="card">
        <div className="ib ind">💡 Cochez les dates où vous êtes disponible pour <strong>{MONTHS[month]}</strong>, puis envoyez-les.</div>
        {hasChecked&&!isSent&&<div className="ib" style={{background:"#FFFBEB",color:"#92400E"}}>📤 Pensez à cliquer sur <strong>« Envoyer mes disponibilités »</strong> — les cocher ne suffit pas.</div>}
        {isSent&&<div className="ib" style={{background:"#ECFDF5",color:"#065F46"}}>✅ Disponibilités transmises pour {MONTHS[month]}.</div>}
        {dates.length===0?<div className="empty"><div className="empty-icon">📭</div><div>Aucune date ce mois-ci</div></div>
        :dates.map(({date,d,ev})=>{
          const on=!!av[techKey(church,d)];
          return(
            <div className="arow" key={d+ev.type} onClick={()=>{A.toggleAvail(user.id,church,d);if(!on)toast_("Disponibilité enregistrée","📝");}}>
              <div className={`chk${on?" on":""}`}>✓</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{fmt(date)}</div><TechEvTag T={T} ev={ev}/></div>
              {Object.keys(T.postHint).filter(p=>teamPostsForEv(T,ev).includes(p)).map(p=><span key={p} style={{fontSize:10,color:"var(--txt3)"}}>{T.postHint[p]}</span>)}
            </div>
          );
        })}
        <div className="flex-end" style={{marginTop:18}}>
          <button className="btn btn-p" disabled={!hasChecked||isSent} onClick={()=>{A.sendDispo(user.id,church,mk);toast_(`Disponibilités transmises à ${T.respTitle} !`,"🎉");}}>Envoyer mes disponibilités →</button>
        </div>
      </div>
    </div>
  );
}
