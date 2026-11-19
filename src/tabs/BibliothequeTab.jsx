import React, { useState, useRef, useEffect } from "react";

export function BibliothèqueTab({st,canManage,M,deleteSong}){
  const [search,setSearch]=useState("");
  const sorted=[...st.songs].sort((a,b)=>a.title.localeCompare(b.title,"fr",{sensitivity:"base"}));
  const filtered=sorted.filter(s=>{
    if(!search)return true;
    const q=search.toLowerCase();
    return s.title.toLowerCase().includes(q)||(s.tags||[]).some(t=>t.includes(q))||(s.categorie||"").toLowerCase().includes(q);
  });
  return(
    <div>
      <div className="ph">
        <div><div className="pt">Bibliothèque de chants</div><div className="ps">Accords transposables · {st.songs.length} chant(s) · Tri alphabétique</div></div>
        {canManage&&<div style={{display:"flex",gap:8}}><button className="btn btn-g btn-sm" onClick={M.importSong}>📥 Importer</button><button className="btn btn-p btn-sm" onClick={M.addSong}>+ Ajouter</button></div>}
      </div>
      {canManage&&<div className="ib grn" style={{marginBottom:14}}>✓ Vous avez accès à la gestion des chants</div>}
      <div style={{marginBottom:16}}>
        <input className="inp" style={{width:"100%"}} placeholder="🔍 Rechercher par titre, catégorie ou tag…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {filtered.length===0?<div className="empty"><div className="empty-icon">🎵</div><div>Aucun chant trouvé</div></div>
      :<div className="sg">{filtered.map(song=>(
        <div className="sc" key={song.id}>
          <div className="st">{song.title}</div>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
            <span className="skb">Ton. {song.key}</span>
            {song.tempo&&<span style={{fontSize:10,color:"var(--txt2)",fontWeight:600}}>♩ {song.tempo}</span>}
            {song.categorie&&<span className={`musicien-cat cat-${(song.categorie||"").replace(/[&\s]/g,"-")}`} style={{fontSize:10}}>{song.categorie}</span>}
          </div>
          {song.author&&<div style={{fontSize:12,color:"var(--txt2)",marginBottom:6}}>{song.author}</div>}
          <div style={{marginBottom:12}}>{(song.tags||[]).map(t=><span key={t} className="tc">{t}</span>)}</div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-p btn-sm" style={{flex:1}} onClick={()=>M.viewSong(song)}>🎵 Voir</button>
            {canManage&&<><button className="btn btn-g btn-xs btn-ic" onClick={()=>M.editSong(song)}>✏️</button><button className="btn btn-d btn-xs btn-ic" onClick={()=>deleteSong(song.id)}>🗑</button></>}
          </div>
        </div>
      ))}</div>}
    </div>
  );
}
