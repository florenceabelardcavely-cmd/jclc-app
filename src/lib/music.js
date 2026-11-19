
// Orthographe des tonalités : bémols (Réb, Mib, Lab, Sib) sauf Fa#.
// Mineurs : Do#m, Fa#m, Sol#m restent en dièse ; Mibm et Sibm en bémol.
export const NOTES  = ["Do","Réb","Ré","Mib","Mi","Fa","Fa#","Sol","Lab","La","Sib","Si"];

export const NOTES_M= ["Dom","Do#m","Rém","Mibm","Mim","Fam","Fa#m","Solm","Sol#m","Lam","Sibm","Sim"];

// Réécrit les dièses d'une ligne d'accords (ou d'une tonalité) selon cette orthographe.
export const RESPELL_SHARP={"Do":"Réb","DO":"RÉB","Ré":"Mib","Re":"Mib","RÉ":"MIB","RE":"MIB","Sol":"Lab","SOL":"LAB","La":"Sib","LA":"SIB","C":"Db","D":"Eb","G":"Ab","A":"Bb"};

export const KEEP_SHARP_MINOR={"Do":1,"DO":1,"Sol":1,"SOL":1,"C":1,"G":1};

export const RESPELL_FLAT_MINOR={"Réb":"Do#","RÉB":"DO#","Lab":"Sol#","LAB":"SOL#","Db":"C#","Ab":"G#"};

export const RESPELL_FLAT={"Solb":"Fa#","SOLB":"FA#","Gb":"F#"};

