import React, { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════
//  BIBLIOTHÈQUE TAB
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
//  CHANGE PIN MODAL
// ══════════════════════════════════════════════════
export function ChangePinModal({user,onSave,onClose}){
  const [step,setStep]=useState("current");
  const [currentPin,setCurrentPin]=useState(["","","",""]);
  const [newPin,setNewPin]=useState(["","","",""]);
  const [confirmPin,setConfirmPin]=useState(["","","",""]);
  const [err,setErr]=useState("");
  const curRefs=[useRef(),useRef(),useRef(),useRef()];
  const newRefs=[useRef(),useRef(),useRef(),useRef()];
  const cfRefs=[useRef(),useRef(),useRef(),useRef()];

  function handleInput(refs,setter,arr,i,val){
    if(!/^\d?$/.test(val))return;
    const np=[...arr];np[i]=val;setter(np);setErr("");
    if(val&&i<3)refs[i+1].current?.focus();
    if(!val&&i>0)refs[i-1].current?.focus();
  }

  function validateCurrent(){
    const pin=currentPin.join("");
    if(pin.length<4){setErr("Saisissez votre PIN actuel.");return;}
    const realPin=window.__jclcMemberPin||"0000";
    if(pin!==realPin){setErr("PIN actuel incorrect.");setCurrentPin(["","","",""]);setTimeout(()=>curRefs[0].current?.focus(),50);return;}
    setErr("");setStep("new");setTimeout(()=>newRefs[0].current?.focus(),80);
  }

  function validateNew(){
    const pin=newPin.join("");
    if(pin.length<4){setErr("Saisissez un nouveau PIN.");return;}
    if(pin===(window.__jclcMemberPin||"0000")){setErr("Le nouveau PIN doit être différent de l'actuel.");setNewPin(["","","",""]);setTimeout(()=>newRefs[0].current?.focus(),50);return;}
    setErr("");setStep("confirm");setTimeout(()=>cfRefs[0].current?.focus(),80);
  }

  function validateConfirm(){
    const pin=confirmPin.join("");
    if(pin!==newPin.join("")){setErr("Les deux PIN ne correspondent pas.");setConfirmPin(["","","",""]);setTimeout(()=>cfRefs[0].current?.focus(),50);return;}
    onSave(pin);
  }

  const steps=[{key:"current",label:"Vérification",refs:curRefs,arr:currentPin,setter:setCurrentPin,hint:"Entrez votre PIN actuel",btn:"Vérifier →",fn:validateCurrent},{key:"new",label:"Nouveau PIN",refs:newRefs,arr:newPin,setter:setNewPin,hint:"Choisissez un nouveau PIN",btn:"Continuer →",fn:validateNew},{key:"confirm",label:"Confirmation",refs:cfRefs,arr:confirmPin,setter:setConfirmPin,hint:"Confirmez le nouveau PIN",btn:"✓ Enregistrer",fn:validateConfirm}];
  const si=steps.findIndex(s=>s.key===step);
  const cur=steps[si];

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:360}}>
        <div className="modal-header">
          <div className="modal-title">🔐 Modifier mon code PIN</div>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="modal-body">
          <div style={{display:"flex",gap:6,marginBottom:18,justifyContent:"center"}}>
            {steps.map((s,i)=>(
              <div key={s.key} style={{height:4,borderRadius:2,flex:1,background:si>=i?"#6366f1":"rgba(255,255,255,.15)",transition:"background .3s"}}/>
            ))}
          </div>
          <div style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,.45)",marginBottom:18}}>
            {cur.hint}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14}}>
            {cur.arr.map((d,i)=>(
              <input key={i} ref={cur.refs[i]} type="password" inputMode="numeric" maxLength={1} value={d}
                autoFocus={i===0}
                onChange={e=>handleInput(cur.refs,cur.setter,cur.arr,i,e.target.value)}
                onKeyDown={e=>{if(e.key==="Backspace"&&!d&&i>0)cur.refs[i-1].current?.focus();if(e.key==="Enter"&&i===3&&cur.arr.every(x=>x!==""))cur.fn();}}
                style={{width:52,height:56,textAlign:"center",fontSize:22,fontWeight:800,
                  background:d?"rgba(79,70,229,.25)":"rgba(255,255,255,.07)",
                  border:"2px solid "+(d?"rgba(79,70,229,.6)":"rgba(255,255,255,.15)"),
                  borderRadius:12,color:"#fff",outline:"none",caretColor:"transparent"}}/>
            ))}
          </div>
          {err&&<div style={{color:"#f87171",fontSize:12,textAlign:"center",marginBottom:10}}>{err}</div>}
          <button className="btn btn-p" style={{width:"100%",marginBottom:8}} onClick={cur.fn}>{cur.btn}</button>
          {si>0&&(
            <button className="btn btn-g" style={{width:"100%"}} onClick={()=>{setErr("");setStep(steps[si-1].key);}}>
              &#8592; Retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
