import React, { useState, useRef, useEffect } from "react";
import { uid } from "../lib/helpers";
import { normalizeItems } from "../lib/music";
import { sbDel, sbGet, sbUpsert } from "../lib/supabase";

// ══════════════════════════════════════════════════

// ── ONGLET PASTEURS ──
export function PasteursTab({st,user}){
  const PASTEURS_DEFAUT=["Pasteur Stephen","Pasteur LASZLO"];
  const [lists,setLists]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [selIdx,setSelIdx]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [newTitle,setNewTitle]=useState("");
  const [songSearch,setSongSearch]=useState("");

  useEffect(()=>{
    sbGet("programs").then(progs=>{
      const pasts=progs.filter(p=>p.status==="pasteur");
      if(pasts.length===0){
        const defaults=PASTEURS_DEFAUT.map(name=>({id:uid(),title:name,date:new Date().toISOString().slice(0,10),songs:[],notes:"",church:"commun",status:"pasteur"}));
        defaults.forEach(l=>sbUpsert("programs",{id:l.id,title:l.title,church:"commun",date:l.date,pages:1,status:"pasteur",items:[],notes:""}));
        setLists(defaults);
      }else{
        setLists(pasts.map(p=>({...p,songs:normalizeItems(p.items||[])})));
      }
      setLoaded(true);
    });
  },[]);

  function save(newLists){
    setLists(newLists);
    newLists.forEach(l=>{
      sbUpsert("programs",{id:l.id,title:l.title,church:"commun",date:l.date||new Date().toISOString().slice(0,10),pages:1,status:"pasteur",items:l.songs||[],notes:l.notes||""});
    });
  }

  function createList(){
    if(!newTitle.trim())return;
    const nl=[...lists,{id:uid(),title:newTitle.trim(),date:new Date().toISOString().slice(0,10),songs:[],notes:"",church:"commun",status:"pasteur"}];
    save(nl);setSelIdx(nl.length-1);setNewTitle("");setShowNew(false);
  }

  function deleteList(i){
    const l=lists[i];
    if(!window.confirm("Supprimer ce profil ?"))return;
    sbDel("programs",l.id);
    const nl=lists.filter((_,j)=>j!==i);
    setLists(nl);setSelIdx(null);
  }

  function addSong(song){
    if(!activeList)return;
    const already=activeList.songs.find(s=>s.songId===song.id);
    if(already)return;
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:[...l.songs,{songId:song.id,title:song.title,key:song.key||"Do"}]}:l);
    save(nl);setSongSearch("");
  }

  function removeSong(si){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.filter((_,j)=>j!==si)}:l);
    save(nl);
  }

  function changeKey(si,key){
    const nl=lists.map((l,i)=>i===selIdx?{...l,songs:l.songs.map((s,j)=>j===si?{...s,key}:s)}:l);
    save(nl);
  }

  const activeList=selIdx!==null?lists[selIdx]:null;
  const filtered=[...st.songs].filter(s=>s.title&&s.title.toLowerCase().includes(songSearch.toLowerCase())).sort((a,b)=>a.title.localeCompare(b.title,'fr',{sensitivity:'base'})).slice(0,songSearch.trim()?20:8);

  if(!loaded)return<div className="card"><div className="empty">Chargement...</div></div>;

  return(
    <div>
      <div className="ph"><div><div className="pt">🙏 Profils Pasteurs</div><div className="ps">Listes de chants personnalisées par pasteur invité</div></div></div>
      <div style={{padding:"0 16px 16px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {lists.map((l,i)=>(
            <button key={l.id} className={`btn ${i===selIdx?"btn-p":"btn-g"}`} onClick={()=>setSelIdx(i===selIdx?null:i)}>
              🙏 {l.title}
            </button>
          ))}
          {showNew?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input className="inp" style={{width:200}} placeholder="Nom du pasteur..." value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")createList();if(e.key==="Escape"){setShowNew(false);setNewTitle("");}}} autoFocus/>
              <button className="btn btn-p btn-sm" onClick={createList}>✓ Créer</button>
              <button className="btn btn-g btn-sm" onClick={()=>{setShowNew(false);setNewTitle("");}}>✕</button>
            </div>
          ):(
            <button className="btn btn-g" onClick={()=>setShowNew(true)}>+ Nouveau pasteur</button>
          )}
        </div>

        {activeList&&(
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:17}}>🙏 {activeList.title}</div>
              <button className="btn btn-d btn-xs" onClick={()=>deleteList(selIdx)}>🗑 Supprimer</button>
            </div>
            <div style={{marginBottom:12}}>
              <input className="inp" placeholder="🔍 Rechercher un chant par titre..." value={songSearch} onChange={e=>setSongSearch(e.target.value)} style={{width:"100%"}}/>
              {songSearch&&(
                <div style={{background:"var(--sur2)",borderRadius:8,marginTop:4,maxHeight:200,overflowY:"auto"}}>
                  {filtered.length===0?<div style={{padding:12,color:"var(--txt2)",fontSize:13}}>Aucun chant trouvé</div>
                  :filtered.map(s=>(
                    <div key={s.id} style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid var(--bdr)",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                      onClick={()=>addSong(s)}>
                      <span style={{fontSize:13}}>{s.title}</span>
                      <span style={{fontSize:11,color:"var(--txt2)"}}>{s.key||"Do"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {activeList.songs.length===0?(
              <div className="empty"><div className="empty-icon">🎵</div><div>Aucun chant — recherchez ci-dessus pour en ajouter</div></div>
            ):(
              activeList.songs.map((item,si)=>{
                const song=st.songs.find(s=>s.id===item.songId)||{};
                return(
                  <div key={si} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--bdr)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14}}>{si+1}. {item.title||song.title}</div>
                      {song.categorie&&<div style={{fontSize:11,color:"var(--txt2)"}}>{song.categorie}</div>}
                    </div>
                    <select className="sel" style={{width:90,fontSize:12,padding:"4px 6px"}} value={item.key||"Do"} onChange={e=>changeKey(si,e.target.value)}>
                      {["Do","Do#","Ré","Ré#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si","Lam","Rém","Mim","Fa#m","Solm","Do#m"].map(k=><option key={k} value={k}>{k}</option>)}
                    </select>
                    <button className="btn btn-d btn-xs btn-ic" onClick={()=>removeSong(si)}>🗑</button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
