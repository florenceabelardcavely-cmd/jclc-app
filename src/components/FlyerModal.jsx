import React, { useState, useRef, useEffect } from "react";
import { LOGO_B64 } from "../assets/logoB64";
import { CHURCHES } from "../config";
import { getDates } from "../lib/helpers";

// ══════════════════════════════════════════════════
//  FLYER MODAL - Génère un flyer WhatsApp du planning (design amélioré)
// ══════════════════════════════════════════════════

// Constantes de design du flyer
export const FLYER_COLORS = {
  lognes: {
    headerGrad: "linear-gradient(135deg,#c2006a 0%,#e91e8c 60%,#ff6bba 100%)",
    card: "#d4197f",
    footer: "#b5106e",
    badge: "rgba(255,255,255,.2)",
    bodyBg: "linear-gradient(180deg,#fce4f3 0%,#f5c8e8 100%)",
    sectionColor: "#b5106e",
    iconBg: "#e91e8c",
  },
  creil: {
    headerGrad: "linear-gradient(135deg,#3a0d99 0%,#5b21d4 60%,#9b6fff 100%)",
    card: "#6d2fe0",
    footer: "#3d0fa3",
    badge: "rgba(255,255,255,.15)",
    bodyBg: "linear-gradient(180deg,#ede8fd 0%,#ddd5fb 100%)",
    sectionColor: "#3d0fa3",
    iconBg: "#5b21d4",
  },
  toulouse: {
    headerGrad: "linear-gradient(135deg,#03543a 0%,#059669 60%,#4ade9d 100%)",
    card: "#0d9668",
    footer: "#03543a",
    badge: "rgba(255,255,255,.18)",
    bodyBg: "linear-gradient(180deg,#e2fbef 0%,#bdf5da 100%)",
    sectionColor: "#03543a",
    iconBg: "#059669",
  },
};

export const SCHEDULE_LABELS = {
  lognes: { atelier: { day:2, label:"Mardi",    icon:"📖", title:"Atelier Biblique" },
            culte:   { day:0, label:"Dimanche",  icon:"🙏", title:"Culte" } },
  creil:  { atelier: { day:3, label:"Mercredi",  icon:"📖", title:"Atelier Biblique" },
            culte:   { day:0, label:"Dimanche",   icon:"🙏", title:"Culte" } },
  toulouse: { culte: { day:6, label:"Samedi", icon:"🙏", title:"Culte" } },
};

