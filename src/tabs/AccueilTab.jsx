import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, MONTHS, VERSETS } from "../config";

// ══════════════════════════════════════════════════
//  ACCUEIL TAB
// ══════════════════════════════════════════════════
export function AccueilTab({user,isAdmin,st,verset,showNotifBanner,onDismissNotif,onGoDispos,month,year,prevMonth,nextMonth,church}){
  const ch=CHURCHES[church];
  const nextM=new Date();nextM.setMonth(nextM.getMonth()+1);
  const churchMemberStats=Object.values(CHURCHES).map(c=>({n:(st.members[c.id]||[]).length,l:`Membres ${c.name}`,icon:"⛪",color:c.color,bg:c.bg}));
  const validated=Object.values(st.planStatus).filter(s=>s==="validated").length;

  // Prochain culte
  const today=new Date();today.setHours(0,0,0,0);
  const upcomingProgs=st.programs.filter(p=>p.churchId===church&&p.date&&new Date(p.date+"T00:00:00")>=today&&p.status!=="repetition").sort((a,b)=>new Date(a.date)-new Date(b.date));
  const nextProg=upcomingProgs[0]||null;
  const daysUntil=nextProg?Math.ceil((new Date(nextProg.date+"T00:00:00")-today)/(1000*60*60*24)):null;

  return(
    <div style={{paddingBottom:8}}>

      {/* Bannière notification */}
      {showNotifBanner&&(
        <div className="notif-banner" style={{marginBottom:16}}>
          <div className="nb-icon">📬</div>
          <div style={{flex:1}}>
            <div className="nb-title">Rappel — Disponibilités !</div>
            <div className="nb-sub">{isAdmin?`Invitez les membres à renseigner leurs dispos pour ${MONTHS[nextM.getMonth()]}.`:`Renseignez vos dispos pour ${MONTHS[nextM.getMonth()]} avant la fin de semaine.`}</div>
          </div>
          <button className="nb-btn" onClick={onGoDispos}>Saisir →</button>
          <button style={{background:"transparent",border:"none",color:"rgba(255,255,255,.5)",fontSize:18,cursor:"pointer",padding:"0 4px"}} onClick={onDismissNotif}>✕</button>
        </div>
      )}

      {/* Hero — Verset de la semaine */}
      <div style={{background:"linear-gradient(135deg,#1A1830 0%,#2D2B6B 50%,#3D2A7A 100%)",borderRadius:20,padding:"24px 22px",marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:"rgba(245,158,11,.12)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-30,left:-10,width:80,height:80,borderRadius:"50%",background:"rgba(99,102,241,.15)",pointerEvents:"none"}}/>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(245,158,11,.8)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:10}}>✨ Verset de la semaine</div>
        <div style={{fontFamily:"Lora,serif",fontSize:16,fontStyle:"italic",color:"rgba(255,255,255,.92)",lineHeight:1.7,marginBottom:10}}>« {verset.text} »</div>
        <div style={{fontSize:11,fontWeight:800,color:"#F59E0B",letterSpacing:"1px",textTransform:"uppercase"}}>{verset.ref}</div>
      </div>

      {/* Widget prochain culte */}
      {nextProg&&(
        <div style={{background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)",border:"1.5px solid rgba(79,70,229,.2)",borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#4F46E5,#6366F1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 16px rgba(79,70,229,.3)"}}>
            <div style={{fontSize:20,lineHeight:1}}>🎵</div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,fontWeight:700,color:"var(--ind)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>Prochain culte</div>
            <div style={{fontWeight:800,fontSize:15,color:"var(--txt)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nextProg.title||"Programme"}</div>
            <div style={{fontSize:12,color:"var(--txt2)",marginTop:2}}>{new Date(nextProg.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:28,fontWeight:900,color:"var(--ind)",lineHeight:1}}>{daysUntil===0?"Auj.":daysUntil}</div>
            {daysUntil!==0&&<div style={{fontSize:9,fontWeight:700,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".5px"}}>jour{daysUntil>1?"s":""}</div>}
          </div>
        </div>
      )}

      {/* Stats admin */}
      {isAdmin&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            ...churchMemberStats,
            {n:validated,l:"Plannings validés",icon:"✅",color:"#059669",bg:"#ECFDF5"},
            {n:st.songs.length,l:"Chants",icon:"🎵",color:"#7C3AED",bg:"#F5F3FF"},
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,border:`1px solid ${s.color}22`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:12,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:`0 4px 12px ${s.color}40`}}>{s.icon}</div>
              <div>
                <div style={{fontSize:24,fontWeight:900,color:s.color,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:10,fontWeight:700,color:s.color,opacity:.7,marginTop:2,textTransform:"uppercase",letterSpacing:".3px"}}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statut planning membre */}
      {!isAdmin&&(
        <div style={{background:"var(--sur)",border:"1px solid var(--bdr)",borderRadius:16,padding:"16px 18px",marginBottom:16,boxShadow:"var(--sh)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"var(--ind-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📅</div>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:"var(--txt)"}}>Votre planning</div>
              <div style={{fontSize:11,color:"var(--txt2)"}}>{ch.fullName}</div>
            </div>
          </div>
          {Object.entries(st.planStatus).filter(([cid])=>cid===church).map(([cid,s])=>(
            <div key={cid} className={`bdg ${s==="validated"?"bdg-val":"bdg-draft"}`} style={{fontSize:12,padding:"7px 14px",display:"inline-flex"}}>
              <span className="bdg-dot"/>
              {s==="validated"?"✓ Planning validé — consultez vos dates !":"⏳ Planning en cours de préparation…"}
            </div>
          ))}
          <div style={{marginTop:12,background:"var(--ind-bg)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"var(--ind)",fontWeight:600}}>
            💡 Pensez à renseigner vos disponibilités pour <strong>{MONTHS[(month+1)%12]}</strong>.
          </div>
        </div>
      )}

      {/* Prochains versets */}
      <div style={{background:"var(--sur)",border:"1px solid var(--bdr)",borderRadius:16,padding:"16px 18px",boxShadow:"var(--sh)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:18}}>📖</span>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:"var(--txt)"}}>Versets de la semaine</div>
            <div style={{fontSize:11,color:"var(--txt2)"}}>Un nouveau verset chaque semaine</div>
          </div>
        </div>
        {[0,1,2,3].map(i=>{
          const now=new Date(),startOfYear=new Date(now.getFullYear(),0,1);
          const curWeek=Math.floor((now-startOfYear)/(7*24*3600*1000));
          const v=VERSETS[(curWeek+i)%VERSETS.length];
          const weekLabel=i===0?"Cette semaine":i===1?"Semaine prochaine":`Dans ${i} semaines`;
          return(
            <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<3?"1px solid var(--bdr)":"none",alignItems:"flex-start"}}>
              <div style={{minWidth:70,fontSize:9,fontWeight:800,color:i===0?"var(--ind)":"var(--txt3)",textTransform:"uppercase",letterSpacing:".5px",paddingTop:3,background:i===0?"var(--ind-bg)":"transparent",padding:"3px 8px",borderRadius:20,flexShrink:0,textAlign:"center"}}>{weekLabel}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Lora,serif",fontSize:13,fontStyle:"italic",color:"var(--txt)",lineHeight:1.6,marginBottom:3}}>« {v.text} »</div>
                <div style={{fontSize:10,fontWeight:800,color:"var(--gold)",letterSpacing:".5px"}}>{v.ref}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
