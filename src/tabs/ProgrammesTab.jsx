import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";

// ══════════════════════════════════════════════════
//  PROGRAMMES TAB
// ══════════════════════════════════════════════════
export function ProgrammesTab({st,church,churches,M,deleteProg,archiveProg,duplicateProg}){
  const [activeChurch,setActiveChurch]=useState(church||"creil");
  const [view,setView]=useState("actifs");
  useEffect(()=>{setActiveChurch(church||"creil");},[church]);
  const ch=CHURCHES[activeChurch]||CHURCHES[church]||CHURCHES.creil;
  const allProgs=st.programs.filter(p=>p.churchId===activeChurch&&p.status!=="repetition");
  const progs=view==="actifs"?allProgs.filter(p=>p.status!=="archived"):allProgs.filter(p=>p.status==="archived");
  const otherChurches=(churches||[]).filter(cid=>CHURCHES[cid]);
  return(
    <div>
      {otherChurches.length>0&&(
        <div style={{display:"flex",gap:8,padding:"0 16px 12px"}}>
          {[church,...otherChurches].map(cid=>(
            <button key={cid} className={`btn btn-sm ${activeChurch===cid?"btn-p":"btn-g"}`} onClick={()=>setActiveChurch(cid)}>
              {CHURCHES[cid].fullName}
            </button>
          ))}
        </div>
      )}
      <div className="ph">
        <div><div className="pt">Programmes</div><div className="ps">{ch.fullName} · Feuilles avec accords · 3 pages max · 2 chants min/page</div></div>
        {view==="actifs"&&<button className="btn btn-p btn-sm" onClick={()=>M.addProg(activeChurch)}>+ Créer</button>}
      </div>
      <div style={{display:"flex",gap:8,padding:"0 0 14px"}}>
        <button className={`btn btn-sm ${view==="actifs"?"btn-p":"btn-g"}`} onClick={()=>setView("actifs")}>
          📄 Actifs ({allProgs.filter(p=>p.status!=="archived").length})
        </button>
        <button className={`btn btn-sm ${view==="archives"?"btn-p":"btn-g"}`} onClick={()=>setView("archives")}>
          🗄️ Archives ({allProgs.filter(p=>p.status==="archived").length})
        </button>
      </div>
      {progs.length===0?<div className="card"><div className="empty"><div className="empty-icon">📄</div><div>Aucun programme créé</div></div></div>
      :progs.map(p=>(
        <div className="card" key={p.id}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{p.title}</div>
              <div style={{fontSize:12,color:"var(--txt2)",marginTop:2}}>
                {p.date&&new Date(p.date).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                {" · "}{p.items.length} chant(s) sur {p.pages||1} page(s)
              </div>
            </div>
            
            <button className="btn btn-p btn-sm" onClick={()=>M.viewProg(p)}>📄 Imprimer</button>
            <button className="btn btn-g btn-sm" onClick={()=>{
              const songs=p.items||[];
              let out=`${p.title||"Programme"}\n${"=".repeat(30)}\n\n`;
              songs.forEach((item,i)=>{
                const song=st.songs.find(s=>s.id===item.songId)||{title:item.title,sections:[]};
                out+=`${i+1}. ${(song.title||item.title).toUpperCase()}\n${"-".repeat(30)}\n`;
                (song.sections||[]).forEach(sec=>{
                  out+=`[${sec.label.toUpperCase()}]\n`;
                  (sec.lines||[]).forEach(line=>{if(line.k==="lyric"&&line.t.trim()){
          const fr={"à":"À","â":"Â","ä":"Ä","é":"É","è":"È","ê":"Ê","ë":"Ë","î":"Î","ï":"Ï","ô":"Ô","ö":"Ö","ù":"Ù","û":"Û","ü":"Ü","ç":"Ç","œ":"Œ","æ":"Æ"};
          out+=line.t.replace(/[àâäéèêëîïôöùûüçœæ]/gi,c=>fr[c]||c).toUpperCase()+"\n";
        }});
                  out+="\n";
                });
                out+="\n";
              });
              const blob=new Blob([out],{type:"text/plain;charset=utf-8"});
              const a=document.createElement("a");
              a.href=URL.createObjectURL(blob);
              a.download=`${(p.title||"programme").replace(/[^a-zA-Z0-9]/g,"_")}_ProPresenter.txt`;
              a.click();
            }}>📺 ProPresenter</button>
            {view==="actifs"&&<button className="btn btn-g btn-sm" onClick={()=>M.editProg(p)}>✏️</button>}
            {view==="actifs"&&archiveProg&&<button className="btn btn-amb btn-sm" title="Archiver" onClick={()=>archiveProg(p.id)}>🗄️</button>}
            {view==="archives"&&duplicateProg&&<button className="btn btn-grn btn-sm" onClick={()=>duplicateProg(p)}>📋 Réutiliser</button>}
            <button className="btn btn-d btn-xs btn-ic" onClick={()=>deleteProg(p.id)}>🗑</button>
          </div>
          {p.items.length>0&&(
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--bdr)"}}>
              {(p.pages===1?[p.items]:(p.pages===2?[p.items.slice(0,Math.ceil(p.items.length/2)),p.items.slice(Math.ceil(p.items.length/2))]:[ p.items.slice(0,Math.ceil(p.items.length/3)),p.items.slice(Math.ceil(p.items.length/3),Math.ceil(p.items.length*2/3)),p.items.slice(Math.ceil(p.items.length*2/3))])).map((pageItems,pi)=>(
                <div key={pi} style={{marginBottom:pi<(p.pages||1)-1?12:0}}>
                  {(p.pages||1)>1&&<div style={{fontSize:10,fontWeight:700,color:"var(--txt3)",textTransform:"uppercase",marginBottom:6}}>Page {pi+1}</div>}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {pageItems.map((item,i)=>{const s=st.songs.find(x=>x.id===item.songId);return s?<span key={i} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:ch.bg,color:ch.color}}>{item.categorie&&`[${item.categorie}] `}{s.title} — {item.key||s.key}</span>:null;})}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
