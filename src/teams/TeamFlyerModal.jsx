import React, { useState, useRef, useEffect } from "react";
import { LOGO_B64 } from "../assets/logoB64";
import { FLYER_COLORS } from "../components/FlyerModal";
import { CHURCHES } from "../config";
import { getTeamDates } from "../lib/helpers";
import { findTechMember, teamPostIcon } from "./teamCommon";

// ── Flyer du planning technique (même style que le flyer louange) ──
export function TechFlyerModal({T,cid,st,month,year,onClose}){
  const ch=CHURCHES[cid];
  const fc=FLYER_COLORS[cid];
  const plan=st[T.id+"Plans"]?.[cid]||{};
  const flyerRef=useRef(null);
  const monthLabel=new Date(year,month).toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  const monthLabelUp=monthLabel.charAt(0).toUpperCase()+monthLabel.slice(1);
  const dates=getTeamDates(T,year,month,cid);
  const nameOf=id=>{const m=findTechMember(T,st,id);return m?m.name.split(" ")[0]:"?";};
  const dayName=day=>["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][day];
  const sections=(T.events[cid]||[]).slice().sort((a,b)=>["culte","atelier","repet","priere"].indexOf(a.type)-["culte","atelier","repet","priere"].indexOf(b.type))
    .map(ev=>({ev,items:dates.filter(x=>x.ev.type===ev.type)})).filter(s=>s.items.length);
  const postIcon=p=>teamPostIcon(T,p);

  function shareWhatsApp(){
    const lines=[`${T.icon} *${T.planTitle} ${ch.name} — ${monthLabelUp}*`,""];
    sections.forEach(({ev,items})=>{
      lines.push(`${ev.icon} *${ev.label} (${dayName(ev.day)}s)*`);
      items.forEach(({date,d})=>{const a=plan[d]||{};const ids=Object.keys(a);lines.push(`  📅 ${date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} : ${ids.length?ids.map(id=>`${nameOf(id)} (${a[id]})`).join(", "):"—"}`);});
      lines.push("");
    });
    lines.push("_JCLC — Jésus-Christ Le Chemin_","_⚠️ Modifications possibles en cours de mois_");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
  }

  function DateCard({date,d}){
    const a=plan[d]||{},ids=Object.keys(a).sort((x,y)=>(a[x]===T.required?-1:0)-(a[y]===T.required?-1:0));
    const isEmpty=ids.length===0;
    return(
      <div style={{borderRadius:14,padding:"12px 14px",background:isEmpty?"rgba(0,0,0,.05)":fc.card,border:isEmpty?"2px dashed rgba(0,0,0,.12)":"none",
        color:isEmpty?"#888":"white",boxShadow:isEmpty?"none":"0 4px 12px rgba(0,0,0,.18)",minWidth:130,flex:"1 1 130px"}}>
        <div style={{fontFamily:"'Bebas Neue',serif",fontSize:"2rem",color:isEmpty?"#bbb":"#f5c842",lineHeight:1}}>{date.getDate()}</div>
        <div style={{fontSize:"0.6rem",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",color:isEmpty?"#bbb":"rgba(255,255,255,.65)",marginBottom:8}}>{date.toLocaleDateString("fr-FR",{weekday:"short"})}</div>
        {isEmpty
          ?<div style={{fontSize:"0.72rem",fontStyle:"italic",color:"#aaa"}}>À assigner</div>
          :ids.map(id=>(
            <div key={id} style={{fontSize:"0.75rem",fontWeight:700,paddingLeft:4,color:a[id]===T.required?"#f5c842":"rgba(255,255,255,.88)"}}>
              {postIcon(a[id])} {nameOf(id)} <span style={{fontSize:"0.58rem",fontWeight:600,opacity:.75}}>· {T.postShort[a[id]]||a[id]}</span>
            </div>
          ))}
      </div>
    );
  }

  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{width:680,maxWidth:"96vw",padding:0,overflow:"hidden",borderRadius:20}}>
        <div style={{display:"flex",gap:8,padding:"14px 16px 0",background:"var(--sur)"}}>
          <button className="btn btn-p" style={{flex:1}} onClick={shareWhatsApp}>📱 Partager sur WhatsApp</button>
          <button className="btn btn-g" style={{flex:1}} onClick={async()=>{
            try{
              const el=flyerRef.current;if(!el)return;
              const{default:h2c}=await import("https://esm.sh/html2canvas@1.4.1");
              const canvas=await h2c(el,{scale:2,useCORS:true,backgroundColor:"white"});
              const link=document.createElement("a");
              link.download=`planning-${T.id}-${cid}-${monthLabelUp.replace(/ /g,"-")}.jpg`;
              link.href=canvas.toDataURL("image/jpeg",0.92);link.click();
            }catch(e){alert("Erreur export: "+e.message);}
          }}>📥 Télécharger JPEG</button>
          <button className="btn btn-g btn-ic" onClick={onClose}>✕</button>
        </div>

        <div ref={flyerRef} style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:"white"}}>
          <div style={{background:fc.headerGrad,padding:"24px 28px 18px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,.07)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-60,left:"35%",width:260,height:260,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
              <div style={{fontSize:"0.75rem",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,.8)"}}>Assemblée Jésus-Christ Le Chemin</div>
              <img src={LOGO_B64} alt="JCLC" style={{width:64,height:64,objectFit:"contain",filter:"drop-shadow(0 2px 8px rgba(255,170,0,.5))"}}/>
            </div>
            <div style={{position:"relative",zIndex:1,marginTop:8}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"3.8rem",color:"white",lineHeight:1,textShadow:"3px 3px 0 rgba(0,0,0,.2)"}}>Planning</div>
              <div style={{fontSize:"1rem",fontWeight:800,color:"rgba(255,255,255,.9)",letterSpacing:"1px",textTransform:"uppercase",marginTop:-4}}>{T.icon} {T.service}</div>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{display:"inline-block",background:"#f5c842",color:"#111",fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:"4px",padding:"2px 16px",borderRadius:7}}>{monthLabelUp}</span>
                <span style={{display:"inline-block",background:fc.badge,color:"white",fontSize:"0.7rem",fontWeight:800,letterSpacing:"3px",textTransform:"uppercase",padding:"4px 14px",borderRadius:50,border:"1.5px solid rgba(255,255,255,.3)"}}>{ch.name}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap",position:"relative",zIndex:1}}>
              <div style={{background:"rgba(0,0,0,.22)",borderRadius:20,padding:"4px 12px",fontSize:"0.68rem",fontWeight:700,color:"white"}}>⚠️ Modifications possibles en cours de mois</div>
              <div style={{background:"rgba(0,0,0,.22)",borderRadius:20,padding:"4px 12px",fontSize:"0.68rem",fontWeight:700,color:"white"}}>{T.roles.map(r=>`${teamPostIcon(T,r)} ${r}`).join(" · ")}</div>
            </div>
          </div>

          <div style={{padding:"20px 22px 24px",background:fc.bodyBg}}>
            {sections.map(({ev,items},i)=>(
              <div key={ev.type} style={{marginBottom:i<sections.length-1?20:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.2rem",letterSpacing:"2px",color:fc.sectionColor,marginBottom:10,paddingBottom:7,borderBottom:"2px solid rgba(0,0,0,.1)"}}>
                  <div style={{width:28,height:28,borderRadius:7,background:fc.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",color:"white"}}>{ev.icon}</div>
                  {ev.label} — {dayName(ev.day)}s
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {items.map(x=><DateCard key={x.d} date={x.date} d={x.d}/>)}
                </div>
              </div>
            ))}
          </div>

          <div style={{background:fc.footer,padding:"10px 20px",textAlign:"center",fontSize:"0.65rem",fontWeight:700,letterSpacing:"1px",color:"rgba(255,255,255,.7)"}}>
            Assemblée Jésus-Christ Le Chemin — {ch.name} · {T.service} &nbsp;|&nbsp; ⚠️ Modifications possibles
          </div>
        </div>
      </div>
    </div>
  );
}
