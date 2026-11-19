import React, { useState, useRef, useEffect } from "react";
import { TechMembresTab } from "./TeamMembresTab";
import { TechPlanningTab } from "./TeamPlanningTab";

// ── Onglet Technique côté admin : consultation du planning + gestion de l'équipe ──
export function AdminTechTab({T,st,year,month,prevMonth,nextMonth,A}){
  const [view,setView]=useState("planning");
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        <button className={`btn btn-sm ${view==="planning"?"btn-p":"btn-g"}`} onClick={()=>setView("planning")}>📋 {T.planTitle}</button>
        <button className={`btn btn-sm ${view==="membres"?"btn-p":"btn-g"}`} onClick={()=>setView("membres")}>👥 {T.teamName}</button>
      </div>
      {view==="planning"
        ?<TechPlanningTab T={T} st={st} canEdit={false} year={year} month={month} prevMonth={prevMonth} nextMonth={nextMonth} A={A}/>
        :<TechMembresTab T={T} st={st} canSetResp={true} A={A}/>}
    </div>
  );
}
