import React, { useState, useRef, useEffect } from "react";

// ── FlyerModal défini en haut du fichier (design amélioré) ──

// ══════════════════════════════════════════════════
//  ONGLET PIANO — programme de progression pour pianistes
// ══════════════════════════════════════════════════
export const PIANO_NOTES = ["Do","Do#","Ré","Ré#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];

export const PIANO_NOTE_TO_SEMITONE = {};

PIANO_NOTES.forEach((n,i)=>PIANO_NOTE_TO_SEMITONE[n]=i);

Object.assign(PIANO_NOTE_TO_SEMITONE,{"Réb":1,"Mib":3,"Solb":6,"Lab":8,"Sib":10});

export const PIANO_QUALITY_INTERVALS = {
  "":[0,4,7], "m":[0,3,7], "7":[0,4,7,10], "maj7":[0,4,7,11],
  "m7":[0,3,7,10], "dim7":[0,3,6,9], "sus4":[0,5,7], "6":[0,4,7,9]
};

export const PIANO_LEVELS = [
  {name:"Débutant I", xp:0},
  {name:"Débutant II", xp:100},
  {name:"Débutant III", xp:250},
  {name:"Intermédiaire I", xp:450},
  {name:"Intermédiaire II", xp:700},
  {name:"Intermédiaire III", xp:1050},
];

export const PIANO_PROGRESSIONS = [
  {id:"p1",tier:1,title:"Cadence de base I–IV–V–I",key:"Do",chords:["Do","Fa","Sol","Do"],
    desc:"La cadence la plus fondamentale, à la base de la majorité des chants de louange.",xp:15},
  {id:"p2",tier:1,title:"Ronde gospel I–vi–IV–V",key:"Do",chords:["Do","Lam","Fa","Sol"],
    desc:"Le fameux enchaînement pop/gospel utilisé dans d'innombrables chants d'adoration.",xp:15},
  {id:"p3",tier:1,title:"Louange simple en Sol",key:"Sol",chords:["Sol","Do","Ré","Sol"],
    desc:"Même logique I–IV–V–I transposée en Sol, une tonalité très courante pour la voix.",xp:15},
  {id:"p4",tier:2,title:"Turnaround gospel I–vi–ii–V",key:"Do",chords:["Do","Lam","Rém","Sol7"],
    desc:"Un turnaround classique qui prépare le retour à l'accord de tonique.",xp:25},
  {id:"p5",tier:2,title:"Walk-up basse en Fa",key:"Fa",chords:["Fa","Fa","Sib","Do"],
    desc:"Prépare une montée de basse typique du gospel (à jouer avec la main gauche qui monte).",xp:25},
  {id:"p6",tier:2,title:"Cadence plagale avec 7ème",key:"Do",chords:["Do","Fa7","Do"],
    desc:"L'accord IV7 ajoute une couleur bluesy à la cadence plagale (Amen).",xp:25},
  {id:"p7",tier:3,title:"ii–V–I jazzy",key:"Do",chords:["Rém7","Sol7","Domaj7"],
    desc:"L'enchaînement emprunté au jazz, très présent dans le worship moderne.",xp:35},
  {id:"p8",tier:3,title:"Accord de passage diminué",key:"Do",chords:["Do","Do#dim7","Rém","Sol7"],
    desc:"Le dim7 chromatique relie le I au ii, très utilisé dans les intros gospel.",xp:35},
  {id:"p9",tier:3,title:"Shout chords I–IV/I–I",key:"Do",chords:["Do","Fa","Do"],
    desc:"Base rythmique du 'shout' gospel : le IV sonne sur une pédale de basse Do.",xp:35},
  {id:"p10",tier:4,title:"Substitution tritone V7",key:"Do",chords:["Sol7","Do"],
    desc:"Remplace le V7 classique par son substitut à distance de triton.",xp:45},
  {id:"p11",tier:4,title:"Cycle des quintes gospel",key:"Do",chords:["Mi7","La7","Ré7","Sol7","Do"],
    desc:"Une chaîne de dominantes secondaires qui ramène progressivement à la tonique.",xp:45},
  {id:"p12",tier:4,title:"Vamp modulant par demi-ton",key:"Do",chords:["Do","Do#","Ré"],
    desc:"Le vamp qui monte par demi-tons, pour faire monter l'énergie en fin de chant.",xp:45},
];

export const PIANO_FINGERING = [
  {id:"f1",tier:1,hand:"Main droite",title:"Position 5 doigts (Do→Sol)",
    desc:"La position de base : chaque doigt reste au-dessus d'une touche.",xp:15,
    notes:[{n:"Do",o:0,f:1},{n:"Ré",o:0,f:2},{n:"Mi",o:0,f:3},{n:"Fa",o:0,f:4},{n:"Sol",o:0,f:5},
           {n:"Fa",o:0,f:4},{n:"Mi",o:0,f:3},{n:"Ré",o:0,f:2},{n:"Do",o:0,f:1}]},
  {id:"f2",tier:1,hand:"Main gauche",title:"Position 5 doigts (Sol→Do)",
    desc:"Même principe à la main gauche : le pouce (1) reste vers le centre du clavier.",xp:15,
    notes:[{n:"Sol",o:0,f:1},{n:"Fa",o:0,f:2},{n:"Mi",o:0,f:3},{n:"Ré",o:0,f:4},{n:"Do",o:0,f:5},
           {n:"Ré",o:0,f:4},{n:"Mi",o:0,f:3},{n:"Fa",o:0,f:2},{n:"Sol",o:0,f:1}]},
  {id:"f3",tier:1,hand:"Main droite",title:"Gamme de Do majeur (1 octave)",
    desc:"Le passage du pouce sous la main après le 3ème doigt.",xp:20,
    notes:[{n:"Do",o:0,f:1},{n:"Ré",o:0,f:2},{n:"Mi",o:0,f:3},{n:"Fa",o:0,f:1},
           {n:"Sol",o:0,f:2},{n:"La",o:0,f:3},{n:"Si",o:0,f:4},{n:"Do",o:1,f:5},
           {n:"Si",o:0,f:4},{n:"La",o:0,f:3},{n:"Sol",o:0,f:2},{n:"Fa",o:0,f:1},
           {n:"Mi",o:0,f:3},{n:"Ré",o:0,f:2},{n:"Do",o:0,f:1}]},
  {id:"f4",tier:2,hand:"Main gauche",title:"Gamme de Do majeur (main gauche, 1 octave)",
    desc:"À gauche, c'est le 3ème doigt qui passe par-dessus le pouce.",xp:25,
    notes:[{n:"Do",o:0,f:5},{n:"Ré",o:0,f:4},{n:"Mi",o:0,f:3},{n:"Fa",o:0,f:2},
           {n:"Sol",o:0,f:1},{n:"La",o:0,f:3},{n:"Si",o:0,f:2},{n:"Do",o:1,f:1},
           {n:"Si",o:0,f:2},{n:"La",o:0,f:3},{n:"Sol",o:0,f:1},{n:"Fa",o:0,f:2},
           {n:"Mi",o:0,f:3},{n:"Ré",o:0,f:4},{n:"Do",o:0,f:5}]},
  {id:"f5",tier:2,hand:"Main droite",title:"Arpège de Do majeur",
    desc:"Do–Mi–Sol–Do : la base de tout accompagnement arpégé.",xp:25,
    notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:2},{n:"Sol",o:0,f:3},{n:"Do",o:1,f:5},
           {n:"Sol",o:0,f:3},{n:"Mi",o:0,f:2},{n:"Do",o:0,f:1}]},
  {id:"f6",tier:2,hand:"Main gauche",title:"Accord brisé gospel (main gauche)",
    desc:"Pattern de basse brisée Do–Mi–Sol–Do, typique d'un accompagnement gospel simple.",xp:25,
    notes:[{n:"Do",o:0,f:5},{n:"Mi",o:0,f:3},{n:"Sol",o:0,f:2},{n:"Do",o:1,f:1}]},
  {id:"f7",tier:3,hand:"Main droite",title:"Gamme de Sol majeur",
    desc:"Attention au Fa# : le passage du pouce se fait toujours après le 3ème doigt.",xp:35,
    notes:[{n:"Sol",o:0,f:1},{n:"La",o:0,f:2},{n:"Si",o:0,f:3},{n:"Do",o:1,f:1},
           {n:"Ré",o:1,f:2},{n:"Mi",o:1,f:3},{n:"Fa#",o:1,f:4},{n:"Sol",o:1,f:5}]},
  {id:"f8",tier:3,hand:"Main droite",title:"Arpège de Sol7",
    desc:"Sol–Si–Ré–Fa : l'arpège de dominante 7 très utilisé en fin de phrase gospel.",xp:35,
    notes:[{n:"Sol",o:0,f:1},{n:"Si",o:0,f:2},{n:"Ré",o:1,f:3},{n:"Fa",o:1,f:4},{n:"Sol",o:1,f:5}]},
  {id:"f9",tier:3,hand:"Main gauche",title:"Walking bass gospel",
    desc:"Ligne de basse marchée simple pour préparer les progressions I–vi–IV–V.",xp:35,
    notes:[{n:"Do",o:0,f:5},{n:"Ré",o:0,f:4},{n:"Mi",o:0,f:3},{n:"Fa",o:0,f:2},{n:"Sol",o:0,f:1}]},
  {id:"f10",tier:4,hand:"Main droite",title:"Gamme de Do majeur (2 octaves)",
    desc:"Le double passage du pouce : la vraie base technique pour jouer vite et proprement.",xp:45,
    notes:[{n:"Do",o:0,f:1},{n:"Ré",o:0,f:2},{n:"Mi",o:0,f:3},{n:"Fa",o:0,f:1},
           {n:"Sol",o:0,f:2},{n:"La",o:0,f:3},{n:"Si",o:0,f:4},{n:"Do",o:1,f:1},
           {n:"Ré",o:1,f:2},{n:"Mi",o:1,f:3},{n:"Fa",o:1,f:1},{n:"Sol",o:1,f:2}]},
  {id:"f11",tier:4,hand:"Main droite",title:"Arpège de Do majeur (2 octaves)",
    desc:"Le pouce repasse sous la main à chaque octave pour enchaîner sans à-coup.",xp:45,
    notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:2},{n:"Sol",o:0,f:3},
           {n:"Do",o:1,f:1},{n:"Mi",o:1,f:2},{n:"Sol",o:1,f:3}]},
  {id:"f12",tier:4,hand:"Main gauche",title:"Walking bass gospel étendu",
    desc:"Une ligne de basse plus longue, à jouer en boucle avec le métronome.",xp:45,
    notes:[{n:"Do",o:0,f:5},{n:"Mi",o:0,f:3},{n:"Sol",o:0,f:2},{n:"La",o:0,f:1},
           {n:"Sol",o:0,f:2},{n:"Fa",o:0,f:3},{n:"Mi",o:0,f:3},{n:"Ré",o:0,f:4},{n:"Do",o:0,f:5}]},
];