export function FlyerModal({church,st,month,year,onClose}){
  const cid = church || "lognes";
  const ch  = CHURCHES[cid];
  const fc  = FLYER_COLORS[cid];
  const plan= st.plans[cid] || {};
  const flyerRef = useRef(null);
  const monthLabel = new Date(year,month).toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  const monthLabelUp = monthLabel.charAt(0).toUpperCase()+monthLabel.slice(1);

  // Grouper les dates par type (atelier / culte)
  const sched = SCHEDULE_LABELS[cid];
  function getDatesForType(dayOfWeek){
    const out=[];
    const d=new Date(year,month,1);
    while(d.getMonth()===month){ if(d.getDay()===dayOfWeek) out.push(new Date(d)); d.setDate(d.getDate()+1); }
    return out;
  }
  // Basé sur getDates pour respecter le changement de jour de Creil (samedi → dimanche)
  const monthDates   = getDates(year,month,cid);
  const atelierDates = sched.atelier ? monthDates.filter(x=>x.type==="mer"||x.type==="mar").map(x=>x.date) : [];
  const culteDates   = monthDates.filter(x=>x.type==="sam"||x.type==="dim").map(x=>x.date);

  function getMembersForDate(date){
    const ds=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    return (plan[ds]||[]).map(id=>st.members[cid].find(m=>m.id===id)).filter(Boolean);
  }

  function shareWhatsApp(){
    const lines=[
      `🎵 *Planning ${ch.name} — ${monthLabelUp}*`,"",
      ...(sched.atelier?[`📖 *${sched.atelier.title} (${sched.atelier.label}s)*`,
      ...atelierDates.map(d=>{ const ms=getMembersForDate(d); return `  📅 ${d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} : ${ms.length?ms.map(m=>m.name).join(", "):"—"}`;}),""]:[]),
      `🙏 *${sched.culte.title} (${sched.culte.label}s)*`,
      ...culteDates.map(d=>{ const ms=getMembersForDate(d); return `  📅 ${d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} : ${ms.length?ms.map(m=>m.name).join(", "):"—"}`;}),
      "","_JCLC — Jésus-Christ Le Chemin_","_⚠️ Modifications possibles en cours de mois_"
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
  }

  // Carte de date pour le flyer
  function DateCard({date, members}){
    const day = date.getDate();
    const dayLabel = date.toLocaleDateString("fr-FR",{weekday:"short"});
    const isEmpty = members.length===0;
    return(
      <div style={{
        borderRadius:14, padding:"12px 14px", position:"relative",
        background: isEmpty ? "rgba(0,0,0,.05)" : fc.card,
        border: isEmpty ? "2px dashed rgba(0,0,0,.12)" : "none",
        color: isEmpty ? "#888" : "white",
        boxShadow: isEmpty ? "none" : "0 4px 12px rgba(0,0,0,.18)",
        minWidth:130, flex:"1 1 130px",
      }}>
        <div style={{fontFamily:"'Bebas Neue',serif",fontSize:"2rem",color: isEmpty?"#bbb":"#f5c842",lineHeight:1}}>{day}</div>
        <div style={{fontSize:"0.6rem",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",
          color: isEmpty ? "#bbb" : "rgba(255,255,255,.65)", marginBottom:8}}>{dayLabel}</div>
        {isEmpty
          ? <div style={{fontSize:"0.72rem",fontStyle:"italic",color:"#aaa"}}>À assigner</div>
          : <>
              {members.map((m)=>{
                const isLead=st.planLead?.[cid]?.[`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`]===m.id;
                return(<div key={m.id} style={{fontSize:"0.75rem",fontWeight:700,paddingLeft:6,color:isLead?"#f5c842":"rgba(255,255,255,.85)"}}>
                  • {m.name.split(" ")[0]} {isLead?<span style={{fontSize:"0.55rem",background:"rgba(255,255,255,.2)",padding:"1px 5px",borderRadius:4,marginLeft:3}}>🎤</span>:null}
                </div>);
              })}
            </>
        }
      </div>
    );
  }

  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{width:680,maxWidth:"96vw",padding:0,overflow:"hidden",borderRadius:20}}>

        {/* Boutons actions (hors flyer) */}
        <div style={{display:"flex",gap:8,padding:"14px 16px 0",background:"var(--sur)"}}>
          <button className="btn btn-p" style={{flex:1}} onClick={shareWhatsApp}>📱 Partager sur WhatsApp</button>
          <button className="btn btn-g" style={{flex:1}} onClick={async()=>{
            try{
              const el=flyerRef.current;
              if(!el)return;
              const{default:h2c}=await import("https://esm.sh/html2canvas@1.4.1");
              const canvas=await h2c(el,{scale:2,useCORS:true,backgroundColor:"white"});
              const link=document.createElement("a");
              link.download=`planning-${cid}-${monthLabelUp.replace(/ /g,"-")}.jpg`;
              link.href=canvas.toDataURL("image/jpeg",0.92);
              link.click();
            }catch(e){alert("Erreur export: "+e.message);}
          }}>📥 Télécharger JPEG</button>
          <button className="btn btn-g btn-ic" onClick={onClose}>✕</button>
        </div>

        {/* ══ FLYER ══ */}
        <div ref={flyerRef} style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:"white"}}>

          {/* Header */}
          <div style={{background:fc.headerGrad,padding:"24px 28px 18px",position:"relative",overflow:"hidden"}}>
            {/* Cercles déco */}
            <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,.07)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-60,left:"35%",width:260,height:260,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
              <div>
                <div style={{fontSize:"0.75rem",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,.8)"}}>
                  Assemblée Jésus-Christ Le Chemin
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <img src={LOGO_B64} alt="JCLC" style={{width:64,height:64,objectFit:"contain",filter:"drop-shadow(0 2px 8px rgba(255,170,0,.5))"}}/>
              </div>
            </div>

            <div style={{position:"relative",zIndex:1,marginTop:8}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"3.8rem",color:"white",lineHeight:1,textShadow:"3px 3px 0 rgba(0,0,0,.2)"}}>Planning</div>
              <div style={{fontSize:"1rem",fontWeight:800,color:"rgba(255,255,255,.9)",letterSpacing:"1px",textTransform:"uppercase",marginTop:-4}}>Atelier Biblique / Culte</div>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{display:"inline-block",background:"#f5c842",color:"#111",fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:"4px",padding:"2px 16px",borderRadius:7}}>{monthLabelUp}</span>
                <span style={{display:"inline-block",background:fc.badge,color:"white",fontSize:"0.7rem",fontWeight:800,letterSpacing:"3px",textTransform:"uppercase",padding:"4px 14px",borderRadius:50,border:"1.5px solid rgba(255,255,255,.3)"}}>{ch.name}</span>
              </div>
            </div>

            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap",position:"relative",zIndex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,0,0,.22)",borderRadius:20,padding:"4px 12px",fontSize:"0.68rem",fontWeight:700,color:"white"}}>
                ⚠️ Modifications possibles en cours de mois
              </div>
              {cid==="lognes"&&(
                <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,180,255,.22)",borderRadius:20,padding:"4px 12px",fontSize:"0.68rem",fontWeight:700,color:"white"}}>
                  🔁 Répétition le vendredi
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{padding:"20px 22px 24px",background: fc.bodyBg}}>

            {/* Atelier Biblique */}
            {sched.atelier&&(
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.2rem",letterSpacing:"2px",
                color: fc.sectionColor,marginBottom:10,paddingBottom:7,borderBottom:"2px solid rgba(0,0,0,.1)"}}>
                <div style={{width:28,height:28,borderRadius:7,background: fc.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",color:"white"}}>{sched.atelier.icon}</div>
                {sched.atelier.title} — {sched.atelier.label}s
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {atelierDates.map(d=><DateCard key={d.toISOString()} date={d} members={getMembersForDate(d)}/>)}
              </div>
            </div>
            )}

            {/* Culte */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.2rem",letterSpacing:"2px",
                color: fc.sectionColor,marginBottom:10,paddingBottom:7,borderBottom:"2px solid rgba(0,0,0,.1)"}}>
                <div style={{width:28,height:28,borderRadius:7,background: fc.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",color:"white"}}>{sched.culte.icon}</div>
                {sched.culte.title} — {sched.culte.label}s
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {culteDates.map(d=><DateCard key={d.toISOString()} date={d} members={getMembersForDate(d)}/>)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{background:fc.footer,padding:"10px 20px",textAlign:"center",fontSize:"0.65rem",fontWeight:700,letterSpacing:"1px",color:"rgba(255,255,255,.7)"}}>
            Assemblée Jésus-Christ Le Chemin — {ch.name} &nbsp;|&nbsp; ⚠️ Modifications possibles
          </div>
        </div>
        {/* FIN FLYER */}

      </div>
    </div>
  );
}
