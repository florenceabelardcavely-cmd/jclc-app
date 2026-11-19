
// ══════════════════════════════════════════════════
//  CONSTANTES — v2
// ══════════════════════════════════════════════════

export const CHURCHES = {
  creil:  { id:"creil",  name:"Creil",  fullName:"Église de Creil",  color:"#4F46E5", bg:"#EEF2FF",
            serviceDays:[0,3], repDays:[], dayLabel:"Dim + Mer",
            // Avant le 26/09/2026, le culte de Creil avait lieu le samedi (historique conservé)
            legacy:{ until:"2026-09-26", serviceDays:[6,3] } },
  lognes: { id:"lognes", name:"Lognes", fullName:"Église de Lognes", color:"#D97706", bg:"#FFFBEB",
            serviceDays:[0,2], repDays:[], dayLabel:"Dim + Mar" },
  toulouse: { id:"toulouse", name:"Toulouse", fullName:"Église de Toulouse", color:"#059669", bg:"#ECFDF5",
            serviceDays:[6], repDays:[], dayLabel:"Sam" },
};

export const ROLES = [
  "Chantre (voix)","Bassiste","Pianiste","Batteur",
  "Guitare sèche","Guitare électrique","Congas",
  "Directeur Musical (DM)","Autre"
];

// ── SERVICE TECHNIQUE ──
// Assemblées concernées et événements où la technique est de service
export const TECH_CHURCHES = ["creil","lognes"];

export const TECH_EVENTS = {
  creil:  [ {day:0,type:"culte",  label:"Culte du dimanche",  icon:"🙏",micro:true},
            {day:3,type:"atelier",label:"Atelier biblique",    icon:"📖"},
            {day:4,type:"repet",  label:"Répétition",          icon:"🎼"},
            {day:5,type:"priere", label:"Prière de feu",       icon:"🔥"} ],
  lognes: [ {day:0,type:"culte",  label:"Culte du dimanche",  icon:"🙏",micro:true},
            {day:2,type:"atelier",label:"Atelier biblique",    icon:"📖"},
            {day:4,type:"repet",  label:"Répétition",          icon:"🎼"},
            {day:5,type:"priere", label:"Prière de feu",       icon:"🔥"} ],
};

export const TECH_ROLES = ["Console / Régie","Passage de micro"];

export const TECH_REGIE = "Console / Régie";
 // poste à pourvoir à chaque date
export const RESP_TECH  = "Responsable technique";

export const TECH_EV_COLORS = { culte:"#4F46E5", atelier:"#0891B2", repet:"#D97706", priere:"#DC2626" };

// ── GROUPE COMMUNICATION / AUDIOVISUEL ──
export const COM_CHURCHES = ["creil"];

export const COM_EVENTS = {
  creil: [ {day:0,type:"culte",  label:"Culte du dimanche", icon:"🙏"},
           {day:3,type:"atelier",label:"Atelier biblique",  icon:"📖"} ],
};

export const COM_ROLES    = ["Projection","Photo","Vidéo / Caméra","Réseaux sociaux / Live","Annonces"];

export const COM_REQUIRED = "Projection";
 // poste à pourvoir à chaque date
export const RESP_COM     = "Responsable communication";