export const PIANO_INVERSIONS = [
  {id:"inv1",tier:1,hand:"Main droite",title:"Do majeur (Do–Mi–Sol)",
    desc:"L'accord de tonique en Do : position fondamentale puis ses deux renversements.",xp:20,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:3},{n:"Sol",o:0,f:5}]},
      {label:"1er renversement",notes:[{n:"Mi",o:0,f:1},{n:"Sol",o:0,f:2},{n:"Do",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"Sol",o:0,f:1},{n:"Do",o:1,f:3},{n:"Mi",o:1,f:5}]},
    ]},
  {id:"inv2",tier:1,hand:"Main droite",title:"Fa majeur (Fa–La–Do)",
    desc:"L'accord de sous-dominante en Do : utile dans presque toutes les cadences.",xp:20,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Fa",o:0,f:1},{n:"La",o:0,f:3},{n:"Do",o:1,f:5}]},
      {label:"1er renversement",notes:[{n:"La",o:0,f:1},{n:"Do",o:1,f:2},{n:"Fa",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"Do",o:0,f:1},{n:"Fa",o:0,f:3},{n:"La",o:0,f:5}]},
    ]},
  {id:"inv3",tier:1,hand:"Main droite",title:"Sol majeur (Sol–Si–Ré)",
    desc:"L'accord de dominante en Do, moteur de toute cadence conclusive.",xp:20,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Sol",o:0,f:1},{n:"Si",o:0,f:3},{n:"Ré",o:1,f:5}]},
      {label:"1er renversement",notes:[{n:"Si",o:0,f:1},{n:"Ré",o:1,f:2},{n:"Sol",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"Ré",o:0,f:1},{n:"Sol",o:0,f:3},{n:"Si",o:0,f:5}]},
    ]},
  {id:"inv4",tier:2,hand:"Main droite",title:"La mineur (La–Do–Mi)",
    desc:"L'accord relatif mineur, pilier du fameux enchaînement I–vi–IV–V.",xp:25,
    positions:[
      {label:"Position fondamentale",notes:[{n:"La",o:0,f:1},{n:"Do",o:1,f:3},{n:"Mi",o:1,f:5}]},
      {label:"1er renversement",notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:2},{n:"La",o:0,f:5}]},
      {label:"2e renversement",notes:[{n:"Mi",o:0,f:1},{n:"La",o:0,f:3},{n:"Do",o:1,f:5}]},
    ]},
  {id:"inv5",tier:2,hand:"Main droite",title:"Ré mineur (Ré–Fa–La)",
    desc:"L'accord de ii, souvent utilisé juste avant la dominante (ii–V–I).",xp:25,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Ré",o:0,f:1},{n:"Fa",o:0,f:3},{n:"La",o:0,f:5}]},
      {label:"1er renversement",notes:[{n:"Fa",o:0,f:1},{n:"La",o:0,f:2},{n:"Ré",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"La",o:0,f:1},{n:"Ré",o:1,f:3},{n:"Fa",o:1,f:5}]},
    ]},
  {id:"inv6",tier:3,hand:"Main droite",title:"Sol7 (Sol–Si–Ré–Fa)",
    desc:"L'accord de dominante 7, avec ses 3 renversements possibles.",xp:35,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Sol",o:0,f:1},{n:"Si",o:0,f:2},{n:"Ré",o:1,f:3},{n:"Fa",o:1,f:5}]},
      {label:"1er renversement",notes:[{n:"Si",o:0,f:1},{n:"Ré",o:1,f:2},{n:"Fa",o:1,f:3},{n:"Sol",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"Ré",o:0,f:1},{n:"Fa",o:0,f:2},{n:"Sol",o:0,f:3},{n:"Si",o:0,f:5}]},
      {label:"3e renversement",notes:[{n:"Fa",o:0,f:1},{n:"Sol",o:0,f:2},{n:"Si",o:0,f:3},{n:"Ré",o:1,f:5}]},
    ]},
  {id:"inv7",tier:3,hand:"Main droite",title:"Rém7 (Ré–Fa–La–Do)",
    desc:"L'accord de ii7, très courant dans les intros et transitions gospel.",xp:35,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Ré",o:0,f:1},{n:"Fa",o:0,f:2},{n:"La",o:0,f:3},{n:"Do",o:1,f:5}]},
      {label:"1er renversement",notes:[{n:"Fa",o:0,f:1},{n:"La",o:0,f:2},{n:"Do",o:1,f:3},{n:"Ré",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"La",o:0,f:1},{n:"Do",o:1,f:2},{n:"Ré",o:1,f:3},{n:"Fa",o:1,f:5}]},
      {label:"3e renversement",notes:[{n:"Do",o:0,f:1},{n:"Ré",o:0,f:2},{n:"Fa",o:0,f:3},{n:"La",o:0,f:5}]},
    ]},
  {id:"inv8",tier:4,hand:"Main droite",title:"Domaj7 (Do–Mi–Sol–Si)",
    desc:"L'accord de tonique avec 7ème majeure, pour une couleur plus jazzy/worship.",xp:45,
    positions:[
      {label:"Position fondamentale",notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:2},{n:"Sol",o:0,f:3},{n:"Si",o:0,f:5}]},
      {label:"1er renversement",notes:[{n:"Mi",o:0,f:1},{n:"Sol",o:0,f:2},{n:"Si",o:0,f:3},{n:"Do",o:1,f:5}]},
      {label:"2e renversement",notes:[{n:"Sol",o:0,f:1},{n:"Si",o:0,f:2},{n:"Do",o:1,f:3},{n:"Mi",o:1,f:5}]},
      {label:"3e renversement",notes:[{n:"Si",o:0,f:1},{n:"Do",o:1,f:2},{n:"Mi",o:1,f:3},{n:"Sol",o:1,f:5}]},
    ]},
  {id:"inv9",tier:4,hand:"Main droite",title:"La7 (La–Do#–Mi–Sol)",
    desc:"Dominante secondaire très utilisée dans le cycle des quintes gospel.",xp:45,
    positions:[
      {label:"Position fondamentale",notes:[{n:"La",o:0,f:1},{n:"Do#",o:1,f:2},{n:"Mi",o:1,f:3},{n:"Sol",o:1,f:5}]},
      {label:"1er renversement",notes:[{n:"Do#",o:0,f:1},{n:"Mi",o:0,f:2},{n:"Sol",o:0,f:3},{n:"La",o:0,f:5}]},
      {label:"2e renversement",notes:[{n:"Mi",o:0,f:1},{n:"Sol",o:0,f:2},{n:"La",o:0,f:3},{n:"Do#",o:1,f:5}]},
      {label:"3e renversement",notes:[{n:"Sol",o:0,f:1},{n:"La",o:0,f:2},{n:"Do#",o:1,f:3},{n:"Mi",o:1,f:5}]},
    ]},
  {id:"inv10",tier:4,hand:"Main droite",title:"Enchaînement fluide I–vi–IV–V",
    desc:"En choisissant le bon renversement pour chaque accord, la main bouge à peine.",xp:50,
    positions:[
      {label:"Do (position fondamentale)",notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:2},{n:"Sol",o:0,f:5}]},
      {label:"Lam (1er renversement)",notes:[{n:"Do",o:0,f:1},{n:"Mi",o:0,f:2},{n:"La",o:0,f:5}]},
      {label:"Fa (2e renversement)",notes:[{n:"Do",o:0,f:1},{n:"Fa",o:0,f:3},{n:"La",o:0,f:5}]},
      {label:"Sol (2e renversement)",notes:[{n:"Ré",o:0,f:1},{n:"Sol",o:0,f:3},{n:"Si",o:0,f:5}]},
    ]},
];

