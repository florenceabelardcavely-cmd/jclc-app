import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";
import { isRespTeamMember, memberRoles, otherTeamLabels, teamPosts } from "../lib/helpers";

// ── Fiche membre technique ──
export function TechMemberModal({T,churchId,member,canSetResp,onSave,onClose}){
  const ch=CHURCHES[churchId];
  const [name,setName]=useState(member?.name||"");
  const [posts,setPosts]=useState(member?teamPosts(member,T):[]);
  const [resp,setResp]=useState(member?isRespTeamMember(member,T):false);
  const [phone,setPhone]=useState(member?.phone||"");
  const [pin,setPin]=useState(member?.pin||"0000");
  const [churches,setChurches]=useState(member?.churches||(member?.church2?[member.church2]:[]));
  const valid=name.trim()&&/^\d{4}$/.test(pin)&&posts.length>0;
  const toggle=(arr,set,v)=>set(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]);
  function save(){
    const louangeRoles=member?memberRoles(member).filter(r=>!T.roles.includes(r)&&r!==T.resp):[]; // rôles des autres équipes, conservés
    const roles=[...louangeRoles,...posts,...(resp?[T.resp]:[])];
    const role=louangeRoles.length?(louangeRoles.includes(member.role)?member.role:louangeRoles[0]):posts[0];
    onSave({...(member||{}),name:name.trim(),roles,role,phone,pin,church:member?.church||churchId,churches,church2:churches[0]||null});
  }
  return(
    <div className="modal">
      <div className="modal-t">{member?`Modifier — ${T.teamName}`:`Ajouter — ${T.teamName}`}</div>
      <div className="modal-s">{ch.fullName} · {T.service}</div>
      <div className="g2">
        <div className="fld"><label>Nom *</label><input className="inp" placeholder="Prénom Nom" value={name} onChange={e=>setName(e.target.value)}/></div>
        {T.churches.length>1&&<div className="fld">
          <label>Sert aussi à</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
            {T.churches.filter(c=>c!==(member?.church||churchId)).map(c=>(
              <button key={c} type="button" className={"btn btn-sm "+(churches.includes(c)?"btn-p":"btn-g")} style={{fontSize:11,padding:"4px 10px"}} onClick={()=>toggle(churches,setChurches,c)}>{CHURCHES[c].fullName}</button>
            ))}
          </div>
        </div>}
      </div>
      <div className="fld">
        <label>Postes * <span style={{fontWeight:400,color:"var(--txt3)",fontSize:11}}>(plusieurs possibles)</span></label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
          {T.roles.map(r=>(
            <button key={r} type="button" className={"btn btn-sm "+(posts.includes(r)?"btn-p":"btn-g")} style={{fontSize:11,padding:"4px 10px"}} onClick={()=>toggle(posts,setPosts,r)}>{r}</button>
          ))}
        </div>
        {posts.length===0&&<div style={{fontSize:11,color:"#f87171",marginTop:4}}>Sélectionnez au moins un poste</div>}
      </div>
      {canSetResp&&(
        <div className="arow" style={{marginBottom:14}} onClick={()=>setResp(v=>!v)}>
          <div className={`chk${resp?" on":""}`}>✓</div>
          <div><div style={{fontWeight:600,fontSize:13}}>{T.resp}</div><div style={{fontSize:11,color:"var(--txt2)"}}>{T.respDesc}</div></div>
        </div>
      )}
      <div className="g2">
        <div className="fld"><label>Téléphone</label><input className="inp" placeholder="+33 6 …" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
        <div className="fld"><label>Code PIN (4 chiffres) *</label><input className="inp" maxLength={4} placeholder="0000" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}/></div>
      </div>
      <div className="ib ind">{T.icon} Ce membre se connecte via le bouton <strong>« {T.login.label} »</strong> avec son prénom et ce code PIN.</div>
      <div className="flex-end">
        <button className="btn btn-g" onClick={onClose}>Annuler</button>
        <button className="btn btn-p" disabled={!valid} onClick={save}>{member?"Sauvegarder →":"Ajouter →"}</button>
      </div>
    </div>
  );
}

