import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";
import { EN_NOTES, FR_NOTES, prefKey, semit, transposeLine } from "../lib/music";

// ══════════════════════════════════════════════════
//  MUSICIEN TAB
// ══════════════════════════════════════════════════
export function MusicienTab({user,st,church}){
  const cid=church||user.church||"creil";
  const ch=CHURCHES[cid]||CHURCHES.creil;
  const today=new Date();today.setHours(0,0,0,0);
  const upcomingProgs=st.programs.filter(p=>p.churchId===cid&&p.date&&new Date(p.date+"T00:00:00")>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const allProgs=st.programs.filter(p=>p.churchId===cid&&p.date&&new Date(p.date+"T00:00:00")>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const progs=upcomingProgs.length>0?upcomingProgs:allProgs;
  const [progIdx,setProgIdx]=useState(0);
  const activeProg=progs[progIdx]||null;
  const [songKeys,setSongKeys]=useState(()=>{try{return JSON.parse(localStorage.getItem("jclc_keys_"+user?.id)||"{}");}catch{return{};}});
  const [notation,setNotation]=useState("fr");
  const [viewIdx,setViewIdx]=useState(null);
  const [fontSize,setFontSize]=useState(16);
  const [autoScroll,setAutoScroll]=useState(false);
  const [lineNotes,setLineNotes]=useState(()=>{try{return JSON.parse(localStorage.getItem("jclc_notes_"+user?.id)||"{}");}catch{return{};}});
  const [editingNote,setEditingNote]=useState(null); // {sid,si,li}
  const [noteInput,setNoteInput]=useState("");

  function getLineNoteKey(sid,si,li){return `${sid}_${si}_${li}`;}
  function getLineNote(sid,si,li){return lineNotes[getLineNoteKey(sid,si,li)]||"";}
  function saveLineNote(sid,si,li,txt){
    const key=getLineNoteKey(sid,si,li);
    const newNotes=txt.trim()?{...lineNotes,[key]:txt.trim()}:{...lineNotes};
    if(!txt.trim())delete newNotes[key];
    setLineNotes(newNotes);
    localStorage.setItem("jclc_notes_"+user?.id,JSON.stringify(newNotes));
    setEditingNote(null);
  }
  const scrollRef=useRef();
  const scrollTimer=useRef();
  const NOTES_FR=FR_NOTES;
  const NOTES_EN=EN_NOTES;
  const CUR_NOTES=notation==="fr"?NOTES_FR:NOTES_EN;
  // Clé de stockage scopée par programme + chant, pour que la tonalité choisie
  // pour un chant dans un programme ne "fuite" pas vers ce même chant dans un autre programme.
  function skey(sid){return `${activeProg?.id||"noprog"}_${sid}`;}
  function getKey(sid,orig){const k=songKeys[skey(sid)]||(orig||"Do");return prefKey(k.replace(/^Re(?=#|b|$)/,"Ré"));}
  function changeKey(sid,orig,delta){
    const cur=getKey(sid,orig);
    const ci=CUR_NOTES.indexOf(cur)!==-1?CUR_NOTES.indexOf(cur):NOTES_FR.indexOf(cur);
    if(ci===-1)return;
    setSongKeys(k=>{const nk={...k,[skey(sid)]:CUR_NOTES[(ci+delta+12)%12]};try{localStorage.setItem("jclc_keys_"+user?.id,JSON.stringify(nk));}catch{}return nk;});
  }
  function getSong(songId,title){return st.songs.find(s=>s.id===songId)||{title:title||"?",key:"Do",sections:[]};}
  useEffect(()=>{
    if(autoScroll&&scrollRef.current){scrollTimer.current=setInterval(()=>{if(scrollRef.current)scrollRef.current.scrollTop+=1;},50);}
    else{clearInterval(scrollTimer.current);}
    return()=>clearInterval(scrollTimer.current);
  },[autoScroll]);
  const items=activeProg?(activeProg.items||activeProg.songs||[]):[];
  if(viewIdx!==null){
    const item=items[viewIdx];
    if(!item){setViewIdx(null);return null;}
    const sid=item.songId||item.id||("item-"+viewIdx);
    const songData=getSong(sid,item.title||item.songTitle);
    const srcKey=songData.key||"Do"; // tonalité dans laquelle les accords sont écrits (bibliothèque)
    const origKey=item.key||srcKey;   // tonalité choisie dans le programme
    const dispKey=getKey(sid,origKey);
    const st_=semit(srcKey,dispKey);
    return(
      <div style={{position:"fixed",inset:0,background:"#0f172a",color:"#f1f5f9",zIndex:9999,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Barre du haut */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(0,0,0,.6)",borderBottom:"1px solid rgba(255,255,255,.1)",flexShrink:0,flexWrap:"wrap"}}>
          <button className="btn btn-g btn-sm" onClick={()=>setViewIdx(null)}>← Liste</button>
          <div style={{flex:1,textAlign:"center",minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{songData.title||item.title}</div>
            <div style={{fontSize:10,opacity:.5}}>{activeProg.title} · Ton. {dispKey}</div>
          </div>
          <button className="btn btn-g btn-xs" onClick={()=>changeKey(sid,origKey,-1)}>−1</button>
          <div style={{display:"flex",gap:2}}>
            {CUR_NOTES.map(n=><button key={n} onClick={()=>setSongKeys(k=>{const nk={...k,[skey(sid)]:n};try{localStorage.setItem("jclc_keys_"+user?.id,JSON.stringify(nk));}catch{}return nk;})} style={{padding:"2px 5px",borderRadius:4,fontSize:10,fontWeight:700,background:dispKey===n?"#6366f1":"rgba(255,255,255,.1)",color:"#fff",border:"none",cursor:"pointer"}}>{n}</button>)}
          </div>
          <button className="btn btn-g btn-xs" onClick={()=>changeKey(sid,origKey,+1)}>+1</button>
          <button className={`btn btn-xs ${notation==="fr"?"btn-p":"btn-g"}`} onClick={()=>setNotation("fr")}>Do</button>
          <button className={`btn btn-xs ${notation==="en"?"btn-p":"btn-g"}`} onClick={()=>setNotation("en")}>C</button>
          <button className="btn btn-g btn-xs" onClick={()=>setFontSize(f=>Math.max(12,f-2))}>A−</button>
          <button className="btn btn-g btn-xs" onClick={()=>setFontSize(f=>Math.min(32,f+2))}>A+</button>
          <button className={`btn btn-xs ${autoScroll?"btn-p":"btn-g"}`} onClick={()=>setAutoScroll(a=>!a)}>⏬</button>
        </div>
        {/* Corps : liste gauche + chant droite */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Liste chants - colonne gauche */}
          <div style={{width:180,flexShrink:0,borderRight:"1px solid rgba(255,255,255,.1)",overflowY:"auto",background:"rgba(0,0,0,.3)"}}>
            <div style={{padding:"8px 0",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:1,textAlign:"center"}}>Programme</div>
            {items.map((it,i)=>{
              const sd=getSong(it.songId||it.id,it.title||it.songTitle);
              return(<button key={i} onClick={()=>{setViewIdx(i);if(scrollRef.current)scrollRef.current.scrollTop=0;}} style={{
                width:"100%",padding:"10px 12px",
                background:i===viewIdx?"#6366f1":"transparent",
                color:i===viewIdx?"#fff":"rgba(255,255,255,.6)",
                border:"none",borderBottom:"1px solid rgba(255,255,255,.05)",
                cursor:"pointer",fontSize:12,fontWeight:i===viewIdx?700:400,
                textAlign:"left",display:"block",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"
              }}>{i+1}. {sd.title||it.title||"?"}</button>);
            })}
          </div>
          {/* Chant - colonne droite */}
          <div ref={scrollRef} style={{flex:1,overflow:"auto",padding:"20px 28px"}}>
            {(songData.sections&&songData.sections.length>0)?(
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                {songData.sections.map((sec,si)=>(
                  <div key={si} style={{width:"100%"}}>
                    <div style={{fontSize:fontSize*0.75,fontWeight:700,fontStyle:"italic",opacity:.5,marginBottom:6,textTransform:"uppercase",letterSpacing:1,color:"#94a3b8"}}>{sec.label}</div>
                    {(sec.lines||[]).map((line,li)=>{
                      const note=getLineNote(sid,si,li);
                      const isEditing=editingNote?.sid===sid&&editingNote?.si===si&&editingNote?.li===li;
                      return(
                        <div key={li} style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1}}>
                            {line.k==="chord"
                              ?<div style={{color:"#f87171",fontFamily:"monospace",fontWeight:700,fontSize:fontSize*0.9,whiteSpace:"pre",lineHeight:1.3}}>{transposeLine(line.t,st_,notation==="en"?"en":undefined)}</div>
                              :<div style={{fontSize,whiteSpace:"pre",lineHeight:1.8,color:"#f1f5f9"}}>{line.t}</div>
                            }
                          </div>
                          {isEditing?(
                            <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                              <input autoFocus value={noteInput} onChange={e=>setNoteInput(e.target.value)}
                                onKeyDown={e=>{if(e.key==="Enter")saveLineNote(sid,si,li,noteInput);if(e.key==="Escape")setEditingNote(null);}}
                                style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.3)",borderRadius:6,padding:"2px 8px",color:"#fff",fontSize:11,width:130,outline:"none"}}
                                placeholder="Ma note..."/>
                              <button onClick={()=>saveLineNote(sid,si,li,noteInput)} style={{background:"#6366f1",border:"none",borderRadius:4,color:"#fff",padding:"2px 6px",cursor:"pointer",fontSize:11}}>✓</button>
                              <button onClick={()=>setEditingNote(null)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:4,color:"#fff",padding:"2px 6px",cursor:"pointer",fontSize:11}}>✕</button>
                            </div>
                          ):(
                            <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                              {note&&<span style={{fontSize:11,color:"#FCD34D",fontStyle:"italic",background:"rgba(252,211,77,.1)",borderRadius:6,padding:"1px 8px",border:"1px solid rgba(252,211,77,.2)"}}>{note}</span>}
                              <button onClick={()=>{setEditingNote({sid,si,li});setNoteInput(note||"");}} style={{background:"transparent",border:"none",color:note?"#FCD34D":"rgba(255,255,255,.15)",cursor:"pointer",fontSize:12,padding:"0 2px"}} title="Annoter">✏️</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ):(
              <div style={{fontSize,color:"#94a3b8",fontStyle:"italic",textAlign:"center",marginTop:40}}>Aucune partition disponible.</div>
            )}
            {/* Navigation bas */}
            <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:30,paddingTop:20,borderTop:"1px solid rgba(255,255,255,.1)"}}>
              <button className="btn btn-g" disabled={viewIdx===0} onClick={()=>{setViewIdx(v=>v-1);if(scrollRef.current)scrollRef.current.scrollTop=0;}}>◀ Précédent</button>
              <span style={{color:"rgba(255,255,255,.4)",fontSize:12,alignSelf:"center"}}>{viewIdx+1} / {items.length}</span>
              <button className="btn btn-g" disabled={viewIdx===items.length-1} onClick={()=>{setViewIdx(v=>v+1);if(scrollRef.current)scrollRef.current.scrollTop=0;}}>Suivant ▶</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(!activeProg&&progs.length===0) return(
    <div>
      <div className="ph"><div><div className="pt">🎸 Vue Musicien</div><div className="ps">{ch.fullName}</div></div></div>
      <div className="card"><div className="empty"><div className="empty-icon">📋</div><div>Aucun programme à venir</div><div style={{fontSize:12,color:"var(--txt2)",marginTop:8}}>L'admin doit créer un programme.</div></div></div>
    </div>
  );

  return(
    <div>
      <div className="ph"><div><div className="pt">🎸 Vue Musicien</div><div className="ps">{ch.fullName} · Mode OnSong</div></div></div>
      {progs.length>1&&(
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",padding:"0 16px"}}>
          {progs.map((p,i)=>(
            <button key={p.id||i} className={`btn btn-sm ${i===progIdx?"btn-p":"btn-g"}`} onClick={()=>{setProgIdx(i);setViewIdx(null);}}>
              {p.date?new Date(p.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}):"—"}{p.title&&` · ${p.title}`}
            </button>
          ))}
        </div>
      )}
      {activeProg&&(
        <>
          <div className="card" style={{background:`linear-gradient(135deg,${ch.bg},white)`,border:`2px solid ${ch.color}`,margin:"0 16px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:18,color:ch.color}}>{activeProg.title||"Programme"}</div>
              <div style={{fontSize:13,color:"var(--txt2)",marginTop:4}}>{activeProg.date&&new Date(activeProg.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {items.length} chant(s)</div>
            </div>
            <button className="btn btn-p" onClick={()=>setViewIdx(0)}>▶ Démarrer</button>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12,padding:"0 16px"}}>
            <button className={`btn btn-xs ${notation==="fr"?"btn-p":"btn-g"}`} onClick={()=>setNotation("fr")}>Do Ré Mi</button>
            <button className={`btn btn-xs ${notation==="en"?"btn-p":"btn-g"}`} onClick={()=>setNotation("en")}>C D E</button>
          </div>
          {items.map((item,idx)=>{
            const sid=item.songId||item.id||("item-"+idx);
            const songData=getSong(sid,item.title||item.songTitle);
            const srcKey=songData.key||"Do"; // tonalité dans laquelle les accords sont écrits (bibliothèque)
            const origKey=item.key||srcKey;   // tonalité choisie dans le programme
            const dispKey=getKey(sid,origKey);
            const st_=semit(srcKey,dispKey);
            const normOrig=origKey.replace(/m$/,"").replace(/^Re$/,"Ré");
            const semitones=(st_+12)%12;
            const hasSections=songData.sections&&songData.sections.length>0;
            return(
              <div key={sid} className="card" style={{margin:"0 16px 12px",borderLeft:`4px solid ${ch.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{idx+1}. {item.title||item.songTitle||songData.title}</div>
                    <div style={{fontSize:12,color:"var(--txt2)",marginTop:2,display:"flex",gap:6,flexWrap:"wrap"}}>
                      {songData.categorie&&<span style={{background:"var(--sur2)",borderRadius:4,padding:"1px 6px"}}>{songData.categorie}</span>}
                      {songData.tempo&&<span>♩ {songData.tempo} BPM</span>}
                      {hasSections&&<span style={{color:"var(--ind)",fontSize:11}}>✓ Partition</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <div style={{fontWeight:800,fontSize:22,color:ch.color}}>{dispKey}</div>
                    {semitones!==0&&<div style={{fontSize:10,color:"var(--txt2)"}}>{semitones>6?semitones-12:semitones>0?"+"+semitones:semitones}st</div>}
                    <button className="btn btn-p btn-xs" onClick={()=>setViewIdx(idx)}>▶ Voir</button>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:3,flexWrap:"wrap",marginBottom:hasSections?8:0}}>
                  <button className="btn btn-g btn-xs" onClick={()=>changeKey(sid,origKey,-1)}>−1</button>
                  {CUR_NOTES.map(n=><button key={n} onClick={()=>setSongKeys(k=>{const nk={...k,[skey(sid)]:n};try{localStorage.setItem("jclc_keys_"+user?.id,JSON.stringify(nk));}catch{}return nk;})} className={`kbtn${dispKey===n?" on":""}`} style={{padding:"2px 6px",fontSize:10}}>{n}</button>)}
                  <button className="btn btn-g btn-xs" onClick={()=>changeKey(sid,origKey,+1)}>+1</button>
                  {dispKey!==origKey&&<button className="btn btn-g btn-xs" onClick={()=>setSongKeys(k=>{const nk={...k};delete nk[skey(sid)];try{localStorage.setItem("jclc_keys_"+user?.id,JSON.stringify(nk));}catch{}return nk;})}>↺ {origKey}</button>}
                </div>
                {hasSections&&(
                  <details>
                    <summary style={{fontSize:12,color:"var(--ind)",cursor:"pointer",userSelect:"none",padding:"4px 0"}}>Voir la partition</summary>
                    <div style={{marginTop:8,padding:10,background:"var(--sur2)",borderRadius:8,maxHeight:250,overflowY:"auto"}}>
                      {songData.sections.map((sec,si)=>(
                        <div key={si} style={{marginBottom:12}}>
                          <div className="cs-s">{sec.label}</div>
                          {(sec.lines||[]).map((line,li)=>(
                            line.k==="chord"
                              ?<div key={li} className="cs-c" style={{fontFamily:"monospace",fontWeight:700,whiteSpace:"pre",fontSize:12}}>{transposeLine(line.t,st_,notation==="en"?"en":undefined)}</div>
                              :<div key={li} className="cs-l" style={{whiteSpace:"pre",fontSize:13,lineHeight:1.7}}>{line.t}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
            <button className="btn btn-p" onClick={()=>setViewIdx(0)}>▶ Mode présentation plein écran</button>
          </div>
        </>
      )}
    </div>
  );
}