export const PIANO_EAR_MODES = [
  {id:"e1",tier:1,icon:"🎵",title:"Majeur ou mineur ?",desc:"Identifie la couleur de l'accord",
    gen:()=>{
      const root = pianoRandomFrom(["Do","Ré","Fa","Sol","La"]);
      const quality = pianoRandomFrom(["","m"]);
      return {chord:root+(quality==="m"?"m":""), answer:quality===""?"Majeur":"Mineur",
        options:["Majeur","Mineur"]};
    }},
  {id:"e2",tier:2,icon:"🎯",title:"Quelle note fondamentale ?",desc:"Retrouve la basse jouée",
    gen:()=>{
      const root = pianoRandomFrom(["Do","Ré","Mi","Fa","Sol","La","Si"]);
      return {chord:root, answer:root, options:["Do","Ré","Mi","Fa","Sol","La","Si"]};
    }},
  {id:"e3",tier:3,icon:"7️⃣",title:"Type d'accord de 7ème",desc:"Dominante, majeur7 ou mineur7 ?",
    gen:()=>{
      const root = pianoRandomFrom(["Do","Ré","Fa","Sol"]);
      const q = pianoRandomFrom(["7","maj7","m7"]);
      const labels = {"7":"Dominante 7","maj7":"Majeur 7","m7":"Mineur 7"};
      return {chord:root+q, answer:labels[q], options:["Dominante 7","Majeur 7","Mineur 7"]};
    }},
  {id:"e4",tier:4,icon:"🔁",title:"Quelle cadence ?",desc:"ii–V–I ou I–IV–V ?",
    gen:()=>{
      const isIiVi = Math.random()<0.5;
      const seq = isIiVi ? ["Rém7","Sol7","Domaj7"] : ["Do","Fa","Sol"];
      return {sequence:seq, answer:isIiVi?"ii–V–I":"I–IV–V", options:["ii–V–I","I–IV–V"]};
    }},
];