// ── Équipe technique (liste des membres) ──
export function TechMembresTab({T,st,canSetResp,A}){
  const [modal,setModal]=useState(null);
  const [created,setCreated]=useState(null); // identifiants à transmettre au nouveau membre
  return(
    <div>
      {created&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setCreated(null)}>
          <div className="modal">
            <div className="modal-t">✅ {created.name} a été ajouté(e)</div>
            <div className="modal-s">Identifiants de connexion à lui transmettre</div>
            <div style={{background:"var(--sur2)",borderRadius:"var(--r)",padding:16,marginBottom:14}}>
              <div style={{fontSize:14,marginBottom:6}}>{T.icon} Bouton : <strong>« {T.login.label} »</strong></div>
              <div style={{fontSize:14,marginBottom:6}}>📱 Prénom à taper : <strong>{created.name}</strong></div>
              <div style={{fontSize:14}}>🔢 Code PIN : <strong style={{fontFamily:"monospace",fontSize:20,letterSpacing:6,color:"var(--ind)"}}>{created.pin}</strong></div>
            </div>
            <div className="flex-end">
              <button className="btn btn-g" onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(`Bienvenue dans l'équipe ${T.label.toLowerCase()} JCLC ${T.icon}\nConnecte-toi sur l'appli avec le bouton « ${T.login.label} ».\nPrénom : ${created.name}\nCode PIN : ${created.pin}`)}`,"_blank")}>📲 Envoyer par WhatsApp</button>
              <button className="btn btn-p" onClick={()=>setCreated(null)}>Compris ✓</button>
            </div>
          </div>
        </div>
      )}
      {modal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <TechMemberModal T={T} churchId={modal.cid} member={modal.m} canSetResp={canSetResp}
            onSave={m=>{const isNew=!modal.m;A.saveMember(modal.cid,m,isNew);setModal(null);if(isNew)setCreated(m);}} onClose={()=>setModal(null)}/>
        </div>
      )}
      <div className="ph"><div><div className="pt">{T.teamName}</div><div className="ps">Créez et modifiez les fiches de votre équipe avec « + Ajouter »</div></div></div>
      <div className="g2">
        {T.churches.map(cid=>{const c=CHURCHES[cid];const list=st[T.id+"Members"]?.[cid]||[];return(
          <div key={cid} style={{background:c.bg,border:`1.5px solid ${c.color}`,borderRadius:16,padding:18}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontWeight:700,color:c.color,fontSize:15}}>{c.fullName}</div>
              <button className="btn btn-sm" style={{background:c.color,color:"#fff"}} onClick={()=>setModal({cid,m:null})}>+ Ajouter</button>
            </div>
            {list.length===0
              ?<div className="empty" style={{padding:"16px 0"}}><div style={{fontSize:30}}>{T.icon}</div><div style={{fontSize:12,marginTop:5}}>Aucun membre</div></div>
              :<div className="scroll-list">{list.map(m=>(
                <div className="mrow" key={m.id}>
                  <div className="mav" style={{background:T.chipBg,color:T.chipFg}}>{m.name.charAt(0)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      {m.name}
                      {isRespTeamMember(m,T)&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:T.chipFg,color:"#fff",fontWeight:700}}>Responsable</span>}
                      {otherTeamLabels(m,T).map(l=><span key={l} style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"#FEF3C7",color:"#92400E",fontWeight:700}}>{l} aussi</span>)}
                    </div>
                    <div style={{fontSize:11,color:"var(--txt2)"}}>{teamPosts(m,T).join(" · ")}</div>
                    {m.phone&&<div style={{fontSize:11,color:"var(--txt3)"}}>📱 {m.phone}</div>}
                  </div>
                  <button className="btn btn-g btn-xs btn-ic" title="Modifier" onClick={()=>setModal({cid:m.church&&T.churches.includes(m.church)?m.church:cid,m})}>✏️</button>
                  <button className="btn btn-d btn-xs btn-ic" title="Supprimer" onClick={()=>A.deleteMember(m)}>🗑</button>
                </div>
              ))}</div>}
          </div>);})}
      </div>
    </div>
  );
}
