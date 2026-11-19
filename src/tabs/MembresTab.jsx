import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";

// ══════════════════════════════════════════════════
//  MEMBRES TAB
// ══════════════════════════════════════════════════
export function MembresTab({st,M,deleteMember}){
  return(
    <div>
      <div className="ph"><div><div className="pt">Membres du groupe</div><div className="ps">Gérez les membres par église · Configurez les permissions dans l'onglet 🔑</div></div></div>
      <div className="g2">
        {Object.values(CHURCHES).map(c=>(
          <div key={c.id} style={{background:c.bg,border:`1.5px solid ${c.color}`,borderRadius:16,padding:18}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <div style={{fontWeight:700,color:c.color,fontSize:15}}>{c.fullName}</div>
                <div style={{fontSize:11,color:c.color,opacity:.6,marginTop:1}}>Services : {c.dayLabel}</div>
              </div>
              <button className="btn btn-sm" style={{background:c.color,color:"#fff"}} onClick={()=>M.addMember(c.id)}>+ Ajouter</button>
            </div>
            {st.members[c.id].length===0
              ?<div className="empty" style={{padding:"16px 0"}}><div style={{fontSize:30}}>👥</div><div style={{fontSize:12,marginTop:5}}>Aucun membre pour l'instant</div></div>
              :<div className="scroll-list">
                {st.members[c.id].map(m=>(
                  <div className="mrow" key={m.id}>
                    <div className="mav" style={{background:c.bg,color:c.color}}>{m.name.charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                        {m.name}
                        {m.canEditLib&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"#EDE9FE",color:"#5B21B6",fontWeight:700}}>Bib.</span>}
                        {m.role==="Directeur Musical (DM)"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:c.bg,color:c.color,border:`1px solid ${c.color}`,fontWeight:700}}>DM</span>}
                      </div>
                      <div style={{fontSize:11,color:"var(--txt2)"}}>{m.role}</div>
                      <div style={{fontSize:11,color:"var(--txt3)"}}>{m.email&&`✉ ${m.email}`}{m.email&&m.phone&&" · "}{m.phone&&`📱 ${m.phone}`}</div>
                      {m.servicesCount>0&&<div style={{fontSize:10,color:"var(--grn)",fontWeight:700}}>🎤 {m.servicesCount} service(s)</div>}
                    </div>
                    <button className="btn btn-g btn-xs btn-ic" onClick={()=>M.editMember(c.id,m)} title="Modifier">✏️</button>
                    <button className="btn btn-d btn-xs btn-ic" onClick={()=>deleteMember(c.id,m.id)} title="Supprimer">🗑</button>
                  </div>
                ))}
              </div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  PERMISSIONS TAB
// ══════════════════════════════════════════════════
export function PermissionsTab({st,toggleLib,toggleProg}){
  return(
    <div>
      <div className="ph"><div><div className="pt">Permissions</div><div className="ps">Bibliothèque et Programmes — gérez les accès membres</div></div></div>
      <div className="ib ind" style={{marginBottom:10}}>🔑 <strong>Bibliothèque</strong> : ajouter/modifier/supprimer des chants. <strong>Programmes</strong> : créer et gérer les programmes de culte.</div>
      {Object.values(CHURCHES).map(c=>(
        <div key={c.id} className="card">
          <div className="card-t" style={{color:c.color}}>{c.fullName}</div>
          <div className="card-s">{st.members[c.id].length} membre(s)</div>
          {st.members[c.id].length===0?<div className="empty" style={{padding:"16px 0"}}><div style={{fontSize:28}}>👥</div></div>
          :st.members[c.id].map(m=>(
            <div className="perm-row" key={m.id} style={{flexWrap:"wrap",gap:6}}>
              <div className="mav" style={{background:c.bg,color:c.color,width:34,height:34,fontSize:13,flexShrink:0}}>{m.name.charAt(0)}</div>
              <div style={{flex:1,minWidth:100}}>
                <div style={{fontWeight:600,fontSize:13}}>{m.name}</div>
                <div style={{fontSize:11,color:"var(--txt2)"}}>{(m.roles||[m.role]).join(", ")}</div>
                <div style={{fontSize:11,color:"var(--txt3)",marginTop:2}}>PIN : <span style={{fontFamily:"monospace",fontWeight:700,letterSpacing:2,color:"var(--ind)"}}>{m.pin||"0000"}</span></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:10,color:"var(--txt3)"}}>Bibliothèque</span>
                  <button className={`toggle ${m.canEditLib?"on":"off"}`} onClick={()=>toggleLib(c.id,m.id)}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:10,color:"var(--txt3)"}}>Programmes</span>
                  <button className={`toggle ${m.canEditProg?"on":"off"}`} onClick={()=>toggleProg(c.id,m.id)}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