export const PIANO_REPERTOIRE = [
  {cat:"Louange (rapide, joyeuse)",sub:"Tempo enlevé, accords simples et francs.",progIds:["p1","p2","p3","p5"]},
  {cat:"Adoration (lente, intimiste)",sub:"Harmonies plus riches, tenues, avec 7èmes et passages.",progIds:["p6","p7","p8"]},
  {cat:"Sainte-Cène",sub:"Ambiance recueillie, cadences plagales et résolutions douces.",progIds:["p6","p9"]},
  {cat:"Dîme & Offrandes / montée en énergie",sub:"Vamps et cycles qui font monter l'intensité.",progIds:["p10","p11","p12"]},
];

export function pianoRandomFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

export function pianoTierLabel(t){ return {1:"Débutant",2:"Débutant+",3:"Intermédiaire",4:"Intermédiaire+"}[t]; }

export function pianoParseChordSymbol(sym){
  let base = sym.split("/")[0];
  let root = null, quality = "";
  const candidates = Object.keys(PIANO_NOTE_TO_SEMITONE).sort((a,b)=>b.length-a.length);
  for(const c of candidates){
    if(base.startsWith(c)){ root=c; quality = base.slice(c.length); break; }
  }
  if(!root){ root="Do"; quality=""; }
  if(!(quality in PIANO_QUALITY_INTERVALS)) quality = "";
  return {root, quality};
}

export function pianoChordSemitones(sym){
  const {root, quality} = pianoParseChordSymbol(sym);
  const rootSemi = PIANO_NOTE_TO_SEMITONE[root];
  const intervals = PIANO_QUALITY_INTERVALS[quality] || PIANO_QUALITY_INTERVALS[""];
  return intervals.map(iv=>(rootSemi+iv)%12);
}

export function pianoNoteFreq(noteName, octave){
  const semitone = PIANO_NOTE_TO_SEMITONE[noteName];
  const midiLike = (octave+1)*12 + semitone;
  return 440 * Math.pow(2, (midiLike-69)/12);
}

// ── Rendu du clavier virtuel (SVG en chaîne, injecté via dangerouslySetInnerHTML) ──
export function pianoKeyboardSvg(activeSemitones){
  const whiteSemis = [0,2,4,5,7,9,11];
  const blackInfo = [{semi:1,afterWhiteIdx:0},{semi:3,afterWhiteIdx:1},{semi:6,afterWhiteIdx:3},{semi:8,afterWhiteIdx:4},{semi:10,afterWhiteIdx:5}];
  const octaves = 2, whiteW = 34, whiteH = 120, blackW = 20, blackH = 76;
  const svgW = whiteSemis.length*octaves*whiteW;
  let svg = `<svg viewBox="0 0 ${svgW} ${whiteH}" width="${Math.min(svgW,640)}" height="${whiteH}">`;
  for(let o=0;o<octaves;o++){
    whiteSemis.forEach((semi,i)=>{
      const x=(o*whiteSemis.length+i)*whiteW;
      const active=activeSemitones.includes(semi)?"pk-active":"";
      svg+=`<rect class="pk-white ${active}" x="${x}" y="0" width="${whiteW-1}" height="${whiteH}" rx="4"></rect>`;
    });
  }
  for(let o=0;o<octaves;o++){
    blackInfo.forEach(b=>{
      const x=(o*whiteSemis.length+b.afterWhiteIdx)*whiteW+whiteW-blackW/2;
      const active=activeSemitones.includes(b.semi)?"pk-active":"";
      svg+=`<rect class="pk-black ${active}" x="${x}" y="0" width="${blackW}" height="${blackH}" rx="3"></rect>`;
    });
  }
  return svg+`</svg>`;
}

export function pianoSingleKeySvg(note, octaveRel, finger){
  const whiteSemis=[0,2,4,5,7,9,11];
  const blackInfo=[{semi:1,afterWhiteIdx:0},{semi:3,afterWhiteIdx:1},{semi:6,afterWhiteIdx:3},{semi:8,afterWhiteIdx:4},{semi:10,afterWhiteIdx:5}];
  const octaves=2, whiteW=34, whiteH=120, blackW=20, blackH=76;
  const svgW=whiteSemis.length*octaves*whiteW;
  const targetSemi=PIANO_NOTE_TO_SEMITONE[note];
  const isBlack=![0,2,4,5,7,9,11].includes(targetSemi);
  let svg=`<svg viewBox="0 0 ${svgW} ${whiteH}" width="${Math.min(svgW,640)}" height="${whiteH}">`;
  for(let o=0;o<octaves;o++){
    whiteSemis.forEach((semi,i)=>{
      const x=(o*whiteSemis.length+i)*whiteW;
      const active=(!isBlack&&semi===targetSemi&&o===octaveRel)?"pk-active":"";
      svg+=`<rect class="pk-white ${active}" x="${x}" y="0" width="${whiteW-1}" height="${whiteH}" rx="4"></rect>`;
      if(active) svg+=`<text class="pk-finger pk-finger-white" x="${x+whiteW/2}" y="${whiteH-16}">${finger}</text>`;
    });
  }
  for(let o=0;o<octaves;o++){
    blackInfo.forEach(b=>{
      const x=(o*whiteSemis.length+b.afterWhiteIdx)*whiteW+whiteW-blackW/2;
      const active=(isBlack&&b.semi===targetSemi&&o===octaveRel)?"pk-active":"";
      svg+=`<rect class="pk-black ${active}" x="${x}" y="0" width="${blackW}" height="${blackH}" rx="3"></rect>`;
      if(active) svg+=`<text class="pk-finger" x="${x+blackW/2}" y="${blackH-12}">${finger}</text>`;
    });
  }
  return svg+`</svg>`;
}

