import React, { useState, useRef, useEffect } from "react";
import { CATEGORIES_CHANT } from "../config";
import { EN_NOTES, FR_NOTES, NOTES, NOTES_M, prefKey, semit, toChordPro, transposeLine } from "../lib/music";

// ── SONG VIEW MODAL ──
// Map note names to frequencies (C4 scale)
export const NOTE_FREQ={"Do":261.63,"Do#":277.18,"Ré":293.66,"Ré#":311.13,"Mi":329.63,"Fa":349.23,"Fa#":369.99,"Sol":392.00,"Sol#":415.30,"La":440.00,"La#":466.16,"Si":493.88,"Réb":277.18,"Mib":311.13,"Lab":415.30,"Sib":466.16,"Solb":369.99,"Lam":440.00,"Rém":293.66,"Mim":329.63,"Fa#m":369.99,"Solm":392.00,"Do#m":277.18};

export function playNote(noteName){
  try{
    const freq=NOTE_FREQ[noteName]||NOTE_FREQ[noteName.replace("m","")];
    if(!freq)return;
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.type="triangle";
    osc.frequency.setValueAtTime(freq,ctx.currentTime);
    gain.gain.setValueAtTime(0.4,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime+1.2);
  }catch(e){}
}

export function ChordLineEditor({line,si,li,st_,notation,song,onSave}){
  const [editing,setEditing]=React.useState(false);
  const [val,setVal]=React.useState(line.t);
  if(!editing) return(
    <div className="cs-c" style={{fontFamily:"monospace",fontWeight:700,whiteSpace:"pre",cursor:onSave?"pointer":undefined,position:"relative"}}
      title={onSave?"Cliquer pour modifier l'accord":undefined}
      onClick={()=>{if(onSave){setVal(line.t);setEditing(true);}}}>
      {transposeLine(line.t,st_,notation==="en"?"en":undefined)}
      {onSave&&<span style={{fontSize:9,color:"rgba(204,31,0,.4)",marginLeft:4}}>✏️</span>}
    </div>
  );
  function save(){
    const newSections=song.sections.map((sec,sii)=>sii!==si?sec:{...sec,lines:sec.lines.map((l,lii)=>lii!==li?l:{...l,t:val})});
    onSave({...song,sections:newSections});
    setEditing(false);
  }
  return(
    <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:2}}>
      <input value={val} onChange={e=>setVal(e.target.value)}
        style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:"#CC1F00",background:"rgba(204,31,0,.08)",border:"1px solid #CC1F00",borderRadius:4,padding:"2px 6px",flex:1}}
        onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}}
        autoFocus/>
      <button className="btn btn-p btn-xs" onClick={save}>✓</button>
      <button className="btn btn-g btn-xs" onClick={()=>setEditing(false)}>✕</button>
    </div>
  );
}

