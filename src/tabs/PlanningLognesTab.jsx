import React, { useState, useRef, useEffect } from "react";
import { PLANNING_LOGNES_2026 } from "../data/planningLognes";

// ══════════════════════════════════════════════════
//  PLANNING LOGNES TAB
// ══════════════════════════════════════════════════
export function PlanningLognesTab({user,isAdmin}){
  const months=["Juillet","Août","Septembre","Octobre"];
  const monthNums=["07","08","09","10"];
  const [selMonth,setSelMonth]=useState("07");
  const filtered=PLANNING_LOGNES_2026.filter(e=>e.date.startsWith("2026-"+selMonth));
  const sorted=[...filtered].sort((a,b)=>a.date.localeCompare(b.date));

  return(
    <div>
      <div className="ph">
        <div>
          <div className="pt">📅 Planning Lognes — Juil. → Oct. 2026</div>
          <div className="ps">Cultes et Ateliers Bibliques · Contact : Frère Wendy pour modifications</div>
        </div>
      </div>

      {/* Month selector */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {months.map((m,i)=>(
          <button key={m}
            className={"btn btn-sm "+(selMonth===monthNums[i]?"btn-p":"btn-g")}
            onClick={()=>setSelMonth(monthNums[i])}>{m}</button>
        ))}
      </div>

      {sorted.length===0
        ?<div className="card"><div className="empty"><div className="empty-icon">📅</div><div>Aucun événement</div></div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sorted.map((evt,i)=>{
            const d=new Date(evt.date);
            const label=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
            const isCulte=evt.type==="culte";
            const userIn=evt.membres.some(n=>user&&n.toLowerCase().includes((user.name||"").split(" ")[0].toLowerCase()));
            return(
              <div key={i} style={{
                borderRadius:12,padding:"14px 16px",
                background:userIn?"#EEF2FF":"var(--sur)",
                border:"1.5px solid "+(userIn?"rgba(99,102,241,.5)":isCulte?"rgba(255,255,255,.12)":"rgba(255,170,0,.2)"),
                transition:"all .2s"
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{
                    width:38,height:38,borderRadius:10,flexShrink:0,
                    background:isCulte?"rgba(99,102,241,.25)":"rgba(217,119,6,.25)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:18
                  }}>{isCulte?"🙏":"📖"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,textTransform:"capitalize"}}>{label}</div>
                    <div style={{fontSize:12,color:isCulte?"#a5b4fc":"#fcd34d",fontWeight:600,marginTop:1}}>{evt.label}</div>
                  </div>
                  {userIn&&<span style={{fontSize:10,background:"rgba(99,102,241,.3)",borderRadius:20,padding:"3px 10px",color:"#c7d2fe",fontWeight:700}}>✓ Vous êtes prévu(e)</span>}
                </div>
                {evt.membres.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {evt.membres.map((m,j)=>{
                      const isMe=user&&m.toLowerCase().includes((user.name||"").split(" ")[0].toLowerCase());
                      return(
                        <span key={j} style={{
                          fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:isMe?700:500,
                          background:isMe?"#4F46E5":"var(--sur2)",
                          color:isMe?"#fff":"var(--txt)",
                          border:isMe?"1px solid rgba(99,102,241,.5)":"1px solid rgba(255,255,255,.1)"
                        }}>{m}</span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      }

      <div style={{marginTop:16,fontSize:11,color:"rgba(255,255,255,.35)",textAlign:"center"}}>
        Contact Frère Wendy pour toute demande de modification
      </div>
    </div>
  );
}