export function pianoChordKeysSvg(notesArr){
  const whiteSemis=[0,2,4,5,7,9,11];
  const blackInfo=[{semi:1,afterWhiteIdx:0},{semi:3,afterWhiteIdx:1},{semi:6,afterWhiteIdx:3},{semi:8,afterWhiteIdx:4},{semi:10,afterWhiteIdx:5}];
  const octaves=2, whiteW=34, whiteH=120, blackW=20, blackH=76;
  const svgW=whiteSemis.length*octaves*whiteW;
  const targets=notesArr.map(note=>({semi:PIANO_NOTE_TO_SEMITONE[note.n],o:note.o,f:note.f,isBlack:![0,2,4,5,7,9,11].includes(PIANO_NOTE_TO_SEMITONE[note.n])}));
  let svg=`<svg viewBox="0 0 ${svgW} ${whiteH}" width="${Math.min(svgW,640)}" height="${whiteH}">`;
  for(let o=0;o<octaves;o++){
    whiteSemis.forEach((semi,i)=>{
      const x=(o*whiteSemis.length+i)*whiteW;
      const hit=targets.find(t=>!t.isBlack&&t.semi===semi&&t.o===o);
      svg+=`<rect class="pk-white ${hit?"pk-active":""}" x="${x}" y="0" width="${whiteW-1}" height="${whiteH}" rx="4"></rect>`;
      if(hit) svg+=`<text class="pk-finger pk-finger-white" x="${x+whiteW/2}" y="${whiteH-16}">${hit.f}</text>`;
    });
  }
  for(let o=0;o<octaves;o++){
    blackInfo.forEach(b=>{
      const x=(o*whiteSemis.length+b.afterWhiteIdx)*whiteW+whiteW-blackW/2;
      const hit=targets.find(t=>t.isBlack&&t.semi===b.semi&&t.o===o);
      svg+=`<rect class="pk-black ${hit?"pk-active":""}" x="${x}" y="0" width="${blackW}" height="${blackH}" rx="3"></rect>`;
      if(hit) svg+=`<text class="pk-finger" x="${x+blackW/2}" y="${blackH-12}">${hit.f}</text>`;
    });
  }
  return svg+`</svg>`;
}

export function loadPianoState(){
  const def = {xp:0, masteredProgs:[], masteredFingering:[], masteredInversions:[], earStats:{ok:0,total:0}, streak:0};
  try{
    const raw = localStorage.getItem("jclc_piano_state_"+(window.__pianoUserKey||"anon"));
    if(raw) return Object.assign(def, JSON.parse(raw));
  }catch(e){}
  return def;
}

