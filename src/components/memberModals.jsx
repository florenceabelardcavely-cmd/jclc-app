import React, { useState, useRef, useEffect } from "react";
import { CHURCHES, ROLES } from "../config";

// ══════════════════════════════════════════════════
//  MODALS
// ══════════════════════════════════════════════════

export function MemberModal({churchId,member,onSave,onClose}){
  const ch=CHURCHES[churchId];
  const [name,setName]=useState(member?.name||"");
  const [roles,setRoles]=useState(member?.roles||[member?.role||ROLES[0]]);
  const [email,setEmail]=useState(member?.email||"");
  const [phone,setPhone]=useState(member?.phone||"");
  const [pin,setPin]=useState(member?.pin||"0000");
  const [churches,setChurches]=useState(member?.churches||(member?.church2?[member.church2]:[]));
  const valid=name&&pin.length===4&&/^\d{4}$/.test(pin)&&roles.length>0;

  function toggleRole(r){
    setRoles(prev=>prev.includes(r)?prev.filter(x=>x!==r):[...prev,r]);
  }
  function toggleChurch2(cid){
    setChurches(prev=>prev.includes(cid)?prev.filter(x=>x!==cid):[...prev,cid]);
  }

  return(
    <div className="modal">
      <div className="modal-t">{member?"Modifier le membre":"Ajouter un membre"}</div>
      <div className="modal-s">{ch.fullName}</div>
      <div className="g2">
        <div className="fld"><label>Nom *</label><input className="inp" placeholder="Prénom Nom" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="fld">
          <label>Autres assemblées <span style={{fontWeight:400,color:"var(--txt3)",fontSize:11}}>(plusieurs possibles)</span></label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
            {Object.values(CHURCHES).filter(c=>c.id!==churchId).map(c=>(
              <button key={c.id} type="button"
                className={"btn btn-sm "+(churches.includes(c.id)?"btn-p":"btn-g")}
                style={{fontSize:11,padding:"4px 10px"}}
                onClick={()=>toggleChurch2(c.id)}>{c.fullName}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="fld">
        <label>Rôles * <span style={{fontWeight:400,color:"var(--txt3)",fontSize:11}}>(plusieurs possibles)</span></label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
          {ROLES.map(r=>(
            <button key={r} type="button"
              className={"btn btn-sm "+(roles.includes(r)?"btn-p":"btn-g")}
              style={{fontSize:11,padding:"4px 10px"}}
              onClick={()=>toggleRole(r)}>{r}</button>
          ))}
        </div>
        {roles.length===0&&<div style={{fontSize:11,color:"#f87171",marginTop:4}}>Sélectionnez au moins un rôle</div>}
      </div>
      <div className="g2">
        <div className="fld"><label>Email</label><input className="inp" type="email" placeholder="email@exemple.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="fld"><label>Téléphone</label><input className="inp" placeholder="+33 6 …" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
      </div>
      <div className="fld">
        <label>Code PIN (4 chiffres) *</label>
        <input className="inp" maxLength={4} placeholder="0000" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}/>
        <div style={{fontSize:11,color:"var(--txt3)",marginTop:4}}>Ce code sera communiqué au membre pour se connecter</div>
      </div>
      {!member&&pin.length===4&&(
        <div className="ib grn" style={{marginBottom:14}}>📱 Une notification sera automatiquement créée pour informer le membre de ses identifiants de connexion.</div>
      )}
      <div className="flex-end">
        <button className="btn btn-g" onClick={onClose}>Annuler</button>
        <button className="btn btn-p" disabled={!valid} onClick={()=>onSave({...member,name,role:roles[0],roles,email,phone,pin,churches,church2:churches[0]||null})}>
          {member?"Sauvegarder →":"Ajouter le membre →"}
        </button>
      </div>
    </div>
  );
}

export function MemberNotifModal({notif,onClose}){
  return(
    <div className="modal">
      <div className="modal-t">🔔 Nouveau membre ajouté</div>
      <div className="modal-s">Informations de connexion à transmettre</div>
      <div style={{background:"var(--grn-bg)",border:"1px solid var(--grn)",borderRadius:"var(--r)",padding:20,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>👤 {notif.name}</div>
        <div style={{fontSize:13,color:"var(--txt2)",marginBottom:4}}>Église : {notif.church}</div>
        <div style={{fontSize:13,color:"var(--txt2)",marginBottom:12}}>Ajouté le : {notif.createdAt}</div>
        <div style={{background:"white",borderRadius:"var(--rsm)",padding:14,border:"1px solid var(--bdr)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--txt3)",textTransform:"uppercase",marginBottom:8}}>Identifiants de connexion</div>
          <div style={{fontSize:14,marginBottom:6}}>📱 Votre nom dans la liste : <strong>{notif.name}</strong></div>
          <div style={{fontSize:14}}>🔢 Votre code PIN : <strong style={{fontFamily:"monospace",fontSize:20,letterSpacing:6,color:"var(--ind)"}}>{notif.pin}</strong></div>
        </div>
      </div>
      <div className="ib amb">⚠️ Veuillez communiquer ces informations à {notif.name} pour qu'il/elle puisse se connecter à l'application.</div>
      <div className="flex-end">
        <button className="btn btn-p" onClick={onClose}>✓ Compris — Informer le membre</button>
      </div>
    </div>
  );
}
