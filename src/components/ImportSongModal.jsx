import React, { useState, useRef, useEffect } from "react";
import { uid } from "../lib/helpers";
import { parseChordPro } from "../lib/music";

// ── IMPORT SONG MODAL (avec PDF) ──
export function ImportSongModal({onSave,onSaveMany,onClose}){
  const [mode,setMode]=useState("chordpro");
  const [text,setText]=useState("");
  const [url,setUrl]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadingMsg,setLoadingMsg]=useState("");
  const [err,setErr]=useState("");
  const [preview,setPreview]=useState(null);
  const fileRef=useRef();
  const choRef=useRef();

  async function importChoFile(file){
    setLoading(true);setErr("");
    try{
      const txt=await file.text();
      const parts=txt.split(/\{new_song\}|\{ns\}/i).filter(p=>p.trim());
      if(parts.length>1){
        const songs=parts.map(p=>({...parseChordPro(p),tags:[],id:uid()})).filter(s=>s.title);
        setPreview({songs,selected:songs.map(()=>true)});
      }else{
        const parsed=parseChordPro(txt);
        if(!parsed.title)parsed.title=file.name.replace(/\.(cho|chordpro|txt)$/i,"");
        onSave({...parsed,tags:[],id:uid()});
      }
    }catch(e){setErr("Erreur : "+e.message);}
    setLoading(false);
  }

  function importFromText(){
    if(!text.trim())return;
    setErr("");
    try{
      const isCP=text.includes("{title:")||text.includes("{t:")||/\[[A-Za-zÀ-ÿ#b]+\]/.test(text);
      let parsed;
      if(isCP){
        parsed=parseChordPro(text);
        if(!parsed.title){const fl=text.split("\n").find(l=>l.trim()&&!l.startsWith("{"));parsed.title=fl||"Chant importé";}
      }else{
        const lines=text.split("\n");
        const CR=/^([A-G][b#]?|Do#?|Réb?#?|Mib?|Fa#?|Sol[b#]?|Lab?#?|Sib?)(m(?:aj)?7?|7|sus[24]?|dim|aug)?\s/;
        const SR=/^(couplet|refrain|pont|intro|outro|verse|chorus|bridge|interlude|fin)\s*\d*\s*:?\s*$/i;
        let title="",key="",sections=[],cur=null;
        for(const raw of lines){
          const l=raw.trim();if(!l)continue;
          if(!title){title=l;continue;}
          if(SR.test(l)){cur={label:l.charAt(0).toUpperCase()+l.slice(1).replace(/:$/,"").trim(),lines:[]};sections.push(cur);continue;}
          if(!cur){cur={label:"Couplet 1",lines:[]};sections.push(cur);}
          const ic=CR.test(l+"  ");
          if(ic&&!key)key=l.split(/\s+/)[0];
          cur.lines.push({k:ic?"chord":"lyric",t:l});
        }
        if(!sections.length)sections.push({label:"Couplet 1",lines:text.split("\n").slice(1).map(l=>({k:"lyric",t:l}))});
        parsed={title,key:key||"Do",categorie:"",sections};
      }
      onSave({...parsed,tags:[],id:uid()});
    }catch(e){setErr("Erreur : "+e.message);}
  }

  const PROMPT=`Ce PDF contient des chants chrétiens. Renvoie UNIQUEMENT un tableau JSON (sans markdown) : [{"title":"...","key":"Do","categorie":"","sections":[{"label":"Couplet 1","lines":[{"k":"chord","t":"Do  Ré"},{"k":"lyric","t":"paroles"}]}]}]. Inclus TOUS les chants.`;

  async function importPDF(file){
    setLoading(true);setErr("");setPreview(null);
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej(new Error("Read failed"));r.readAsDataURL(file);});
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},{type:"text",text:PROMPT}]}]})});
      const data=await res.json();
      if(!res.ok||!data.content?.[0])throw new Error(data.error?.message||"Erreur API");
      const parsed=JSON.parse(data.content[0].text.replace(/```json|```/g,"").trim());
      const songs=Array.isArray(parsed)?parsed:[parsed];
      setPreview({songs,selected:songs.map(()=>true)});
    }catch(e){setErr("Erreur : "+e.message);}
    setLoading(false);
  }

  const PROMPT_URL=`Cette page web contient un chant chrétien. Extrais le chant et renvoie UNIQUEMENT un objet JSON (sans markdown) : {"title":"...","key":"Do","author":"","categorie":"","sections":[{"label":"Couplet 1","lines":[{"k":"chord","t":"Do  Sol"},{"k":"lyric","t":"paroles"}]}]}. Inclus TOUTES les sections.`;

  async function importFromUrl(){
    if(!url.trim())return;
    setLoading(true);setErr("");setPreview(null);
    setLoadingMsg("Lecture de la page...");
    try{
      setLoadingMsg("Claude lit la page... (10-20s)");
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,messages:[{role:"user",content:[{type:"text",text:`Visite cette URL et extrais le chant chrétien : ${url.trim()}\n\n${PROMPT_URL}`}]}]})
      });
      const data=await res.json();
      if(!res.ok||!data.content?.[0])throw new Error(data.error?.message||"Erreur API");
      const txt=data.content[0].text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(txt);
      const songs=Array.isArray(parsed)?parsed:[parsed];
      setPreview({songs,selected:songs.map(()=>true)});
    }catch(e){setErr("Erreur : "+e.message+". Essayez de copier-coller le texte manuellement.");}
    setLoading(false);setLoadingMsg("");
  }

  function toggleSel(i){setPreview(p=>({...p,selected:p.selected.map((v,j)=>j===i?!v:v)}));}
  function confirmImport(){
    const toImport=preview.songs.filter((_,i)=>preview.selected[i]).map(s=>({...s,tags:[],id:uid()}));
    if(!toImport.length){setErr("Sélectionnez au moins un chant.");return;}
    onSaveMany(toImport);
  }

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:620,width:"95vw"}}>
        <div className="modal-header"><div className="modal-title">📥 Importer des chants</div><button className="modal-close" onClick={onClose}>&#x2715;</button></div>
        <div className="modal-body">
          {!preview&&<div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {[{v:"chordpro",l:"🎸 ChordPro (.cho)"},{v:"text",l:"📝 Texte"},{v:"url",l:"🔗 Lien web"},{v:"pdf",l:"📄 PDF"}].map(o=>(
              <button key={o.v} className={"btn btn-sm "+(mode===o.v?"btn-p":"btn-g")} onClick={()=>{setMode(o.v);setErr("");setText("");setUrl("");}}>{o.l}</button>
            ))}
          </div>}

          {mode==="chordpro"&&!preview&&(
            <div>
              <div style={{background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13}}>
                💡 Importe des fichiers <strong>.cho</strong> ou <strong>.chordpro</strong>. Supporte aussi les accords entre crochets <code>[Am]Amazing [F]grace</code>.
              </div>
              <div style={{border:"2px dashed var(--bdr)",borderRadius:12,padding:32,textAlign:"center",cursor:"pointer",background:"var(--sur2)"}} onClick={()=>choRef.current?.click()}>
                <div style={{fontSize:40,marginBottom:8}}>🎸</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{loading?"Chargement…":"Sélectionner un fichier ChordPro"}</div>
                <div style={{fontSize:12,color:"var(--txt3)"}}>Fichiers .cho, .chordpro, .txt</div>
                <input ref={choRef} type="file" accept=".cho,.chordpro,.txt" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){importChoFile(f);choRef.current.value="";}}}/>
              </div>
              <div style={{textAlign:"center",margin:"14px 0",color:"var(--txt3)",fontSize:12}}>— ou collez du texte ChordPro —</div>
              <textarea className="inp" style={{width:"100%",height:140,fontFamily:"monospace",fontSize:12,resize:"vertical"}}
                placeholder={"{title: Amazing Grace}\n{key: G}\n\n{start_of_verse: Couplet 1}\n[G]Amazing [C]grace how [G]sweet\n{end_of_verse}"}
                value={text} onChange={e=>setText(e.target.value)}/>
              {text.trim()&&<button className="btn btn-p" style={{width:"100%",marginTop:8}} onClick={importFromText}>✓ Importer</button>}
            </div>
          )}

          {mode==="text"&&!preview&&(
            <div>
              <div style={{background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13}}>
                💡 Première ligne = titre. Puis sections et accords/paroles.
              </div>
              <textarea className="inp" style={{width:"100%",height:200,fontFamily:"monospace",fontSize:12,resize:"vertical"}}
                placeholder={"Je chanterai de tout cœur\n\nCouplet 1\nDo        Sol\nJe chanterai de tout cœur\n…"}
                value={text} onChange={e=>setText(e.target.value)}/>
              {err&&<div style={{color:"var(--red)",fontSize:12,marginTop:6}}>⚠️ {err}</div>}
              <button className="btn btn-p" style={{width:"100%",marginTop:8}} disabled={!text.trim()} onClick={importFromText}>✓ Importer</button>
            </div>
          )}

          {mode==="url"&&!preview&&(
            <div>
              <div style={{background:"#EEF2FF",border:"1px solid #C7D2FE",borderRadius:10,padding:"14px 16px",marginBottom:14,fontSize:13}}>
                <div style={{fontWeight:700,marginBottom:8}}>📋 Comment importer depuis un site</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <div>1️⃣ Ouvre le site du chant (accords.app, paroles-et-accords.com...)</div>
                  <div>2️⃣ Sélectionne tout le texte de la page (<strong>Cmd+A</strong> puis <strong>Cmd+C</strong>)</div>
                  <div>3️⃣ Colle dans l'onglet <strong>📝 Texte</strong> — Claude détecte les accords automatiquement</div>
                </div>
              </div>
              <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"12px 16px",fontSize:13}}>
                <div style={{fontWeight:700,marginBottom:4}}>💡 Astuce</div>
                <div>Sur <strong>accords.app</strong> : clique sur "Afficher les accords" avant de copier pour avoir les accords et les paroles ensemble.</div>
              </div>
              <button className="btn btn-p" style={{width:"100%",marginTop:14}} onClick={()=>setMode("text")}>→ Aller dans l'onglet Texte</button>
            </div>
          )}

          {mode==="pdf"&&!preview&&(
            <div>
              <div style={{background:"var(--sur2)",border:"1px solid var(--bdr)",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13}}>
                💡 Importe un PDF de culte — tous les chants détectés automatiquement.
              </div>
              <div style={{border:"2px dashed var(--bdr)",borderRadius:12,padding:32,textAlign:"center",cursor:loading?"default":"pointer",background:"var(--sur2)"}} onClick={()=>!loading&&fileRef.current?.click()}>
                <div style={{fontSize:40,marginBottom:8}}>📄</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{loading?"Analyse en cours…":"Sélectionner un fichier PDF"}</div>
                {loading&&<div style={{marginTop:12}}><div style={{width:40,height:40,border:"4px solid rgba(99,102,241,.3)",borderTop:"4px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto"}}/></div>}
                <input ref={fileRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){importPDF(f);fileRef.current.value="";}}}/>
              </div>
              {err&&<div style={{color:"var(--red)",fontSize:12,marginTop:6}}>⚠️ {err}</div>}
            </div>
          )}

          {preview&&(
            <div>
              <div style={{background:"#DCFCE7",border:"1px solid #86EFAC",borderRadius:10,padding:"10px 16px",marginBottom:12,fontSize:13,color:"#166534"}}>
                ✅ <strong>{preview.songs.length} chant(s) détecté(s)</strong>
              </div>
              <div style={{maxHeight:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                {preview.songs.map((s,i)=>(
                  <div key={i} onClick={()=>toggleSel(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,cursor:"pointer",
                    background:preview.selected[i]?"#EEF2FF":"var(--sur2)",border:"1.5px solid "+(preview.selected[i]?"#6366F1":"var(--bdr)"),transition:"all .15s"}}>
                    <div style={{width:20,height:20,borderRadius:4,flexShrink:0,background:preview.selected[i]?"#6366f1":"var(--sur2)",border:"2px solid "+(preview.selected[i]?"#6366f1":"var(--bdr)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff"}}>{preview.selected[i]?"✓":""}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{s.title||"Sans titre"}</div>
                      <div style={{display:"flex",gap:6,marginTop:2}}>
                        <span style={{fontSize:10,background:"var(--sur2)",borderRadius:4,padding:"1px 6px",border:"1px solid var(--bdr)"}}>Ton. {s.key||"?"}</span>
                        {s.categorie&&<span style={{fontSize:10,background:"#EDE9FE",color:"#5B21B6",borderRadius:4,padding:"1px 6px"}}>{s.categorie}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                <button className="btn btn-g btn-sm" onClick={()=>setPreview(p=>({...p,selected:p.songs.map(()=>true)}))}>Tout ✓</button>
                <button className="btn btn-g btn-sm" onClick={()=>setPreview(p=>({...p,selected:p.songs.map(()=>false)}))}>Tout ✗</button>
                <span style={{marginLeft:"auto",fontSize:12,color:"var(--txt3)"}}>{preview.selected.filter(Boolean).length}/{preview.songs.length}</span>
              </div>
              {err&&<div style={{color:"var(--red)",fontSize:12,marginBottom:8}}>⚠️ {err}</div>}
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-g" style={{flex:1}} onClick={()=>setPreview(null)}>← Retour</button>
                <button className="btn btn-p" style={{flex:2}} onClick={confirmImport}>✓ Ajouter {preview.selected.filter(Boolean).length} chant(s)</button>
              </div>
            </div>
          )}

          {!preview&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button className="btn btn-g" onClick={onClose}>Annuler</button></div>}
        </div>
      </div>
    </div>
  );
}