export function respellLine(line){
  if(!line||typeof line!=="string")return line;
  let out=line.replace(/(^|[^A-Za-zÀ-ÿ#])(DO|RÉ|RE|SOL|LA|Do|Ré|Re|Sol|La|C|D|G|A)#(MAJ|maj|Maj|M|m)?/g,(m,pre,root,suf)=>{
    const minor=suf==="m"||suf==="M";
    if(minor&&KEEP_SHARP_MINOR[root])return m;
    return pre+RESPELL_SHARP[root]+(suf||"");
  });
  out=out.replace(/(^|[^A-Za-zÀ-ÿ#])(RÉB|LAB|Réb|Lab|Db|Ab)(m|M)(?!aj|AJ)/g,(m,pre,root,suf)=>pre+RESPELL_FLAT_MINOR[root]+suf);
  out=out.replace(/(^|[^A-Za-zÀ-ÿ#])(SOLB|Solb|Gb)(?![a-z])/g,(m,pre,root)=>pre+RESPELL_FLAT[root]);
  return out;
}

export function prefKey(k){return k?respellLine(k):k;}

export function normalizeSong(s){
  if(!s||typeof s!=="object")return s;
  return{...s,key:prefKey(s.key),sections:Array.isArray(s.sections)?s.sections.map(sec=>({...sec,lines:Array.isArray(sec.lines)?sec.lines.map(l=>l&&l.k==="chord"?{...l,t:respellLine(l.t)}:l):sec.lines})):s.sections};
}

export function normalizeItems(items){
  if(!Array.isArray(items))return items;
  return items.map(it=>it&&typeof it==="object"?{...it,...(it.key?{key:prefKey(it.key)}:{}),...(it.dispKey?{dispKey:prefKey(it.dispKey)}:{})}:it);
}

export const NOTE_MAP={"Réb":"Do#","Mib":"Ré#","Solb":"Fa#","Lab":"Sol#","Sib":"La#"};

// ══ Utilitaires ══
// ══ ChordPro Engine ══
export const FR_NOTES=["Do","Réb","Ré","Mib","Mi","Fa","Fa#","Sol","Lab","La","Sib","Si"];

export const FR_MIN_ROOTS=["Do","Do#","Ré","Mib","Mi","Fa","Fa#","Sol","Sol#","La","Sib","Si"];

export const FR_MINOR={"Lam":"La","Rém":"Ré","Rem":"Ré","Mim":"Mi","Fam":"Fa","Fa#m":"Fa#","Solm":"Sol","Dom":"Do","Sim":"Si","Do#m":"Réb"};

export const EN_NOTES=["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

export const EN_MIN_ROOTS=["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"];

export const FR_ALT={"Do#":"Réb","Ré#":"Mib","Re#":"Mib","Reb":"Réb","Sol#":"Lab","La#":"Sib","Solb":"Fa#","Dob":"Si","Re":"Ré","Mi#":"Fa","Si#":"Do","Fab":"Mi"};

export const EN_ALT={"C#":"Db","D#":"Eb","G#":"Ab","A#":"Bb","Gb":"F#","Cb":"B","E#":"F","B#":"C","Fb":"E"};

export function noteToIdx(note){
  // Normaliser Re->Ré avant tout traitement
  note=note.replace(/^Re(?=#|b|$)/,"Ré").replace(/^re(?=#|b|$)/,"Ré");
  // Vérifier FR_MINOR pour les accords mineurs
  if(FR_MINOR[note]){const idx=FR_NOTES.indexOf(FR_MINOR[note]);if(idx>=0)return{idx,lang:"fr"};}
  let n=note.replace(/m$|7$|maj7$|sus[24]?$|add[0-9]+$|dim$|aug$/g,"");
  // Normaliser la racine Re->Ré après suppression suffixe
  n=n.replace(/^Re$/,"Ré").replace(/^re$/,"Ré");
  let i=FR_NOTES.indexOf(n);
  if(i>=0)return{idx:i,lang:"fr"};
  if(FR_ALT[n]){i=FR_NOTES.indexOf(FR_ALT[n]);if(i>=0)return{idx:i,lang:"fr"};}
  i=EN_NOTES.indexOf(n);
  if(i>=0)return{idx:i,lang:"en"};
  if(EN_ALT[n]){i=EN_NOTES.indexOf(EN_ALT[n]);if(i>=0)return{idx:i,lang:"en"};}
  return null;
}

export function transposeChord(chord,st,targetLang){
  const frPat=/^(Do#?|Ré[b#]?|Re[b#]?|Mib?|Fa#?|Solb?#?|Lab?#?|Sib?|Dom?)(m(?:aj)?7?|7|sus[24]?|add[0-9]+|dim|aug|m)?/;
  const enPat=/^([A-G][b#]?)(m(?:aj)?7?|7|sus[24]?|add[0-9]+|dim|aug|m)?/;
  let root="",suffix="",lang="fr",rest="";
  let mm=chord.match(frPat);
  if(mm&&mm[1]){root=mm[1];suffix=mm[2]||"";rest=chord.slice(mm[0].length);lang="fr";}
  else{mm=chord.match(enPat);if(mm&&mm[1]){root=mm[1];suffix=mm[2]||"";rest=chord.slice(mm[0].length);lang="en";}}
  if(!root)return chord;
  // Normaliser Re->Ré sur la racine extraite
  if(root==="Re")root="Ré";
  if(root==="Re#")root="Ré#";
  if(root==="Reb")root="Réb";
  let bass="";
  if(rest.startsWith("/")){
    const bm=rest.slice(1).match(frPat)||rest.slice(1).match(enPat);
    if(bm&&bm[1])bass="/"+transposeChord(rest.slice(1),st,targetLang||lang);
    else bass=rest;
    rest="";
  }
  const r=noteToIdx(root);
  if(!r)return chord;
  const newIdx=(r.idx+12+st)%12;
  const outLang=targetLang||lang;
  const isMinor=/^m(?!aj)/.test(suffix);
  const newRoot=(outLang==="en"?(isMinor?EN_MIN_ROOTS:EN_NOTES):(isMinor?FR_MIN_ROOTS:FR_NOTES))[newIdx];
  return newRoot+suffix+bass+rest;
}

export function transposeLine(line,st,lang){
  if(st===0&&!lang)return respellLine(line);
  const pre=line.replace(/\bRe(?=[mb#\s]|$)/g,"Ré").replace(/\bre(?=[mb#\s]|$)/g,"Ré");
  const normalized=pre.replace(/\b(DO|RE|RÉ|MI|FA|SOL|LA|SI)(B|#)?(M(?:AJ)?7?|7|SUS[24]?|DIM|AUG|M)?\b/g,m=>{
    const map={"DO":"Do","RE":"Ré","RÉ":"Ré","MI":"Mi","FA":"Fa","SOL":"Sol","LA":"La","SI":"Si"};
    const base=m.replace(/(B|#)?(M(?:AJ)?7?|7|SUS[24]?|DIM|AUG|M)?$/i,"").toUpperCase();
    const suffix=m.slice(base.length).toLowerCase();
    return (map[base]||m)+suffix;
  });
  return normalized.replace(/[A-Za-zÀ-ÿ][A-Za-z0-9#bÀ-ɏ]*(?:\/[A-Za-zÀ-ÿ][A-Za-z0-9#bÀ-ɏ]*)*/g,c=>{
    const r=noteToIdx(c.split("/")[0]);
    return r?transposeChord(c,st,lang):c;
  });
}

export function parseChordPro(text){
  const lines=text.split("\n");
  let title="",key="",author="",tempo="",categorie="";
  const sections=[];
  let curSection=null;
  for(let raw of lines){
    const line=raw.trimEnd();
    const dir=line.match(/^\{(\w+):\s*(.*)\}$/);
    if(dir){
      const[,k,v]=dir;
      const kl=k.toLowerCase();
      if(kl==="title"||kl==="t")title=v;
      else if(kl==="key")key=v;
      else if(kl==="artist"||kl==="author")author=v;
      else if(kl==="tempo")tempo=v;
      else if(kl==="categorie"||kl==="category")categorie=v;
      else if(kl==="start_of_verse"||kl==="sov"){curSection={label:v||"Couplet",lines:[]};sections.push(curSection);}
      else if(kl==="start_of_chorus"||kl==="soc"){curSection={label:v||"Refrain",lines:[]};sections.push(curSection);}
      else if(kl==="start_of_bridge"||kl==="sob"){curSection={label:v||"Pont",lines:[]};sections.push(curSection);}
      else if(/^end_of/.test(kl)){curSection=null;}
      continue;
    }
    if(!line.trim()){if(curSection&&curSection.lines.length>0)curSection=null;continue;}
    if(line.includes("[")){
      if(!curSection){curSection={label:sections.length===0?"Intro":"Section "+(sections.length+1),lines:[]};sections.push(curSection);}
      let cl="",ll="";
      const parts=line.split(/(\[[^\]]+\])/);
      for(const p of parts){
        const cm=p.match(/^\[([^\]]+)\]$/);
        if(cm){while(cl.length<ll.length)cl+=" ";cl+=cm[1]+" ";}
        else{ll+=p;while(ll.length<cl.length)ll+=" ";}
      }
      if(cl.trim())curSection.lines.push({k:"chord",t:cl.trimEnd()});
      if(ll.trim()||cl.trim())curSection.lines.push({k:"lyric",t:ll.trimEnd()});
    }else{
      if(!curSection){curSection={label:sections.length===0?"Couplet 1":"Section "+(sections.length+1),lines:[]};sections.push(curSection);}
      curSection.lines.push({k:"lyric",t:line});
    }
  }
  return{title,key,author,tempo,categorie,sections};
}

export function toChordPro(song){
  let out="";
  out+=`{title: ${song.title}}\n`;
  if(song.key)out+=`{key: ${song.key}}\n`;
  if(song.author)out+=`{artist: ${song.author}}\n`;
  if(song.tempo)out+=`{tempo: ${song.tempo}}\n`;
  if(song.categorie)out+=`{categorie: ${song.categorie}}\n`;
  out+="\n";
  for(const sec of(song.sections||[])){
    const lbl=(sec.label||"").toLowerCase();
    const isChorus=lbl.includes("refrain")||lbl.includes("chorus");
    const isBridge=lbl.includes("pont")||lbl.includes("bridge");
    if(isChorus)out+=`{start_of_chorus: ${sec.label}}\n`;
    else if(isBridge)out+=`{start_of_bridge: ${sec.label}}\n`;
    else out+=`{start_of_verse: ${sec.label}}\n`;
    const lines=sec.lines||[];
    for(let i=0;i<lines.length;i++){
      const l=lines[i];
      if(l.k==="chord"){
        const next=lines[i+1];
        if(next&&next.k==="lyric"){
          const chords=[];const re=/(\S+)/g;let m;
          while((m=re.exec(l.t))!==null)chords.push({chord:m[1],pos:m.index});
          let result="";let lastPos=0;
          for(const{chord,pos}of chords){const lp=Math.min(pos,next.t.length);result+=next.t.slice(lastPos,lp)+`[${chord}]`;lastPos=lp;}
          result+=next.t.slice(lastPos);
          out+=(result||next.t)+"\n";i++;
        }else{out+=l.t+"\n";}
      }else if(l.k==="lyric"){out+=l.t+"\n";}
    }
    if(isChorus)out+="{end_of_chorus}\n\n";
    else if(isBridge)out+="{end_of_bridge}\n\n";
    else out+="{end_of_verse}\n\n";
  }
  return out;
}

export function semit(from,to){
  const normalize=n=>(n||"").replace(/m$/,"").replace(/^Re(?=#|b|$|m)/,"Ré").replace(/^Re$/,"Ré");
  const fr=normalize(from);
  const to2=normalize(to);
  const a=FR_NOTES.indexOf(fr)!==-1?FR_NOTES.indexOf(fr):(FR_ALT[fr]?FR_NOTES.indexOf(FR_ALT[fr]):EN_NOTES.indexOf(fr));
  const b=FR_NOTES.indexOf(to2)!==-1?FR_NOTES.indexOf(to2):(FR_ALT[to2]?FR_NOTES.indexOf(FR_ALT[to2]):EN_NOTES.indexOf(to2));
  if(a===-1||b===-1)return 0;
  const diff=(b-a+12)%12;
  return diff>6?diff-12:diff;
}
