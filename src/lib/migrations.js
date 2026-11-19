import { LIVRET_JUIL26, SONGS_JUIL26 } from "../data/livretJuil26";
import { dk, memberChurches } from "./helpers";
import { normalizeItems } from "./music";
import { sbDel, sbGet, sbUpsert } from "./supabase";

// ── Migration unique : Creil passe du samedi au dimanche (à partir du 26/09/2026) ──
// Décale au lendemain tout ce qui était prévu un samedi à Creil : membres planifiés,
// sélection de service + Lead, disponibilités (membres de Creil hors Toulouse) et programmes.
// Exécutée une seule fois (drapeau "migration_creil_dimanche" dans plannings).
export const CREIL_SWITCH="2026-09-26";

export function songTitleKey(t){return (t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}

export async function importSongsJuil26(){
  const rows=await sbGet("plannings");
  if(!Array.isArray(rows)||rows.length===0)return [];
  if(rows.some(r=>r.id==="migration_songs_juil26"))return [];
  const existing=await sbGet("songs");
  if(!Array.isArray(existing)||existing.length===0)return []; // sécurité : ne jamais masquer la bibliothèque intégrée
  const have=new Set(existing.map(x=>songTitleKey(x.title)));
  const add=SONGS_JUIL26.filter(x=>!have.has(songTitleKey(x.title))&&!existing.some(e=>e.id===x.id));
  if(add.length)await sbUpsert("songs",add);
  await sbUpsert("plannings",{id:"migration_songs_juil26",member_id:"migration",church:"creil",date:"migration",availability:JSON.stringify({done:new Date().toISOString(),added:add.length})});
  return add;
}

export async function fillProgSeminaireJ1(){
  const rows=await sbGet("plannings");
  if(!Array.isArray(rows)||rows.length===0)return null;
  if(rows.some(r=>r.id==="migration_prog_seminaire_j1"))return null;
  const progs=await sbGet("programs");
  const matches=(progs||[]).filter(p=>{const t=songTitleKey(p.title);return t.includes("seminaire")&&/(jour 1|j 1|j1|jour1)( |$)/.test(t);});
  if(matches.length!==1)return {error:matches.length===0?"Programme « Séminaire jour 1 » introuvable":"Plusieurs programmes « Séminaire jour 1 » trouvés"};
  const songs=await sbGet("songs");
  if(!Array.isArray(songs)||songs.length===0)return null;
  const p=matches[0];
  let items=p.items||p.songs||[];if(typeof items==="string"){try{items=JSON.parse(items);}catch{items=[];}}
  if(!Array.isArray(items))items=[];
  const inProg=new Set(items.map(it=>it.songId||it.id));
  const missing=[];let added=0;
  LIVRET_JUIL26.forEach(([names,key])=>{
    const keys=names.map(songTitleKey);
    const sg=songs.find(x=>keys.includes(songTitleKey(x.title)));
    if(!sg){missing.push(names[0]);return;}
    if(inProg.has(sg.id))return;
    inProg.add(sg.id);added++;
    items.push({songId:sg.id,key,categorie:sg.categorie||"",notesProg:""});
  });
  const row={id:p.id,title:p.title||"",church:p.church||p.church_id||p.churchId||"creil",date:p.date||"",pages:p.pages||1,items,notes:p.notes||"",status:p.status||"draft"};
  await sbUpsert("programs",row);
  await sbUpsert("plannings",{id:"migration_prog_seminaire_j1",member_id:"migration",church:"creil",date:"migration",availability:JSON.stringify({done:new Date().toISOString(),program:p.id,added,missing})});
  return {program:{...row,churchId:row.church,items:normalizeItems(items)},added,missing};
}

export async function migrateCreilToSunday(){
  const rows=await sbGet("plannings");
  if(!Array.isArray(rows)||rows.length===0)return false;
  if(rows.some(r=>r.id==="migration_creil_dimanche"))return false;
  const isSat=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=CREIL_SWITCH&&new Date(d+"T12:00:00").getDay()===6;
  const next=d=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+1);return dk(x);};
  const mbrs=await sbGet("members");
  const creilOnly=new Set((mbrs||[]).filter(m=>{const cs=memberChurches(m);return cs.includes("creil")&&!cs.includes("toulouse");}).map(m=>m.id));
  const ups=[],dels=[];
  rows.forEach(r=>{
    if(r.church==="creil"&&isSat(r.date)){
      const nd=next(r.date);
      const newId=r.id.includes(r.date)?r.id.split(r.date).join(nd):r.id+"_"+nd;
      ups.push({...r,id:newId,date:nd});
      if(newId!==r.id)dels.push(r.id);
    }else if(r.date==="availability"&&creilOnly.has(r.member_id)&&r.availability){
      try{
        const av=JSON.parse(r.availability);let changed=false;
        Object.keys(av).forEach(k=>{if(isSat(k)){const nk=next(k);if(!av[nk])av[nk]=av[k];delete av[k];changed=true;}});
        if(changed)ups.push({...r,availability:JSON.stringify(av)});
      }catch{}
    }
  });
  const progs=await sbGet("programs");
  const progUps=(progs||[]).filter(p=>(p.church||p.church_id)==="creil"&&isSat(p.date)).map(p=>({...p,date:next(p.date)}));
  if(ups.length)await sbUpsert("plannings",ups);
  for(const id of dels)await sbDel("plannings",id);
  if(progUps.length)await sbUpsert("programs",progUps);
  await sbUpsert("plannings",{id:"migration_creil_dimanche",member_id:"migration",church:"creil",date:"migration",availability:JSON.stringify({done:new Date().toISOString(),rows:ups.length,programs:progUps.length})});
  return true;
}
