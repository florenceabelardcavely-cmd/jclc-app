import React, { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════
//  BOTTOM NAV
// ══════════════════════════════════════════════════
export function BottomNav({tabs,tab,setTab}){
  return(<nav className="bottom-nav" style={{overflowX:"auto",overflowY:"hidden"}}>{tabs.map(t=>(<button key={t.id} className={`bnav-btn${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)} style={{flexShrink:0,minWidth:56}}><span className="bni">{t.i}</span><span className="bnl">{t.l}</span></button>))}</nav>);
}

// ══════════════════════════════════════════════════
//  SWIPE HOOK
// ══════════════════════════════════════════════════
export function useSwipe(onSwipeLeft, onSwipeRight){
  const touchStart=useRef(null);
  const touchEnd=useRef(null);
  const touchStartY=useRef(null);
  const touchEndY=useRef(null);
  const touchStartTime=useRef(null);
  const minSwipe=140;
  const maxDuration=700; // ms — un geste plus lent est un scroll, pas un swipe volontaire
  const onTouchStart=(e)=>{touchStart.current=e.targetTouches[0].clientX;touchStartY.current=e.targetTouches[0].clientY;touchStartTime.current=Date.now();touchEnd.current=null;touchEndY.current=null;};
  const onTouchMove=(e)=>{touchEnd.current=e.targetTouches[0].clientX;touchEndY.current=e.targetTouches[0].clientY;};
  const onTouchEnd=()=>{
    if(!touchStart.current||!touchEnd.current)return;
    const distX=touchStart.current-touchEnd.current;
    const distY=Math.abs(touchStartY.current-touchEndY.current);
    const duration=Date.now()-(touchStartTime.current||0);
    if(duration>maxDuration)return;
    if(distY>Math.abs(distX)*0.4)return;
    if(Math.abs(distX)<minSwipe)return;
    if(distX>0)onSwipeLeft();
    else onSwipeRight();
  };
  return{onTouchStart,onTouchMove,onTouchEnd};
}

// ══════════════════════════════════════════════════
//  SKELETON LOADER
// ══════════════════════════════════════════════════
export function SkeletonLoader(){
  return(
    <div style={{padding:"20px 16px"}}>
      {/* Header skeleton */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <div className="skeleton" style={{width:40,height:40,borderRadius:12}}/>
        <div style={{flex:1}}>
          <div className="skeleton" style={{height:14,width:"60%",marginBottom:6}}/>
          <div className="skeleton" style={{height:10,width:"40%"}}/>
        </div>
      </div>
      {/* Hero card skeleton */}
      <div className="skeleton" style={{height:120,borderRadius:20,marginBottom:14}}/>
      {/* Widget skeleton */}
      <div className="skeleton" style={{height:80,borderRadius:16,marginBottom:14}}/>
      {/* Stats skeleton */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:70,borderRadius:16}}/>)}
      </div>
      {/* Card skeleton */}
      <div style={{background:"var(--sur)",border:"1px solid var(--bdr)",borderRadius:16,padding:16}}>
        <div className="skeleton" style={{height:14,width:"50%",marginBottom:12}}/>
        {[1,2,3].map(i=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid var(--bdr)"}}>
          <div className="skeleton" style={{width:60,height:10,borderRadius:20,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div className="skeleton" style={{height:10,marginBottom:6}}/>
            <div className="skeleton" style={{height:8,width:"60%"}}/>
          </div>
        </div>)}
      </div>
    </div>
  );
}
