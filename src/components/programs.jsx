import React, { useState, useRef, useEffect } from "react";
import { LOGO_B64 } from "../assets/logoB64";
import { CATEGORIES_CHANT, CHURCHES } from "../config";
import { NOTES, NOTES_M, semit, transposeLine } from "../lib/music";

// ── PROGRAM FORM MODAL (avec pages et catégories) ──
export function ProgramFormModal({songs,program,onSave,onClose,churchId}){
  const [title,setTitle]=useState(program?.title||"");
  const [date,setDate]=useState(program?.date||"");
  const [notes,setNotes]=useState(program?.notes||"");
  const [pages,setPages]=useState(program?.pages||1);
  const [items,setItems]=useState(program?.items||[]);
  const [progChurch,setProgChurch]=useState(program?.churchId||program?.church||churchId||"creil");
  const [addId,setAddId]=useState("");
  const [addCat,setAddCat]=useState("");
  const [songSearch,setSongSearch]=useState("");
  const [showResults,setShowResults]=useState(false);

  const songsSorted=[...songs].sort((a,b)=>a.title.localeCompare(b.title,'fr',{sensitivity:'base'}));
  const filteredSongs=songsSorted.filter(s=>s.title&&s.title.toLowerCase().includes(songSearch.toLowerCase())).slice(0,15);

  const addItem=()=>{
    if(!addId)return;
    const s=songs.find(x=>x.id===addId);if(!s)return;
    setItems(it=>[...it,{songId:addId,key:s.key,categorie:addCat||s.categorie||"",notesProg:""}]);
    setAddId("");setAddCat("");setSongSearch("");setShowResults(false);
  };
  const selectSong=(s)=>{
    setAddId(s.id);setSongSearch(s.title);setShowResults(false);
  };
  const remItem=i=>setItems(it=>it.filter((_,j)=>j!==i));
  const updItem=(i,k,v)=>setItems(it=>it.map((x,j)=>j===i?{...x,[k]:v}:x));
  const moveItem=(i,dir)=>setItems(it=>{const a=[...it],b=i+dir;if(b<0||b>=a.length)return a;[a[i],a[b]]=[a[b],a[i]];return a;});

  const canSave=title&&items.length>=(pages*2);
  const minChants=pages*2;

  return(
    <div className="modal" style={{width:620}}>
      <div className="modal-t">{program?"Modifier":"Créer un programme"}</div>
      <div className="modal-s">Programme imprimable avec accords · 3 pages max · minimum 2 chants/page</div>

      <div className="g2">
        <div className="fld"><label>Titre *</label><input className="inp" placeholder="Ex : Culte du dimanche" value={title} onChange={e=>setTitle(e.target.value)}/></div>
        <div className="fld"><label>Date</label><input className="inp" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
      </div>
      <div className="fld" style={{marginBottom:12}}><label>Assemblée</label><select className="sel" value={progChurch} onChange={e=>setProgChurch(e.target.value)}>{Object.values(CHURCHES).map(c=><option key={c.id} value={c.id}>{c.fullName}</option>)}</select></div>
      <div className="g2">
        <div className="fld"><label>Nombre de pages (max 3)</label>
          <select className="sel" value={pages} onChange={e=>setPages(Number(e.target.value))}>
            <option value={1}>1 page</option><option value={2}>2 pages</option><option value={3}>3 pages</option>
          </select>
        </div>
        <div className="fld"><label>Notes</label><input className="inp" placeholder="Thème, remarques…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
      </div>

      {!canSave&&<div className="ib amb">⚠️ Minimum {minChants} chant(s) requis pour {pages} page(s) (2 par page)</div>}

      <div className="divider"/>
      <div style={{maxHeight:300,overflowY:"auto"}}>
        {items.map((item,i)=>{const s=songs.find(x=>x.id===item.songId);return s?(
          <div key={i} style={{background:"var(--sur2)",borderRadius:"var(--r)",padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{fontWeight:700,fontSize:13,flex:1}}>{i+1}. {s.title}</div>
              <button className="btn btn-g btn-xs" onClick={()=>moveItem(i,-1)} disabled={i===0}>↑</button>
              <button className="btn btn-g btn-xs" onClick={()=>moveItem(i,1)} disabled={i===items.length-1}>↓</button>
              <button className="btn btn-d btn-xs btn-ic" onClick={()=>remItem(i)}>✕</button>
            </div>
            <div className="g2">
              <div className="fld" style={{marginBottom:0}}>
                <label>Catégorie</label>
                <select className="sel" value={item.categorie||""} onChange={e=>updItem(i,"categorie",e.target.value)}>
                  <option value="">Sans catégorie</option>
                  {CATEGORIES_CHANT.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="fld" style={{marginBottom:0}}>
                <label>Tonalité</label>
                <select className="sel" value={item.key} onChange={e=>updItem(i,"key",e.target.value)}>
                  {NOTES.map(k=><option key={k} value={k}>{k}{k===s.key?" (original)":""}</option>)}
                  {NOTES_M.map(k=><option key={k} value={k}>{k}{k===s.key?" (original)":""}</option>)}
                </select>
              </div>
            </div>
            {(()=>{const st_=semit(s.key,item.key);return st_!==0&&<div style={{marginTop:6,fontSize:11,color:"var(--ind)",fontWeight:600}}>↑ Transposé de {st_} demi-ton(s) depuis {s.key}</div>;})()}
          </div>
        ):null;})}
      </div>

      <div style={{marginTop:10}}>
        <div style={{position:"relative",marginBottom:8}}>
          <input className="inp" style={{width:"100%"}} placeholder="🔍 Rechercher un chant par titre..." value={songSearch}
            onChange={e=>{setSongSearch(e.target.value);setShowResults(true);setAddId("");}}
            onFocus={()=>setShowResults(true)}
            onBlur={()=>setTimeout(()=>setShowResults(false),200)}
          />
          {showResults&&songSearch&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--sur)",border:"1px solid var(--bdr)",borderRadius:10,zIndex:50,maxHeight:220,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.12)"}}>
              {filteredSongs.length===0
                ?<div style={{padding:12,color:"var(--txt2)",fontSize:13,textAlign:"center"}}>Aucun chant trouvé</div>
                :filteredSongs.map(s=>(
                  <div key={s.id} onMouseDown={()=>selectSong(s)}
                    style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid var(--bdr)",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background .1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--sur2)"}
                    onMouseLeave={e=>e.currentTarget.style.background=""}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{s.title}</div>
                      {s.categorie&&<div style={{fontSize:11,color:"var(--txt2)"}}>{s.categorie}</div>}
                    </div>
                    <span style={{fontSize:11,color:"var(--txt3)",background:"var(--sur2)",padding:"2px 8px",borderRadius:20}}>{s.key}</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select className="sel" style={{flex:1}} value={addCat} onChange={e=>setAddCat(e.target.value)}>
            <option value="">Catégorie</option>
            {CATEGORIES_CHANT.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-p btn-sm" onClick={addItem} disabled={!addId}>+ Ajouter</button>
        </div>
      </div>

      <div className="flex-end">
        <button className="btn btn-g" onClick={onClose}>Annuler</button>
        <button className="btn btn-p" disabled={!title||items.length<minChants} onClick={()=>onSave({id:program?.id,title,date,notes,pages,items,churchId:progChurch})}>
          {program?"Sauvegarder →":"Créer →"}
        </button>
      </div>
    </div>
  );
}

// ── PROGRAM VIEW MODAL ──
export function ProgramViewModal({program,songs,onClose}){
  const printRef=useRef();
  function print(){const w=window.open("","_blank");w.document.write(`<html><head><title>${program.title}</title><style>body{font-family:monospace;font-size:18px;line-height:2;padding:32px;}.head{display:flex;align-items:center;gap:14px;border-bottom:2px solid #eee;padding-bottom:14px;margin-bottom:20px;}.head img{width:52px;height:52px;object-fit:contain;}h1{font-size:24px;font-weight:700;margin:2px 0;font-family:serif;}h2{font-size:20px;font-weight:700;text-decoration:underline;margin:22px 0 4px;font-family:serif;}.s{font-style:italic;font-weight:700;margin:12px 0 2px;font-size:16px;}.c{color:#CC1F00!important;font-weight:700;white-space:pre;font-size:16px;}.cs-c{color:#CC1F00!important;font-weight:700;white-space:pre;font-size:16px;}.l{white-space:pre;font-size:18px;}.hr{border:none;border-top:1.5px solid #ddd;margin:18px 0;}.cat-badge{display:inline-block;padding:1px 8px;border-radius:20px;font-size:12px;background:#EDE9FE;color:#5B21B6;margin-bottom:6px;}</style></head><body>${printRef.current.innerHTML}</body></html>`);w.document.close();w.print();}
  function printChantres(){const w=window.open("","_blank");const lyrics=program.items.map(item=>{const s=songs.find(x=>x.id===item.songId);if(!s)return "";const key=item.key||s.key;return `<div style="margin-bottom:28px"><div style="font-family:serif;font-size:16px;font-weight:700;text-decoration:underline;margin-bottom:8px">${s.title} <span style="font-size:12px;font-weight:400;font-style:italic">(${key})</span></div>${(s.sections||[]).map(sec=>`<div style="margin-bottom:10px"><div style="font-style:italic;font-weight:700;font-size:13px;margin-bottom:4px">${sec.label}</div>${(sec.lines||[]).filter(l=>l.k==="lyric"&&l.t.trim()).map(l=>`<div style="font-size:15px;line-height:1.8">${l.t}</div>`).join("")}</div>`).join("")}</div>`;}).join('<hr style="border:none;border-top:1px solid #ddd;margin:18px 0"/>');w.document.write(`<html><head><title>${program.title} — Chantres</title><style>body{font-family:sans-serif;font-size:14px;line-height:1.8;padding:32px;max-width:800px;margin:0 auto;}@media print{body{padding:16px;}}</style></head><body><div style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #eee;padding-bottom:14px;margin-bottom:20px"><div><div style="font-size:10px;color:#B45309;font-weight:700;letter-spacing:2px;text-transform:uppercase">Jésus-Christ Le Chemin</div><div style="font-family:serif;font-size:18px;font-weight:700">${program.title} — Version Chantres</div><div style="font-size:12px;color:#666">${program.date?new Date(program.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):""}</div></div></div>${lyrics}</body></html>`);w.document.close();w.print();}
  const pages=program.pages||1;
  const pageItems=pages===1?[program.items]:pages===2?[program.items.slice(0,Math.ceil(program.items.length/2)),program.items.slice(Math.ceil(program.items.length/2))]:[program.items.slice(0,Math.ceil(program.items.length/3)),program.items.slice(Math.ceil(program.items.length/3),Math.ceil(program.items.length*2/3)),program.items.slice(Math.ceil(program.items.length*2/3))];
  return(
    <div className="modal" style={{width:700,maxWidth:"95vw"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <div style={{flex:1}}><div className="modal-t">{program.title}</div><div className="modal-s">{program.date&&new Date(program.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {program.items.length} chant(s) · {pages} page(s)</div></div>
        <button className="btn btn-p btn-sm no-print" onClick={print}>🖨️ Imprimer</button>
        <button className="btn btn-g btn-sm no-print" onClick={printChantres}>🎤 Chantres</button>
        <button className="btn btn-g btn-sm no-print" onClick={onClose}>✕</button>
      </div>
      <div ref={printRef}>
        <div style={{display:"flex",alignItems:"center",gap:14,borderBottom:"2px solid var(--bdr)",paddingBottom:14,marginBottom:18}}>
          <img src={LOGO_B64} alt="JCLC" style={{width:52,height:52,objectFit:"contain"}}/>
          <div>
            <div style={{fontSize:10,color:"#B45309",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase"}}>Jésus-Christ Le Chemin</div>
            <div style={{fontFamily:"serif",fontSize:18,fontWeight:700,margin:"2px 0"}}>{program.title}</div>
            <div style={{fontSize:12,color:"var(--txt2)"}}>{program.date&&new Date(program.date+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} — {CHURCHES[program.churchId]?.fullName||"Église de Creil"}{program.notes&&` · ${program.notes}`}</div>
          </div>
        </div>
        {pageItems.map((pItems,pi)=>(
          <div key={pi}>
            {pi>0&&<div className="prog-page-sep"/>}
            {pages>1&&<div style={{fontWeight:700,fontSize:11,color:"var(--txt3)",textTransform:"uppercase",marginBottom:12}}>Page {pi+1}/{pages}</div>}
            {pItems.map((item,i)=>{
              const s=songs.find(x=>x.id===item.songId);if(!s)return null;
              const key=item.key||s.key,st_=semit(s.key,key);
              return(<div key={i}>{i>0&&<hr style={{border:"none",borderTop:"1.5px solid var(--bdr)",margin:"18px 0"}}/>}
                <div style={{fontFamily:"serif",fontSize:15,fontWeight:700,textDecoration:"underline",marginBottom:4}}>
                  {i+1+pi*(Math.ceil(program.items.length/pages))}. {s.title} <span style={{fontSize:12,fontWeight:400,fontStyle:"italic"}}>({key})</span>
                </div>
                {item.categorie&&<div style={{fontSize:10,display:"inline-block",padding:"1px 8px",borderRadius:20,background:"#EDE9FE",color:"#5B21B6",fontWeight:700,marginBottom:6}}>{item.categorie}</div>}
                {s.tempo&&<div style={{fontSize:11,color:"var(--txt2)",marginBottom:4}}>♩ {s.tempo} BPM</div>}
                <div className="cs" style={{marginTop:6}}>{s.sections.map((sec,si)=><div key={si} style={{marginBottom:10}}><div className="cs-s">{sec.label}</div>{sec.lines.map((line,li)=>line.k==="chord"?<div key={li} className="cs-c">{transposeLine(line.t,st_)}</div>:<div key={li} className="cs-l">{line.t}</div>)}</div>)}</div>
              </div>);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