export function SongViewModal({song,onSave,onClose}){
  const [curKey,setCurKey]=useState(prefKey(song.key||"Do"));
  const [notation,setNotation]=useState("fr");
  const [presentMode,setPresentMode]=useState(false);
  const [fontSize,setFontSize]=useState(14);
  const printRef=useRef();
  const st_=semit(song.key||"Do",curKey);
  function handleKeyClick(k){setCurKey(k);playNote(k);}
  function exportProPresenter(){
    // Export paroles uniquement sans accords - format ProPresenter/texte
    let out="";
    out+=song.title+"\n";
    out+="=".repeat(song.title.length)+"\n\n";
    (song.sections||[]).forEach(sec=>{
      out+=`[${sec.label.toUpperCase()}]\n`;
      (sec.lines||[]).forEach(line=>{
        if(line.k==="lyric"&&line.t.trim()){
          const fr={"à":"À","â":"Â","ä":"Ä","é":"É","è":"È","ê":"Ê","ë":"Ë","î":"Î","ï":"Ï","ô":"Ô","ö":"Ö","ù":"Ù","û":"Û","ü":"Ü","ç":"Ç","œ":"Œ","æ":"Æ"};
          out+=line.t.replace(/[àâäéèêëîïôöùûüçœæ]/gi,c=>fr[c]||c).toUpperCase()+"\n";
        }
      });
      out+="\n";
    });
    const blob=new Blob([out],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=song.title.replace(/[^a-zA-Z0-9]/g,"_")+"_ProPresenter.txt";
    a.click();
  }

  function exportCho(){
    const cp=toChordPro(song);
    const blob=new Blob([cp],{type:"text/plain"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=song.title.replace(/[^a-zA-Z0-9]/g,"_")+".cho";
    a.click();
  }
  function print(){
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>${song.title}</title><style>*{box-sizing:border-box;}body{font-family:monospace;font-size:13px;line-height:1.8;padding:28px;max-width:800px;margin:0 auto;}h1{font-size:17px;font-weight:700;text-decoration:underline;margin-bottom:4px;font-family:serif;}.meta{font-size:11px;color:#666;margin-bottom:18px;}.sec{margin-bottom:18px;}.sec-lbl{font-style:italic;font-weight:700;margin-bottom:4px;font-size:12px;}.chord{color:#CC1F00;font-weight:700;white-space:pre;font-size:12px;line-height:1.4;}.lyric{white-space:pre;font-size:13px;line-height:1.6;}@media print{body{padding:16px;}}</style></head><body><h1>${song.title}${curKey!==song.key?" (Ton. "+curKey+")":""}</h1><div class="meta">${[song.author,song.tempo?"♩ "+song.tempo+" BPM":"",song.categorie].filter(Boolean).join(" · ")}</div>${(song.sections||[]).map(sec=>`<div class="sec"><div class="sec-lbl">${sec.label}</div>${(sec.lines||[]).map(l=>l.k==="chord"?`<div class="chord">${transposeLine(l.t,st_,notation==="en"?"en":undefined)}</div>`:`<div class="lyric">${l.t}</div>`).join("")}</div>`).join("")}</body></html>`);
    w.document.close();w.print();
  }
  if(presentMode){
    return(
      <div style={{position:"fixed",inset:0,background:"#0f172a",color:"#fff",zIndex:9999,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 20px",background:"rgba(0,0,0,.4)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{flex:1,fontWeight:700,fontSize:16}}>{song.title} <span style={{fontWeight:400,fontSize:13,opacity:.7}}>({curKey})</span></div>
          <button className="btn btn-g btn-sm" onClick={()=>setFontSize(f=>Math.max(12,f-2))}>A−</button>
          <button className="btn btn-g btn-sm" onClick={()=>setFontSize(f=>Math.min(36,f+2))}>A+</button>
          <button className="btn btn-p btn-sm" onClick={()=>setPresentMode(false)}>✕ Quitter</button>
        </div>
        <div style={{flex:1,overflow:"auto",padding:"24px 40px",display:"flex",flexWrap:"wrap",gap:32,alignContent:"flex-start"}}>
          {(song.sections||[]).map((sec,si)=>(
            <div key={si} style={{width:"100%"}}>
              <div style={{fontSize:fontSize*0.8,fontWeight:700,fontStyle:"italic",opacity:.6,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{sec.label}</div>
              {(sec.lines||[]).map((line,li)=>(
                line.k==="chord"
                  ?<div key={li} style={{color:"#f87171",fontFamily:"monospace",fontWeight:700,fontSize:fontSize*0.85,whiteSpace:"pre",lineHeight:1.4}}>{transposeLine(line.t,st_,notation==="en"?"en":undefined)}</div>
                  :<div key={li} style={{fontSize,whiteSpace:"pre",lineHeight:1.7,color:"#f1f5f9"}}>{line.t}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return(
    <div className="modal" style={{width:680,maxWidth:"95vw"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
        <div style={{flex:1}}>
          <div className="modal-t">{song.title}</div>
          <div className="modal-s">Tonalité : <strong>{curKey}</strong>{song.author&&` · ${song.author}`}{song.tempo&&` · ♩ ${song.tempo} BPM`}{song.categorie&&` · ${song.categorie}`}</div>
        </div>
        <button className="btn btn-g btn-sm no-print" title="Présentation plein écran" onClick={()=>setPresentMode(true)}>⛶</button>
        <button className="btn btn-g btn-sm no-print" onClick={exportCho}>⬇ .cho</button>
        <button className="btn btn-g btn-sm no-print" title="Export ProPresenter (paroles uniquement)" onClick={exportProPresenter}>📺 Pro</button>
        <button className="btn btn-g btn-sm no-print" onClick={print}>🖨️</button>
        <button className="btn btn-g btn-sm no-print" onClick={onClose}>✕</button>
      </div>
      <div style={{background:"var(--sur2)",borderRadius:"var(--r)",padding:"12px 14px",marginBottom:14}} className="no-print">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".4px"}}>Transposer</div>
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <button className={`btn btn-xs ${notation==="fr"?"btn-p":"btn-g"}`} onClick={()=>setNotation("fr")}>Do Ré Mi</button>
            <button className={`btn btn-xs ${notation==="en"?"btn-p":"btn-g"}`} onClick={()=>setNotation("en")}>C D E</button>
          </div>
        </div>
        <div className="kgrid">
          {(notation==="fr"?FR_NOTES:EN_NOTES).map(k=><button key={k} className={`kbtn${curKey===k?" on":""}`} onClick={()=>handleKeyClick(k)}>{k}</button>)}
        </div>
        {st_!==0&&<div style={{marginTop:8,fontSize:12,color:"var(--ind)",fontWeight:600}}>↑ Transposé de {st_} demi-ton(s) → {curKey}</div>}
      </div>
      <div ref={printRef} style={{background:"var(--sur2)",borderRadius:"var(--r)",padding:"16px 18px",maxHeight:400,overflowY:"auto"}}>
        <div style={{fontFamily:"serif",fontSize:17,fontWeight:700,textDecoration:"underline",marginBottom:4}}>{song.title}{curKey!==song.key&&` (Ton. ${curKey})`}</div>
        {(song.sections||[]).map((sec,si)=>(
          <div key={si} style={{marginBottom:14}}>
            <div className="cs-s">{sec.label}</div>
            {(sec.lines||[]).map((line,li)=>(
              line.k==="chord"
                ?<ChordLineEditor key={li} line={line} si={si} li={li} st_={st_} notation={notation} song={song} onSave={onSave}/>
                :<div key={li} className="cs-l" style={{whiteSpace:"pre"}}>{line.t}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SONG FORM MODAL ──
export function SongFormModal({song,onSave,onClose}){
  const [title,setTitle]=useState(song?.title||"");
  const [key,setKey]=useState(prefKey(song?.key||"Do"));
  const [tempo,setTempo]=useState(song?.tempo||"");
  const [categorie,setCategorie]=useState(song?.categorie||"");
  const [author,setAuthor]=useState(song?.author||"");
  const [tags,setTags]=useState((song?.tags||[]).join(", "));
  const [sections,setSections]=useState(song?.sections||[{label:"Couplet 1",lines:[{k:"chord",t:""},{k:"lyric",t:""}]}]);
  const addSec=()=>setSections(s=>[...s,{label:`Section ${s.length+1}`,lines:[{k:"chord",t:""},{k:"lyric",t:""}]}]);
  const remSec=i=>setSections(s=>s.filter((_,j)=>j!==i));
  const updLbl=(i,v)=>setSections(s=>s.map((x,j)=>j===i?{...x,label:v}:x));
  const addLine=(si,k)=>setSections(s=>s.map((x,j)=>j===si?{...x,lines:[...x.lines,{k,t:""}]}:x));
  const remLine=(si,li)=>setSections(s=>s.map((x,j)=>j===si?{...x,lines:x.lines.filter((_,k)=>k!==li)}:x));
  const updLine=(si,li,v)=>setSections(s=>s.map((x,j)=>j===si?{...x,lines:x.lines.map((l,k)=>k===li?{...l,t:v}:l)}:x));
  const togK=(si,li)=>setSections(s=>s.map((x,j)=>j===si?{...x,lines:x.lines.map((l,k)=>k===li?{...l,k:l.k==="chord"?"lyric":"chord"}:l)}:x));
  return(
    <div className="modal" style={{width:620}}>
      <div className="modal-t">{song?"Modifier le chant":"Ajouter un chant"}</div>
      <div className="modal-s">Alternez les lignes "Accord" (rouge) et "Paroles"</div>
      <div className="g2">
        <div className="fld"><label>Titre *</label><input className="inp" placeholder="Titre du chant" value={title} onChange={e=>setTitle(e.target.value)}/></div>
        <div className="fld"><label>Tonalité de base</label><select className="sel" value={key} onChange={e=>setKey(e.target.value)}>{NOTES.map(k=><option key={k} value={k}>{k}</option>)}{NOTES_M.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
      </div>
      <div className="g2">
        <div className="fld"><label>Catégorie</label><select className="sel" value={categorie} onChange={e=>setCategorie(e.target.value)}><option value="">Sans catégorie</option>{CATEGORIES_CHANT.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div className="fld"><label>Tempo (BPM)</label><input className="inp" type="number" placeholder="Ex: 80" value={tempo} onChange={e=>setTempo(e.target.value)}/></div>
      </div>
      <div className="g2">
        <div className="fld"><label>Auteur</label><input className="inp" placeholder="Auteur / Compositeur" value={author} onChange={e=>setAuthor(e.target.value)}/></div>
        <div className="fld"><label>Tags (virgule)</label><input className="inp" placeholder="louange, adoration…" value={tags} onChange={e=>setTags(e.target.value)}/></div>
      </div>
      <div className="divider"/>
      <div style={{maxHeight:300,overflowY:"auto"}}>
        {sections.map((sec,si)=>(
          <div key={si} style={{background:"var(--sur2)",borderRadius:"var(--r)",padding:"12px 14px",marginBottom:10}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input className="inp" style={{flex:1}} placeholder="Nom de la section" value={sec.label} onChange={e=>updLbl(si,e.target.value)}/>
              <button className="btn btn-d btn-xs btn-ic" onClick={()=>remSec(si)} disabled={sections.length===1}>✕</button>
            </div>
            {sec.lines.map((line,li)=>(
              <div key={li} style={{display:"flex",gap:6,marginBottom:5}}>
                <button className="btn btn-xs" style={{minWidth:60,background:line.k==="chord"?"#FEF2F2":"var(--sur2)",color:line.k==="chord"?"var(--red)":"var(--txt2)",border:`1.5px solid ${line.k==="chord"?"rgba(220,38,38,.3)":"var(--bdr)"}`}} onClick={()=>togK(si,li)}>{line.k==="chord"?"Accord":"Paroles"}</button>
                <input className="inp" style={{flex:1,fontFamily:line.k==="chord"?"monospace":"inherit",color:line.k==="chord"?"#CC1F00":"inherit",fontSize:12}} placeholder={line.k==="chord"?"Do  Ré  Mi…":"Paroles de la chanson…"} value={line.t} onChange={e=>updLine(si,li,e.target.value)}/>
                <button className="btn btn-d btn-xs btn-ic" onClick={()=>remLine(si,li)}>✕</button>
              </div>
            ))}
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <button className="btn btn-g btn-xs" onClick={()=>addLine(si,"chord")}>+ Accord</button>
              <button className="btn btn-g btn-xs" onClick={()=>addLine(si,"lyric")}>+ Paroles</button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-g btn-sm" style={{width:"100%",marginTop:8}} onClick={addSec}>+ Ajouter une section</button>
      <div className="flex-end">
        <button className="btn btn-g" onClick={onClose}>Annuler</button>
        <button className="btn btn-p" disabled={!title} onClick={()=>onSave({id:song?.id,title,key,tempo:tempo?Number(tempo):undefined,categorie,author,tags:tags.split(",").map(t=>t.trim()).filter(Boolean),sections})}>
          {song?"Sauvegarder →":"Ajouter →"}
        </button>
      </div>
    </div>
  );
}