// ── Configuration commune des équipes de service (technique, communication…) ──
// Les données Supabase utilisent l'id de l'équipe comme préfixe : "tech_…", "com_…"
// et l'état local les clés <id>Members, <id>Plans, <id>Avail, <id>DispoSent, <id>Validated.
export const TEAMS = {
  tech:{ id:"tech", churches:TECH_CHURCHES, events:TECH_EVENTS, roles:TECH_ROLES, required:TECH_REGIE, resp:RESP_TECH, evColors:TECH_EV_COLORS,
    icon:"🎛️", label:"Technique", service:"Service technique", ofTeam:"de la technique", teamName:"Équipe technique", planTitle:"Planning technique",
    respShort:"Resp. technique", respTitle:"la responsable technique", respDesc:"Planifie les équipes techniques et consulte le planning de la louange",
    accent:"#0891B2", chipBg:"#CFFAFE", chipFg:"#155E75", pill:"pill-tech",
    login:{bg:"rgba(8,145,178,.18)",badgeBg:"rgba(8,145,178,.25)",border:"rgba(103,232,249,.45)",fg:"#67E8F9",label:"Connexion Technique",question:"Vous êtes de la technique ?"},
    postIcons:{"Console / Régie":"🎚️","Passage de micro":"🎤"}, postShort:{"Console / Régie":"Régie","Passage de micro":"Micro"},
    postOnlyIf:{"Passage de micro":"micro"}, postHint:{"Passage de micro":"🎤 passage de micro"},
    postChip:{"Passage de micro":{bg:"#FEF3C7",fg:"#92400E"}} },
  com:{ id:"com", churches:COM_CHURCHES, events:COM_EVENTS, roles:COM_ROLES, required:COM_REQUIRED, resp:RESP_COM, evColors:{culte:"#DB2777",atelier:"#7C3AED"},
    icon:"📸", label:"Communication", service:"Communication / Audiovisuel", ofTeam:"de la communication", teamName:"Équipe communication", planTitle:"Planning communication",
    respShort:"Resp. communication", respTitle:"la responsable communication", respDesc:"Planifie l'équipe communication / audiovisuel et consulte le planning de la louange",
    accent:"#DB2777", chipBg:"#FCE7F3", chipFg:"#9D174D", pill:"pill-com",
    login:{bg:"rgba(219,39,119,.18)",badgeBg:"rgba(219,39,119,.25)",border:"rgba(249,168,212,.45)",fg:"#F9A8D4",label:"Connexion Communication",question:"Vous êtes de la communication ?"},
    postIcons:{"Projection":"🖥️","Photo":"📷","Vidéo / Caméra":"🎥","Réseaux sociaux / Live":"📱","Annonces":"📢"}, postShort:{"Vidéo / Caméra":"Vidéo","Réseaux sociaux / Live":"Réseaux"},
    postOnlyIf:{}, postHint:{}, postChip:{} },
};

export const TEAM_IDS = Object.keys(TEAMS);

export const ALL_TEAM_ROLES = TEAM_IDS.flatMap(id=>[...TEAMS[id].roles,TEAMS[id].resp]);

export const CATEGORIES_CHANT = ["Adoration","Louange","Sainte-Cène","Dîme & Offrandes"];

export const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export const DAYS   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

export const VERSETS = [
  { ref:"Psaume 150:6",   text:"Que tout ce qui respire loue l'Éternel ! Louez l'Éternel !" },
  { ref:"Psaume 100:2",   text:"Servez l'Éternel avec joie, venez en sa présence avec des chants d'allégresse." },
  { ref:"Colossiens 3:16",text:"Chantez à Dieu de tout votre cœur des psaumes, des hymnes et des cantiques spirituels." },
  { ref:"Éphésiens 5:19", text:"Chantez et célébrez le Seigneur de tout votre cœur." },
  { ref:"Psaume 96:1",    text:"Chantez à l'Éternel un cantique nouveau ! Chantez à l'Éternel, habitants de toute la terre." },
  { ref:"Psaume 33:3",    text:"Chantez-lui un cantique nouveau ! Jouez de la harpe avec art, en poussant des cris de joie." },
  { ref:"Psaume 95:1",    text:"Venez, chantons joyeusement à l'Éternel ! Acclamons le rocher de notre salut." },
  { ref:"Ésaïe 12:5",    text:"Chantez à l'Éternel, car il a fait des choses excellentes !" },
  { ref:"Psaume 147:1",  text:"Louez l'Éternel ! Car il est bon de chanter à notre Dieu ; car la louange est douce et convenable." },
  { ref:"Psaume 63:4",   text:"Ainsi je te bénirai toute ma vie, j'élèverai mes mains en ton nom." },
  { ref:"Apocalypse 5:12",text:"L'agneau qui a été immolé est digne de recevoir la puissance, la richesse, la sagesse, la force, l'honneur, la gloire et la louange." },
  { ref:"Psaume 22:4",   text:"C'est en toi que se confiaient nos pères ; ils se confiaient en toi, et tu les délivrais." },
];
