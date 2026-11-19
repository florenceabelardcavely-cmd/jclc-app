import React, { useState, useRef, useEffect } from "react";
import { CHURCHES } from "../config";
import { fmt, getTypeLabel } from "../lib/helpers";

export function AssignModal({cid,d,date,type,members,isAvail,assigned,onSave,onClose}){
  const ch=CHURCHES[cid];
  const [sel,setSel]=useState([...assigned]);
  const toggle=id=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const avail=members.filter(m=>isAvail(m.id,d));
  const unavail=members.filter(m=>!isAvail(m.id,d));
  return(
    <div className="modal">
      <div className="modal-t">Assigner des membres</div>
      <div className="modal-s">{fmt(date)} · {getTypeLabel(type)} · {ch.fullName}</div>
      {avail.length>0&&<>
        <div style={{fontSize:11,fontWeight:700,color:"var(--grn)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>✓ Disponibles ({avail.length})</div>
        {avail.map(m=>(
          <div key={m.id} className="assign-row" onClick={()=>toggle(m.id)}>
            <div className={`assign-chk${sel.includes(m.id)?" on":""}`}>{sel.includes(m.id)&&"✓"}</div>
            <div className="mav" style={{background:ch.bg,color:ch.color,width:32,height:32,fontSize:12}}>{m.name.charAt(0)}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{m.name}</div><div style={{fontSize:11,color:"var(--txt2)"}}>{m.role}</div></div>
          </div>
        ))}
      </>}
      {unavail.length>0&&<>
        <div style={{fontSize:11,fontWeight:700,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".4px",margin:"12px 0 8px"}}>Indisponibles / Non renseignés</div>
        {unavail.map(m=>(
          <div key={m.id} className="assign-row" style={{opacity:.6}} onClick={()=>toggle(m.id)}>
            <div className={`assign-chk${sel.includes(m.id)?" on":""}`}>{sel.includes(m.id)&&"✓"}</div>
            <div className="mav" style={{background:"var(--sur2)",color:"var(--txt3)",width:32,height:32,fontSize:12}}>{m.name.charAt(0)}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:"var(--txt2)"}}>{m.name}</div><div style={{fontSize:11,color:"var(--txt3)"}}>{m.role}</div></div>
          </div>
        ))}
      </>}
      <div className="flex-end"><button className="btn btn-g" onClick={onClose}>Annuler</button><button className="btn btn-p" onClick={()=>onSave(sel)}>Confirmer ({sel.length}) →</button></div>
    </div>
  );
}

export function SelectServiceModal({cid,d,date,members,assigned,selected,leadId,onSave,onClose}){
  const ch=CHURCHES[cid];
  const assignedMembers=members.filter(m=>assigned.includes(m.id));
  const [sel,setSel]=useState([...selected]);
  const [lead,setLead]=useState(leadId||null);
  const toggle=id=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  return(
    <div className="modal">
      <div className="modal-t">🎤 Membres de service</div>
      <div className="modal-s">{fmt(date)} — Sélectionnez qui sera de service et le Lead</div>
      <div className="ib ind">Cochez les membres présents et désignez le Lead (🎤).</div>
      {assignedMembers.map(m=>(
        <div key={m.id} className="assign-row" onClick={()=>toggle(m.id)} style={{background:lead===m.id?"#FEF9C3":sel.includes(m.id)?"#F0FDF4":"var(--sur2)",border:lead===m.id?"1.5px solid #EAB308":sel.includes(m.id)?"1.5px solid #16A34A":"1.5px solid var(--bdr)"}}>
          <div className={`assign-chk${sel.includes(m.id)?" on":""}`}>{sel.includes(m.id)&&"✓"}</div>
          <div className="mav" style={{background:ch.bg,color:ch.color,width:32,height:32,fontSize:12}}>{m.name.charAt(0)}</div>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{m.name}{lead===m.id&&<span style={{marginLeft:6,fontSize:10,background:"#EAB308",color:"#fff",borderRadius:10,padding:"1px 6px"}}>🎤 Lead</span>}</div><div style={{fontSize:11,color:"var(--txt2)"}}>{m.role}</div></div>
          <button className={`btn btn-xs ${lead===m.id?"btn-p":"btn-g"}`} onClick={e=>{e.stopPropagation();setLead(l=>l===m.id?null:m.id);if(!sel.includes(m.id))setSel(s=>[...s,m.id]);}}>🎤</button>
        </div>
      ))}
      <div className="flex-end"><button className="btn btn-g" onClick={onClose}>Annuler</button><button className="btn btn-grn" onClick={()=>onSave(sel,lead)}>Confirmer ({sel.length}) →</button></div>
    </div>
  );
}
