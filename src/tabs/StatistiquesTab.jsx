import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";

// ══════════════════════════════════════════════════
//  STATISTIQUES TAB (nouveau)
// ══════════════════════════════════════════════════
export function StatistiquesTab({st,church}){
  const ch=CHURCHES[church],members=st.members[church];
  const plan=st.plans[church];
  // Calculer le nombre de services par membre
  const servicesMap={};
  Object.values(plan).forEach(ids=>{(ids||[]).forEach(id=>{servicesMap[id]=(servicesMap[id]||0)+1;});});
  const sorted=[...members].sort((a,b)=>(servicesMap[b.id]||0)-(servicesMap[a.id]||0));
  const maxCount=Math.max(1,...Object.values(servicesMap));
  return(
    <div>
      <div className="ph"><div><div className="pt">Statistiques de présence</div><div className="ps">{ch.fullName} · Nombre de services assurés</div></div></div>
      {members.length===0?<div className="card"><div className="empty"><div className="empty-icon">📊</div><div>Aucun membre dans cette église</div></div></div>:(
        <div className="card">
          <div className="card-t">Services par membre</div>
          <div className="card-s">Basé sur les assignations dans le planning</div>
          {sorted.map((m,i)=>{
            const count=servicesMap[m.id]||0;
            const pct=Math.round((count/maxCount)*100);
            return(
              <div key={m.id} style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:ch.bg,color:ch.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{m.name.charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{m.name}</div>
                    <div style={{fontSize:11,color:"var(--txt2)"}}>{m.role}</div>
                  </div>
                  <div style={{fontWeight:800,fontSize:18,color:count>0?ch.color:"var(--txt3)",minWidth:28,textAlign:"right"}}>{count}</div>
                  <div style={{fontSize:11,color:"var(--txt3)",width:40}}>service{count>1?"s":""}</div>
                  {i===0&&count>0&&<span className="bdg bdg-val">🏆 Top</span>}
                </div>
                <div style={{marginLeft:42}}>
                  <div className="stat-bar"><div className="stat-fill" style={{width:`${pct}%`,background:count>0?ch.color:"var(--bdr2)"}}/></div>
                </div>
              </div>
            );
          })}
          <div className="divider"/>
          <div style={{fontSize:12,color:"var(--txt2)",textAlign:"center"}}>
            Total : <strong>{Object.values(servicesMap).reduce((a,b)=>a+b,0)}</strong> service(s) assigné(s) · {members.length} membre(s)
          </div>
        </div>
      )}
    </div>
  );
}