export function PianoTab({ user }) {
  const [state, setState] = useState(loadPianoState);
  const [sub, setSub] = useState("accueil");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const audioCtxRef = useRef(null);

  const storageKey = "jclc_piano_state_"+(user?.name||"anon").replace(/\s+/g,"_");

  useEffect(()=>{
    try{ localStorage.setItem(storageKey, JSON.stringify(state)); }catch(e){}
  }, [state, storageKey]);

  function showToast(msg){
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2200);
  }
  function addXp(amount){
    setState(s=>({...s, xp:s.xp+amount}));
    showToast("+"+amount+" XP !");
  }

  function getCtx(){
    if(!audioCtxRef.current){ audioCtxRef.current = new (window.AudioContext||window.webkitAudioContext)(); }
    if(audioCtxRef.current.state==="suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }
  function playTone(freq, startAt, duration, gainVal){
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime+startAt);
    gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime+startAt+0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+startAt+duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime+startAt);
    osc.stop(ctx.currentTime+startAt+duration+0.05);
  }
  function playChord(sym, octave=4, duration=1.1){
    const {root, quality} = pianoParseChordSymbol(sym);
    const rootSemi = PIANO_NOTE_TO_SEMITONE[root];
    const intervals = PIANO_QUALITY_INTERVALS[quality] || PIANO_QUALITY_INTERVALS[""];
    intervals.forEach(iv=>{
      const semi = rootSemi+iv;
      const oct = octave + Math.floor(semi/12);
      playTone(pianoNoteFreq(PIANO_NOTES[semi%12], oct), 0, duration, 0.14);
    });
  }
  function playSequence(chordSyms, chordDur=1.0, gap=0.15){
    chordSyms.forEach((sym,i)=>{
      const startAt = i*(chordDur+gap);
      const {root, quality} = pianoParseChordSymbol(sym);
      const rootSemi = PIANO_NOTE_TO_SEMITONE[root];
      const intervals = PIANO_QUALITY_INTERVALS[quality] || PIANO_QUALITY_INTERVALS[""];
      intervals.forEach(iv=>{
        const semi = rootSemi+iv;
        const oct = 4 + Math.floor(semi/12);
        playTone(pianoNoteFreq(PIANO_NOTES[semi%12], oct), startAt, chordDur, 0.13);
      });
    });
  }
  function playSingleNote(noteName, octave, duration=0.5){ playTone(pianoNoteFreq(noteName, octave), 0, duration, 0.16); }
  function playNoteSequence(notes, noteDur=0.5, gap=0.08){
    notes.forEach((note,i)=>playTone(pianoNoteFreq(note.n, 4+note.o), i*(noteDur+gap), noteDur, 0.16));
  }
  function playChordVoicing(notes, duration=1.2){
    notes.forEach(note=>playTone(pianoNoteFreq(note.n, 4+note.o), 0, duration, 0.13));
  }

  // ── Métronome ──
  const metroRef = useRef({timerId:null, nextNoteTime:0, beatCount:0, lookahead:25, scheduleAheadTime:0.12});
  const [metroBpm, setMetroBpm] = useState(80);
  const [metroRunning, setMetroRunning] = useState(false);
  const [metroFlash, setMetroFlash] = useState(null);
  const tapTimesRef = useRef([]);

  function metroScheduleClick(beatNumber, time){
    const ctx = getCtx();
    const accent = beatNumber % 4 === 0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = accent ? 1500 : 1000;
    gain.gain.setValueAtTime(accent?0.22:0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time+0.05);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(time); osc.stop(time+0.06);
    const delayMs = Math.max(0,(time-ctx.currentTime)*1000);
    setTimeout(()=>{
      setMetroFlash(accent?"accent":"normal");
      setTimeout(()=>setMetroFlash(null), 100);
    }, delayMs);
  }
  function metroTick(){
    const ctx = getCtx();
    const m = metroRef.current;
    while(m.nextNoteTime < ctx.currentTime + m.scheduleAheadTime){
      metroScheduleClick(m.beatCount, m.nextNoteTime);
      m.nextNoteTime += 60.0/metroBpm;
      m.beatCount++;
    }
  }
  function metroStart(){
    const ctx = getCtx();
    metroRef.current.beatCount = 0;
    metroRef.current.nextNoteTime = ctx.currentTime + 0.05;
    metroRef.current.timerId = setInterval(metroTick, metroRef.current.lookahead);
    setMetroRunning(true);
  }
  function metroStop(){
    clearInterval(metroRef.current.timerId);
    setMetroRunning(false);
  }
  useEffect(()=>()=>clearInterval(metroRef.current.timerId), []);
  function handleTapTempo(){
    const now = performance.now();
    tapTimesRef.current = tapTimesRef.current.filter(t=>now-t<2500);
    tapTimesRef.current.push(now);
    if(tapTimesRef.current.length>=2){
      const intervals=[];
      for(let i=1;i<tapTimesRef.current.length;i++) intervals.push(tapTimesRef.current[i]-tapTimesRef.current[i-1]);
      const avg = intervals.reduce((a,b)=>a+b,0)/intervals.length;
      setMetroBpm(Math.round(Math.min(208,Math.max(40,60000/avg))));
    }
  }

  function currentLevelIndex(){
    let idx=0;
    for(let i=0;i<PIANO_LEVELS.length;i++){ if(state.xp>=PIANO_LEVELS[i].xp) idx=i; }
    return idx;
  }
  function currentTierUnlocked(){
    const idx=currentLevelIndex();
    if(idx>=4) return 4; if(idx>=3) return 3; if(idx>=2) return 2; return 1;
  }

  const [practiceProg, setPracticeProg] = useState(null);
  function openPractice(id){ setPracticeProg({id, stepIndex:0}); }
  function masterProg(p){
    if(!state.masteredProgs.includes(p.id)){
      setState(s=>({...s, masteredProgs:[...s.masteredProgs, p.id]}));
      addXp(p.xp);
    }
  }

  const [practiceFinger, setPracticeFinger] = useState(null);
  function openFingerPractice(id){ setPracticeFinger({id, stepIndex:0}); }
  function masterFinger(f){
    if(!state.masteredFingering.includes(f.id)){
      setState(s=>({...s, masteredFingering:[...s.masteredFingering, f.id]}));
      addXp(f.xp);
    }
  }

  const [practiceInv, setPracticeInv] = useState(null);
  function openInvPractice(id){ setPracticeInv({id, posIndex:0}); }
  function masterInv(inv){
    if(!state.masteredInversions.includes(inv.id)){
      setState(s=>({...s, masteredInversions:[...s.masteredInversions, inv.id]}));
      addXp(inv.xp);
    }
  }

  const [earMode, setEarMode] = useState(null);
  const [earEx, setEarEx] = useState(null);
  const [earAnswered, setEarAnswered] = useState(null);
  function startEarMode(m){ setEarMode(m); setEarEx(m.gen()); setEarAnswered(null); }
  function nextEarExercise(){ setEarEx(earMode.gen()); setEarAnswered(null); }
  function playEarSound(ex){ if(ex.sequence) playSequence(ex.sequence); else playChord(ex.chord); }
  function answerEar(opt){
    const correct = opt===earEx.answer;
    setEarAnswered({opt, correct});
    setState(s=>({...s, earStats:{ok:s.earStats.ok+(correct?1:0), total:s.earStats.total+1}, streak: correct?s.streak+1:0}));
    if(correct) addXp(5);
  }

  const unlockedTier = currentTierUnlocked();
  const lvlIdx = currentLevelIndex();
  const lvl = PIANO_LEVELS[lvlIdx];
  const nextLvl = PIANO_LEVELS[lvlIdx+1];
  const xpPct = nextLvl ? Math.min(100, Math.round(((state.xp-lvl.xp)/(nextLvl.xp-lvl.xp))*100)) : 100;

  const subTabs = [
    {id:"accueil", l:"Accueil"},
    {id:"progressions", l:"Progressions"},
    {id:"doigtes", l:"Doigtés"},
    {id:"renversements", l:"Renversements"},
    {id:"oreille", l:"Oreille"},
    {id:"repertoire", l:"Répertoire"},
  ];

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">🎹 Espace Piano</div>
          <div className="ps">Programme de progression gospel/worship — {lvl.name}</div>
        </div>
      </div>

      {toast && <div className="toast" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#432a6b",color:"#fff",padding:"12px 22px",borderRadius:30,fontWeight:600,zIndex:50}}>{toast}</div>}

      <div style={{padding:"0 16px 12px"}}>
        <div style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:"12px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:"#432a6b"}}>
            <span>{lvl.name}</span>
            <span>{state.xp} XP</span>
          </div>
          <div style={{background:"#eee3cf",borderRadius:8,height:10,overflow:"hidden",marginTop:6}}>
            <div style={{height:"100%",width:xpPct+"%",background:"linear-gradient(90deg,#a67418,#c9932a)",borderRadius:8}}/>
          </div>
          <div style={{fontSize:11,color:"#7a6f63",marginTop:4}}>
            {nextLvl ? `Encore ${nextLvl.xp-state.xp} XP pour ${nextLvl.name}` : "Niveau maximum atteint !"}
          </div>
        </div>
      </div>

      <div style={{padding:"0 16px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:"10px 16px"}}>
          <span style={{fontWeight:700,color:"#432a6b",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:14,height:14,borderRadius:"50%",background: metroFlash==="accent"?"#5b3a8e":metroFlash==="normal"?"#c9932a":"#e8ded0",display:"inline-block"}}/>
            Métronome
          </span>
          <button className={`btn btn-sm ${metroRunning?"btn-r":"btn-p"}`} onClick={()=>metroRunning?metroStop():metroStart()}>
            {metroRunning ? "⏸ Stop" : "▶ Démarrer"}
          </button>
          <input type="range" min="40" max="208" value={metroBpm} onChange={e=>setMetroBpm(parseInt(e.target.value,10))} style={{width:130}}/>
          <span style={{fontFamily:"monospace",fontWeight:700}}>{metroBpm} BPM</span>
          <button className="btn btn-g btn-sm" onClick={handleTapTempo}>Tap tempo</button>
        </div>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"0 16px 12px"}}>
        {subTabs.map(t=>(
          <button key={t.id} className={`btn btn-sm ${sub===t.id?"btn-p":"btn-g"}`}
            onClick={()=>{setSub(t.id); setPracticeProg(null); setPracticeFinger(null); setPracticeInv(null); setEarMode(null);}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{padding:"0 16px 24px"}}>
        {sub==="accueil" && (
          <div style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:16}}>
            <p style={{margin:"0 0 10px",color:"#7a6f63",fontSize:14,lineHeight:1.5}}>
              Bienvenue dans l'espace Piano ! Pratique des progressions d'accords, des exercices de doigtés,
              des renversements et ton oreille musicale. Ton niveau évolue du débutant vers l'intermédiaire
              au fil de tes exercices.
            </p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:"#7a6f63"}}>
              <span>Progressions maîtrisées : <b style={{color:"#2b2320"}}>{state.masteredProgs.length}</b>/{PIANO_PROGRESSIONS.length}</span>
              <span>Doigtés maîtrisés : <b style={{color:"#2b2320"}}>{state.masteredFingering.length}</b>/{PIANO_FINGERING.length}</span>
              <span>Renversements maîtrisés : <b style={{color:"#2b2320"}}>{state.masteredInversions.length}</b>/{PIANO_INVERSIONS.length}</span>
              <span>Oreille réussis : <b style={{color:"#2b2320"}}>{state.earStats.ok}</b></span>
              <span>Série : <b style={{color:"#2b2320"}}>{state.streak}</b> 🔥</span>
            </div>
          </div>
        )}

        {sub==="progressions" && !practiceProg && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {PIANO_PROGRESSIONS.map(p=>{
              const locked = p.tier>unlockedTier;
              const mastered = state.masteredProgs.includes(p.id);
              return (
                <div key={p.id} onClick={()=>!locked&&openPractice(p.id)}
                  style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:14,cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,position:"relative"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#f1ece0",color:"#7a6f63"}}>{pianoTierLabel(p.tier)}</span>
                  {mastered && <span style={{position:"absolute",top:10,right:12,color:"#3f8a5c"}}>✓</span>}
                  {locked && <span style={{position:"absolute",top:10,right:12}}>🔒</span>}
                  <h3 style={{margin:"6px 0 4px",fontSize:15}}>{p.title}</h3>
                  <div style={{color:"#7a6f63",fontSize:13,fontFamily:"monospace"}}>{p.chords.join(" – ")}</div>
                </div>
              );
            })}
          </div>
        )}
        {sub==="progressions" && practiceProg && (()=>{
          const p = PIANO_PROGRESSIONS.find(x=>x.id===practiceProg.id);
          const semis = pianoChordSemitones(p.chords[practiceProg.stepIndex]);
          const already = state.masteredProgs.includes(p.id);
          return (
            <div>
              <button className="btn btn-g btn-sm" style={{marginBottom:12}} onClick={()=>setPracticeProg(null)}>← Retour</button>
              <div style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:16}}>
                <h3 style={{margin:"0 0 4px"}}>{p.title}</h3>
                <p style={{color:"#7a6f63",fontSize:13}}>{p.desc} (Tonalité de référence : {p.key})</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"14px 0"}}>
                  {p.chords.map((c,i)=>(
                    <span key={i} style={{padding:"10px 16px",borderRadius:10,fontWeight:700,fontFamily:"monospace",
                      background:i===practiceProg.stepIndex?"#5b3a8e":i<practiceProg.stepIndex?"#e3f2e8":"#f1ece0",
                      color:i===practiceProg.stepIndex?"#fff":i<practiceProg.stepIndex?"#3f8a5c":"#7a6f63"}}>{c}</span>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"center",margin:"18px 0",overflowX:"auto"}}
                  dangerouslySetInnerHTML={{__html: pianoKeyboardSvg(semis)}}/>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="btn btn-p btn-sm" onClick={()=>playSequence(p.chords)}>▶ Écouter la progression</button>
                  <button className="btn btn-g btn-sm" onClick={()=>{
                    const next=(practiceProg.stepIndex+1)%p.chords.length;
                    setPracticeProg({...practiceProg, stepIndex:next});
                    playChord(p.chords[next]);
                  }}>Étape suivante</button>
                  <button className="btn btn-p btn-sm" disabled={already} onClick={()=>masterProg(p)}>
                    {already?"✓ Déjà maîtrisée":`✓ Marquer comme maîtrisée (+${p.xp} XP)`}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {sub==="doigtes" && !practiceFinger && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {PIANO_FINGERING.map(f=>{
              const locked = f.tier>unlockedTier;
              const mastered = state.masteredFingering.includes(f.id);
              return (
                <div key={f.id} onClick={()=>!locked&&openFingerPractice(f.id)}
                  style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:14,cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,position:"relative"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#f1ece0",color:"#7a6f63"}}>{pianoTierLabel(f.tier)}</span>
                  {mastered && <span style={{position:"absolute",top:10,right:12,color:"#3f8a5c"}}>✓</span>}
                  {locked && <span style={{position:"absolute",top:10,right:12}}>🔒</span>}
                  <h3 style={{margin:"6px 0 4px",fontSize:15}}>{f.title} <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#eee3cf",color:"#7a6f63"}}>{f.hand}</span></h3>
                  <div style={{color:"#7a6f63",fontSize:13}}>{f.notes.length} notes</div>
                </div>
              );
            })}
          </div>
        )}
        {sub==="doigtes" && practiceFinger && (()=>{
          const f = PIANO_FINGERING.find(x=>x.id===practiceFinger.id);
          const note = f.notes[practiceFinger.stepIndex];
          const already = state.masteredFingering.includes(f.id);
          return (
            <div>
              <button className="btn btn-g btn-sm" style={{marginBottom:12}} onClick={()=>setPracticeFinger(null)}>← Retour</button>
              <div style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:16}}>
                <h3 style={{margin:"0 0 4px"}}>{f.title}</h3>
                <p style={{color:"#7a6f63",fontSize:13}}>{f.desc} ({f.hand})</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"14px 0"}}>
                  {f.notes.map((n,i)=>(
                    <span key={i} style={{padding:"10px 16px",borderRadius:10,fontWeight:700,fontFamily:"monospace",
                      background:i===practiceFinger.stepIndex?"#5b3a8e":i<practiceFinger.stepIndex?"#e3f2e8":"#f1ece0",
                      color:i===practiceFinger.stepIndex?"#fff":i<practiceFinger.stepIndex?"#3f8a5c":"#7a6f63"}}>{n.n} ({n.f})</span>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"center",margin:"18px 0",overflowX:"auto"}}
                  dangerouslySetInnerHTML={{__html: pianoSingleKeySvg(note.n, note.o, note.f)}}/>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="btn btn-p btn-sm" onClick={()=>playNoteSequence(f.notes)}>▶ Écouter la séquence</button>
                  <button className="btn btn-g btn-sm" onClick={()=>{
                    const next=(practiceFinger.stepIndex+1)%f.notes.length;
                    setPracticeFinger({...practiceFinger, stepIndex:next});
                    const n2=f.notes[next]; playSingleNote(n2.n, 4+n2.o, 0.35);
                  }}>Étape suivante</button>
                  <button className="btn btn-p btn-sm" disabled={already} onClick={()=>masterFinger(f)}>
                    {already?"✓ Déjà maîtrisé":`✓ Marquer comme maîtrisé (+${f.xp} XP)`}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {sub==="renversements" && !practiceInv && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {PIANO_INVERSIONS.map(inv=>{
              const locked = inv.tier>unlockedTier;
              const mastered = state.masteredInversions.includes(inv.id);
              return (
                <div key={inv.id} onClick={()=>!locked&&openInvPractice(inv.id)}
                  style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:14,cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,position:"relative"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#f1ece0",color:"#7a6f63"}}>{pianoTierLabel(inv.tier)}</span>
                  {mastered && <span style={{position:"absolute",top:10,right:12,color:"#3f8a5c"}}>✓</span>}
                  {locked && <span style={{position:"absolute",top:10,right:12}}>🔒</span>}
                  <h3 style={{margin:"6px 0 4px",fontSize:15}}>{inv.title}</h3>
                  <div style={{color:"#7a6f63",fontSize:13}}>{inv.positions.length} positions</div>
                </div>
              );
            })}
          </div>
        )}
        {sub==="renversements" && practiceInv && (()=>{
          const inv = PIANO_INVERSIONS.find(x=>x.id===practiceInv.id);
          const pos = inv.positions[practiceInv.posIndex];
          const already = state.masteredInversions.includes(inv.id);
          return (
            <div>
              <button className="btn btn-g btn-sm" style={{marginBottom:12}} onClick={()=>setPracticeInv(null)}>← Retour</button>
              <div style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:16}}>
                <h3 style={{margin:"0 0 4px"}}>{inv.title}</h3>
                <p style={{color:"#7a6f63",fontSize:13}}>{inv.desc} ({inv.hand})</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"14px 0"}}>
                  {inv.positions.map((p,i)=>(
                    <span key={i} style={{padding:"10px 16px",borderRadius:10,fontWeight:700,fontFamily:"monospace",
                      background:i===practiceInv.posIndex?"#5b3a8e":i<practiceInv.posIndex?"#e3f2e8":"#f1ece0",
                      color:i===practiceInv.posIndex?"#fff":i<practiceInv.posIndex?"#3f8a5c":"#7a6f63"}}>{p.label}</span>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"center",margin:"18px 0",overflowX:"auto"}}
                  dangerouslySetInnerHTML={{__html: pianoChordKeysSvg(pos.notes)}}/>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="btn btn-p btn-sm" onClick={()=>playChordVoicing(pos.notes)}>▶ Écouter cette position</button>
                  <button className="btn btn-g btn-sm" onClick={()=>{
                    const next=(practiceInv.posIndex+1)%inv.positions.length;
                    setPracticeInv({...practiceInv, posIndex:next});
                    playChordVoicing(inv.positions[next].notes);
                  }}>Position suivante</button>
                  <button className="btn btn-p btn-sm" disabled={already} onClick={()=>masterInv(inv)}>
                    {already?"✓ Déjà maîtrisé":`✓ Marquer comme maîtrisé (+${inv.xp} XP)`}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {sub==="oreille" && !earMode && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
            {PIANO_EAR_MODES.map(m=>{
              const locked = m.tier>unlockedTier;
              return (
                <div key={m.id} onClick={()=>!locked&&startEarMode(m)}
                  style={{background:"#fff",border:"2px solid #e8ded0",borderRadius:14,padding:14,textAlign:"center",cursor:locked?"not-allowed":"pointer",opacity:locked?0.5:1}}>
                  <div style={{fontSize:"1.6rem"}}>{m.icon}</div>
                  <h4 style={{margin:"6px 0 2px",fontSize:14}}>{m.title}</h4>
                  <p style={{margin:0,fontSize:12,color:"#7a6f63"}}>{m.desc}</p>
                </div>
              );
            })}
          </div>
        )}
        {sub==="oreille" && earMode && earEx && (
          <div style={{background:"#fff",border:"1px solid #e8ded0",borderRadius:14,padding:16}}>
            <button className="btn btn-g btn-sm" style={{marginBottom:12}} onClick={()=>setEarMode(null)}>← Retour</button>
            <div style={{display:"flex",gap:18,fontSize:13,color:"#7a6f63",marginBottom:10}}>
              <span>Bonnes réponses : <b style={{color:"#2b2320"}}>{state.earStats.ok}</b></span>
              <span>Essais : <b style={{color:"#2b2320"}}>{state.earStats.total}</b></span>
            </div>
            <button className="btn btn-p btn-sm" onClick={()=>playEarSound(earEx)} style={{marginBottom:14}}>▶ Rejouer le son</button>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:8}}>
              {earEx.options.map(opt=>{
                const isThis = earAnswered && earAnswered.opt===opt;
                const bg = isThis ? (earAnswered.correct?"#e3f2e8":"#fbe6e4") : "#fff";
                const bd = isThis ? (earAnswered.correct?"#3f8a5c":"#b0473f") : "#e8ded0";
                return (
                  <button key={opt} disabled={!!earAnswered} onClick={()=>answerEar(opt)}
                    style={{padding:"12px 8px",borderRadius:10,border:`2px solid ${bd}`,background:bg,fontWeight:700,cursor:earAnswered?"default":"pointer"}}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {earAnswered && (
              <div style={{marginTop:10,fontWeight:700,color:earAnswered.correct?"#3f8a5c":"#b0473f"}}>
                {earAnswered.correct ? "Bravo, c'est ça ! (+5 XP)" : `Pas tout à fait — la bonne réponse était : ${earEx.answer}`}
              </div>
            )}
            {earAnswered && (
              <button className="btn btn-p btn-sm" style={{marginTop:12}} onClick={nextEarExercise}>Exercice suivant →</button>
            )}
          </div>
        )}

        {sub==="repertoire" && (
          <div>
            {PIANO_REPERTOIRE.map((cat,ci)=>(
              <div key={ci} style={{borderLeft:"4px solid #c9932a",paddingLeft:14,marginBottom:18}}>
                <h3 style={{margin:"0 0 4px",color:"#432a6b",fontSize:15}}>{cat.cat}</h3>
                <p style={{color:"#7a6f63",fontSize:13,marginBottom:10}}>{cat.sub}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {cat.progIds.map(pid=>{
                    const p = PIANO_PROGRESSIONS.find(x=>x.id===pid);
                    return (
                      <span key={pid} onClick={()=>{
                        if(p.tier<=unlockedTier){ setSub("progressions"); openPractice(pid); }
                        else showToast("Encore verrouillé — continue à gagner de l'XP !");
                      }} style={{background:"#f1ece0",padding:"6px 12px",borderRadius:20,fontSize:12,fontFamily:"monospace",cursor:"pointer"}}>
                        {p.title}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pk-white{fill:#fffdf9;stroke:#cfc3ac;stroke-width:1;}
        .pk-white.pk-active{fill:#c9932a;}
        .pk-black{fill:#2b2320;}
        .pk-black.pk-active{fill:#5b3a8e;}
        .pk-finger{font-size:15px;font-weight:700;fill:#fff;text-anchor:middle;pointer-events:none;}
        .pk-finger-white{fill:#3a2a06;}
      `}</style>
    </div>
  );
}
