import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";
import { uid } from "../lib/helpers";
import { FR_NOTES, normalizeItems, semit, transposeLine } from "../lib/music";
import { sbDel, sbGet, sbUpsert } from "../lib/supabase";

// ══════════════════════════════════════════════════
//  RÉPÉTITION TAB
// ══════════════════════════════════════════════════
export function RepetitionTab({st,church,isAdmin,user}){
  const ch=CHURCHES[church]||CHURCHES.lognes;
  const [lists,setLists]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [selIdx,setSelIdx]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [newTitle,setNewTitle]=useState("");
  const [songSearch,setSongSearch]=useState("");
  const [editNoteIdx,setEditNoteIdx]=useState(null);
  const [noteText,setNoteText]=useState("");
  const [metroActive,setMetroActive]=useState(null);
  const [metroTimer,setMetroTimer]=useState(null);
  const [tapTimes,setTapTimes]=useState([]);
  const [presentMode,setPresentMode]=useState(false);
  const [presentIdx,setPresentIdx]=useState(0);

  useEffect(()=>{
    sbGet("programs").then(progs=>{
      const reps=progs.filter(p=>p.status==="repetition"&&(p.church===church||p.churchId===church));
      setLists(reps.map(p=>{
        let songs=p.items||[];
        if(typeof songs==="string"){try{songs=JSON.parse(songs);}catch{songs=[];}}
        return{...p,songs:normalizeItems(songs)};
      }));
      setLoaded(true);
    });
  },[church]);

  useEffect(()=>{
    if(metroActive!==null&&activeList){
      const s=activeList.songs[metroActive];
      const bpm=s?.bpm||80;
      const interval=Math.round(60000/bpm);
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      let t=ctx.currentTime;
      const tick=()=>{
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);
        osc.frequency.value=880;
        gain.gain.setValueAtTime(0.3,t);
        gain.gain.exponentialRampToValueAtTime(0.001,t+0.05);
        osc.start(t);osc.stop(t+0.05);
        t+=interval/1000;
      };
      tick();
      const timer=setInterval(tick,interval);
      setMetroTimer({timer,ctx});
      return()=>{clearInterval(timer);ctx.close();};
    }
  },[metroActive]);

  function toggleMetro(si){
    if(metroActive===si){
      if(metroTimer){clearInterval(metroTimer.timer);metroTimer.ctx.close();}
      setMetroActive(null);setMetroTimer(null);
    }else{
      if(metroTimer){clearInterval(metroTimer.timer);metroTimer.ctx.close();}
      setMetroActive(si);setMetroTimer(null);
    }
  }

  function tap(si){
    const now=Date.now();
    const newTaps=[...tapTimes,now].slice(-4);
    setTapTimes(newTaps);
    if(newTaps.length>=2){
      const intervals=newTaps.slice(1).map((t,i)=>t-newTaps[i]);
      const avg=intervals.reduce((a,b)=>a+b,0)/intervals.length;
      const bpm=Math.round(60000/avg);
      const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.map((s,j)=>j===si?{...s,bpm}:s)}:l);
      save(nl);
    }
  }

  function save(newLists){
    setLists(newLists);
    newLists.forEach(l=>{
      sbUpsert("programs",{id:l.id,title:l.title,church:l.church||church,date:l.date||new Date().toISOString().slice(0,10),pages:1,status:"repetition",items:l.songs||[],notes:l.notes||""});
    });
  }

  function createList(){
    if(!newTitle.trim())return;
    const nl=[...lists,{id:uid(),title:newTitle.trim(),date:new Date().toISOString().slice(0,10),songs:[],notes:"",church}];
    save(nl);setSelIdx(nl.length-1);setNewTitle("");setShowNew(false);
  }

  function deleteList(i){
    const l=lists[i];const nl=lists.filter((_,j)=>j!==i);
    save(nl);setSelIdx(null);
    if(l&&l.id)sbDel("programs",l.id);
  }

  function addSong(song){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:[...l.songs,{id:song.id,title:song.title,key:song.key,dispKey:song.key,note:"",bpm:song.tempo||80,audioUrl:""}]}:l);
    save(nl);setSongSearch("");
  }

  function removeSong(si){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.filter((_,j)=>j!==si)}:l);
    save(nl);
  }

  function moveSong(si,dir){
    const nl=lists.map((l,i)=>{
      if(i!==selIdx)return l;
      const s=[...l.songs];const ti=si+dir;
      if(ti<0||ti>=s.length)return l;
      [s[si],s[ti]]=[s[ti],s[si]];
      return{...l,songs:s};
    });
    save(nl);
  }

  function updateSongKey(si,key){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.map((s,j)=>j===si?{...s,dispKey:key}:s)}:l);
    save(nl);
  }

  function updateSongNote(si,note){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.map((s,j)=>j===si?{...s,note}:s)}:l);
    save(nl);
  }

  function updateSongAudio(si,audioUrl){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.map((s,j)=>j===si?{...s,audioUrl}:s)}:l);
    save(nl);
  }

  function updateListNote(note){
    const nl=lists.map((l,i)=>i===selIdx?{...l,notes:note}:l);
    save(nl);
  }

  const activeList=selIdx!==null?lists[selIdx]:null;
  const filtered=st.songs.filter(s=>s.title.toLowerCase().includes(songSearch.toLowerCase())).slice(0,8);
  const NOTES_FR=FR_NOTES;

  if(presentMode&&activeList){
    const song=activeList.songs[presentIdx];
    const songData=st.songs.find(x=>x.id===song?.id)||{title:song?.title,sections:[]};
    const dispKey=song?.dispKey||song?.key||"Do";
    const st_=semit(song?.key||"Do",dispKey);
    return(
      <div style={{position:"fixed",inset:0,background:"#0f172a",color:"#f1f5f9",zIndex:9999,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",background:"rgba(0,0,0,.5)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          <button className="btn btn-g btn-sm" onClick={()=>setPresentMode(false)}>← Retour</button>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontWeight:700,fontSize:15}}>{song?.title}</div>
            <div style={{fontSize:11,opacity:.5}}>Ton. {dispKey} {song?.bpm?`· ${song.bpm} BPM`:""} · {presentIdx+1}/{activeList.songs.length}</div>
          </div>
          <button className="btn btn-g btn-sm" disabled={presentIdx===0} onClick={()=>setPresentIdx(i=>i-1)}>◀</button>
          <button className="btn btn-g btn-sm" disabled={presentIdx===activeList.songs.length-1} onClick={()=>setPresentIdx(i=>i+1)}>▶</button>
        </div>
        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          <div style={{width:160,borderRight:"1px solid rgba(255,255,255,.1)",overflowY:"auto",background:"rgba(0,0,0,.3)"}}>
            {activeList.songs.map((s,i)=>(
              <button key={i} onClick={()=>setPresentIdx(i)} style={{width:"100%",padding:"10px 12px",background:i===presentIdx?"#6366f1":"transparent",color:i===presentIdx?"#fff":"rgba(255,255,255,.5)",border:"none",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer",fontSize:12,textAlign:"left",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {i+1}. {s.title}
              </button>
            ))}
          </div>
          <div style={{flex:1,overflow:"auto",padding:"20px 28px"}}>
            {song?.note&&<div style={{background:"rgba(252,211,77,.1)",border:"1px solid rgba(252,211,77,.3)",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:13,color:"#FCD34D"}}>📝 {song.note}</div>}
            {song?.audioUrl&&<a href={song.audioUrl} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(99,102,241,.2)",border:"1px solid rgba(99,102,241,.4)",borderRadius:8,padding:"6px 12px",color:"#a5b4fc",fontSize:12,marginBottom:14,textDecoration:"none"}}>🎵 Écouter</a>}
            {(songData.sections||[]).map((sec,si)=>(
              <div key={si} style={{marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,fontStyle:"italic",opacity:.5,marginBottom:6,textTransform:"uppercase",color:"#94a3b8"}}>{sec.label}</div>
                {(sec.lines||[]).map((line,li)=>(
                  line.k==="chord"
                    ?<div key={li} style={{color:"#f87171",fontFamily:"monospace",fontWeight:700,fontSize:15,whiteSpace:"pre",lineHeight:1.3}}>{transposeLine(line.t,st_)}</div>
                    :<div key={li} style={{fontSize:16,whiteSpace:"pre",lineHeight:1.8,color:"#f1f5f9"}}>{line.t}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if(!activeList) return(
    <div>
      <div className="ph">
        <div><div className="pt">🎼 Répétitions</div><div className="ps">{ch.fullName}</div></div>
        {(isAdmin||user?.canEditProg)&&<button className="btn btn-p btn-sm" onClick={()=>setShowNew(true)}>+ Nouvelle liste</button>}
      </div>
      {showNew&&(
        <div className="card" style={{margin:"0 16px 16px"}}>
          <div style={{fontWeight:700,marginBottom:10}}>Nouvelle liste</div>
          <input className="inp" placeholder="Ex: Répétition Dimanche 29 juin" value={newTitle} onChange={e=>setNewTitle(e.target.value)} style={{marginBottom:10}}/>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-g" onClick={()=>setShowNew(false)}>Annuler</button>
            <button className="btn btn-p" disabled={!newTitle.trim()} onClick={createList}>Créer →</button>
          </div>
        </div>
      )}
      {lists.length===0
        ?<div className="card"><div className="empty"><div className="empty-icon">🎼</div><div>Aucune liste de répétition</div></div></div>
        :<div style={{padding:"0 16px"}}>
          {lists.map((l,i)=>(
            <div key={l.id} className="card" style={{marginBottom:12,borderLeft:`4px solid ${ch.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>setSelIdx(i)}>
                  <div style={{fontWeight:700,fontSize:15}}>{l.title}</div>
                  <div style={{fontSize:12,color:"var(--txt2)",marginTop:2}}>{l.date&&new Date(l.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})} · {l.songs.length} chant(s)</div>
                </div>
                <button className="btn btn-p btn-sm" onClick={()=>{setSelIdx(i);setPresentMode(true);setPresentIdx(0);}}>▶</button>
                <button className="btn btn-g btn-sm" onClick={()=>setSelIdx(i)}>Ouvrir</button>
                <button className="btn btn-d btn-xs btn-ic" onClick={()=>{if(window.confirm("Supprimer ?"))deleteList(i);}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );

  return(
    <div>
      <div className="ph">
        <div>
          <button className="btn btn-g btn-sm" onClick={()=>{setSelIdx(null);setMetroActive(null);}} style={{marginBottom:6}}>← Listes</button>
          <div className="pt">🎼 {activeList.title}</div>
          <div className="ps">{activeList.date&&new Date(activeList.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})} · {activeList.songs.length} chant(s)</div>
        </div>
        <button className="btn btn-p btn-sm" onClick={()=>{setPresentMode(true);setPresentIdx(0);}}>▶ Présenter</button>
      </div>
      <div className="card" style={{margin:"0 16px 12px"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:6,color:"var(--txt2)"}}>📝 Notes DM</div>
        <textarea className="inp" rows={3} placeholder="Notes pour toute l'équipe..." value={activeList.notes||""} onChange={e=>updateListNote(e.target.value)} style={{resize:"vertical",fontSize:13}}/>
      </div>
      <div className="card" style={{margin:"0 16px 12px"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>+ Ajouter un chant</div>
        <input className="inp" placeholder="🔍 Rechercher..." value={songSearch} onChange={e=>setSongSearch(e.target.value)}/>
        {songSearch.trim()&&(
          <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
            {filtered.length===0?<div style={{fontSize:12,color:"var(--txt3)"}}>Aucun résultat</div>
            :filtered.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"var(--sur2)",borderRadius:8,cursor:"pointer"}} onClick={()=>addSong(s)}>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{s.title}</div><div style={{fontSize:11,color:"var(--txt2)"}}>Ton. {s.key}{s.categorie&&` · ${s.categorie}`}</div></div>
                <span style={{fontSize:18}}>+</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {activeList.songs.length===0
        ?<div className="card" style={{margin:"0 16px"}}><div className="empty"><div className="empty-icon">🎵</div><div>Aucun chant</div></div></div>
        :<div style={{padding:"0 16px"}}>
          {activeList.songs.map((s,si)=>{
            const songData=st.songs.find(x=>x.id===s.id)||{title:s.title,key:s.key,sections:[]};
            const dispKey=s.dispKey||s.key||"Do";
            const st_=semit(s.key||"Do",dispKey);
            const hasSections=songData.sections&&songData.sections.length>0;
            const bpm=s.bpm||80;
            const isMetroOn=metroActive===si;
            return(
              <div key={si} className="card" style={{marginBottom:10,borderLeft:`4px solid ${ch.color}`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <button className="btn btn-g btn-xs" disabled={si===0} onClick={()=>moveSong(si,-1)}>↑</button>
                    <button className="btn btn-g btn-xs" disabled={si===activeList.songs.length-1} onClick={()=>moveSong(si,1)}>↓</button>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{si+1}. {s.title}</div>
                    <div style={{fontSize:11,color:"var(--txt2)"}}>Original : {s.key}</div>
                  </div>
                  <div style={{fontWeight:800,fontSize:20,color:ch.color}}>{dispKey}</div>
                  <button className="btn btn-d btn-xs btn-ic" onClick={()=>removeSong(si)}>✕</button>
                </div>
                <div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:8}}>
                  {NOTES_FR.map(n=><button key={n} onClick={()=>updateSongKey(si,n)} className={`kbtn${dispKey===n?" on":""}`} style={{padding:"2px 6px",fontSize:10}}>{n}</button>)}
                  {dispKey!==s.key&&<button className="btn btn-g btn-xs" onClick={()=>updateSongKey(si,s.key)}>↺ {s.key}</button>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"var(--sur2)",borderRadius:8,marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--txt2)",flexShrink:0}}>🎵 {bpm} BPM</span>
                  <input type="range" min={40} max={220} value={bpm} onChange={e=>{const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.map((s2,j)=>j===si?{...s2,bpm:Number(e.target.value)}:s2)}:l);save(nl);}} style={{flex:1,accentColor:ch.color}}/>
                  <button className={`btn btn-xs ${isMetroOn?"btn-p":"btn-g"}`} onClick={()=>toggleMetro(si)}>{isMetroOn?"⏹":"▶ Metro"}</button>
                  <button className="btn btn-g btn-xs" onClick={()=>tap(si)}>TAP</button>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:11,color:"var(--txt2)",flexShrink:0}}>🎧</span>
                  <input className="inp" style={{flex:1,fontSize:11,padding:"4px 8px"}} placeholder="Lien YouTube, BandLab..." value={s.audioUrl||""} onChange={e=>updateSongAudio(si,e.target.value)}/>
                  {s.audioUrl&&<a href={s.audioUrl} target="_blank" rel="noreferrer" className="btn btn-g btn-xs">▶</a>}
                </div>
                {editNoteIdx===si?(
                  <div>
                    <textarea className="inp" rows={2} placeholder="Note..." value={noteText} onChange={e=>setNoteText(e.target.value)} style={{resize:"vertical",fontSize:12,marginBottom:6}}/>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn btn-g btn-xs" onClick={()=>setEditNoteIdx(null)}>Annuler</button>
                      <button className="btn btn-p btn-xs" onClick={()=>{updateSongNote(si,noteText);setEditNoteIdx(null);}}>Sauvegarder</button>
                    </div>
                  </div>
                ):(
                  <div>
                    {s.note&&<div style={{fontSize:12,background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:6,padding:"6px 10px",marginBottom:6,color:"#92400E"}}>📝 {s.note}</div>}
                    <button className="btn btn-g btn-xs" onClick={()=>{setEditNoteIdx(si);setNoteText(s.note||"");}}>{s.note?"✏️ Modifier":"+ Note"}</button>
                  </div>
                )}
                {hasSections&&(
                  <details style={{marginTop:8}}>
                    <summary style={{fontSize:12,color:"var(--ind)",cursor:"pointer",userSelect:"none",padding:"4px 0"}}>Voir la partition</summary>
                    <div style={{marginTop:8,padding:10,background:"var(--sur2)",borderRadius:8,maxHeight:200,overflowY:"auto"}}>
                      {songData.sections.map((sec,si2)=>(
                        <div key={si2} style={{marginBottom:10}}>
                          <div className="cs-s">{sec.label}</div>
                          {(sec.lines||[]).map((line,li)=>(
                            line.k==="chord"
                              ?<div key={li} className="cs-c" style={{fontFamily:"monospace",fontWeight:700,whiteSpace:"pre",fontSize:12}}>{transposeLine(line.t,st_)}</div>
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
        </div>
      }
    </div>
  );
}
