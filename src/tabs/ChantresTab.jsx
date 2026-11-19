import React, { useState, useRef, useEffect } from "react";

//  ONGLET CHANTRES — Programme d'entraînement vocal
// ══════════════════════════════════════════════════

export const PROGRAMME_CHANTRES = [
  {
    jour: "Lundi", emoji: "🫁", theme: "Gestion du Souffle",
    description: "Exercices de respiration diaphragmatique pour soutenir la voix",
    videoId: "gCgAuWWx17I",
    videoTitle: "Augmenter son souffle pour chanter",
    exercices: [
      "Posez les mains sur le ventre, inspirez lentement par le nez (4 temps)",
      "Expirez lentement en faisant le son 'S' (8 temps)",
      "Répétez 5 fois en augmentant la durée d'expiration",
      "Exercice de la bougie : soufflez doucement sans l'éteindre pendant 30 secondes"
    ]
  },
  {
    jour: "Mardi", emoji: "🌡️", theme: "Échauffement Vocal Gospel",
    description: "Routine complète d'échauffement avant de chanter",
    videoId: "QKoTrMmwTTQ",
    videoTitle: "Échauffement vocal Gospel — L'indispensable",
    exercices: [
      "Bâillements exagérés pour ouvrir le pharynx (1 minute)",
      "Bourdonnements sur les lèvres fermées (30 secondes)",
      "Vocalises 'Mi-Ma-Mo' en montant par demi-tons",
      "Sirènes vocales du grave à l'aigu et retour"
    ]
  },
  {
    jour: "Mercredi", emoji: "🎵", theme: "Solfège — Les Bases",
    description: "Apprendre à lire les notes et comprendre le rythme",
    videoId: "yTqheO1VUnI",
    videoTitle: "Bases du solfège en 23 minutes",
    exercices: [
      "Chanter la gamme Do-Ré-Mi-Fa-Sol-La-Si-Do",
      "Reconnaître les 7 notes sur le clavier (Do=blanc après groupe de 2 noirs)",
      "Frapper le rythme : noire (1 temps), blanche (2 temps), ronde (4 temps)",
      "Lire et chanter un simple motif rythmique"
    ]
  },
  {
    jour: "Jeudi", emoji: "🫁", theme: "Respiration Avancée",
    description: "Maîtriser la respiration abdominale pour chanter les longues phrases",
    videoId: "1kHgyR9YYok",
    videoTitle: "Respirer par le ventre — Gestion du souffle",
    exercices: [
      "Allongez-vous, posez un livre sur le ventre — il doit monter à l'inspiration",
      "Inspirez en 4 temps, bloquez 2 temps, expirez en 8 temps",
      "Chantez une longue note en gérant le souffle jusqu'au bout",
      "Répétez avec des phrases de chants JCLC que vous connaissez"
    ]
  },
  {
    jour: "Vendredi", emoji: "🎤", theme: "Technique Vocale Gospel",
    description: "Exercices spécifiques pour la voix gospel et louange",
    videoId: "w6D4p7T7C1E",
    videoTitle: "Chanter du Gospel — Échauffement rapide",
    exercices: [
      "Vocalises 'Alleluia' en montant par demi-tons",
      "Travailler le passage du registre grave à l'aigu sans décrocher",
      "Exercice de projection : chantez vers un mur distant",
      "Pratiquer les tenues de notes (tenir 'Aaah' le plus longtemps possible)"
    ]
  },
  {
    jour: "Samedi", emoji: "🎵", theme: "Solfège — Le Rythme",
    description: "Comprendre et pratiquer les valeurs de notes",
    videoId: "KtR6J5-xnoM",
    videoTitle: "Apprendre le solfège — Le rythme",
    exercices: [
      "Taper dans les mains : noire=1 tap, blanche=tenir 2, ronde=tenir 4",
      "Lire un rythme simple écrit au tableau ou dans un cahier",
      "Chanter un psaume en respectant le rythme naturel des mots",
      "Écouter un chant JCLC et identifier le rythme de fond (2/4, 3/4 ou 4/4)"
    ]
  },
  {
    jour: "Dimanche", emoji: "⛪", theme: "Échauffement Avant Culte",
    description: "Routine express 10 min pour préparer la voix avant le culte",
    videoId: "1tZbh1dNpHs",
    videoTitle: "Échauffement vocal rapide — 5 minutes",
    exercices: [
      "Massage léger du visage et du cou (1 minute)",
      "Bourdonnements sur 'Mmm' en montant et descendant (1 minute)",
      "Vocalises 'Né-Né-Né' sur la gamme (2 minutes)",
      "Chanter doucement le premier chant du programme du jour (2 minutes)"
    ]
  }
];

export function ChantresTab() {
  const today = new Date().getDay(); // 0=dim, 1=lun...
  const dayOrder = [1,2,3,4,5,6,0]; // lun->dim
  const todayIdx = dayOrder.indexOf(today);

  const [selected, setSelected] = useState(todayIdx >= 0 ? todayIdx : 0);
  const [checked, setChecked] = useState({});
  const [showEchauffement, setShowEchauffement] = useState(false);

  const prog = PROGRAMME_CHANTRES[selected];
  const key = `chantres_checked_${selected}`;

  // Charger les cases cochées depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setChecked(JSON.parse(saved));
      else setChecked({});
    } catch(e) { setChecked({}); }
  }, [selected]);

  function toggleCheck(i) {
    const newC = {...checked, [i]: !checked[i]};
    setChecked(newC);
    try { localStorage.setItem(key, JSON.stringify(newC)); } catch(e) {}
  }

  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalExo = prog.exercices.length;

  return (
    <div>
      {/* En-tête */}
      <div className="ph">
        <div>
          <div className="pt">🎤 Espace Chantres</div>
          <div className="ps">Programme d'entraînement vocal quotidien — Débutants</div>
        </div>
      </div>

      {/* Bouton échauffement rapide avant culte */}
      <div style={{padding:"0 16px 12px"}}>
        <button
          onClick={()=>setShowEchauffement(!showEchauffement)}
          style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#9D174D,#EC4899)",color:"#fff",border:"none",borderRadius:"12px",fontWeight:"800",fontSize:"15px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}
        >
          ⚡ Échauffement Rapide Avant Culte
        </button>
        {showEchauffement && (
          <div style={{background:"#FDF2F8",border:"2px solid #EC4899",borderRadius:"12px",padding:"16px",marginTop:"10px"}}>
            <div style={{fontWeight:"800",color:"#9D174D",marginBottom:"10px",fontSize:"15px"}}>⛪ Routine 10 min — Avant le culte</div>
            <div style={{marginBottom:"12px",borderRadius:"8px",overflow:"hidden"}}>
              <iframe
                width="100%" height="200"
                src="https://www.youtube.com/embed/1tZbh1dNpHs"
                title="Échauffement rapide avant culte"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{display:"block"}}
              />
            </div>
            {["Massage visage & cou (1 min)","Bourdonnements 'Mmm' montée/descente (1 min)","Vocalises 'Né-Né-Né' sur la gamme (2 min)","Chanter doucement le 1er chant du programme (2 min)","Prière de consécration de la voix"].map((e,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid #FCE7F3"}}>
                <span style={{fontSize:"18px"}}>{"✓"}</span>
                <span style={{fontSize:"13px",color:"#374151"}}>{e}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sélecteur de jour */}
      <div style={{padding:"0 16px 12px"}}>
        <div style={{fontWeight:"700",color:"var(--txt2)",fontSize:"12px",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Programme de la semaine</div>
        <div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"4px"}}>
          {PROGRAMME_CHANTRES.map((p,i)=>(
            <button
              key={i}
              onClick={()=>setSelected(i)}
              style={{
                flexShrink:0, padding:"8px 12px", borderRadius:"20px", border:"2px solid",
                borderColor: selected===i ? "#9D174D" : "var(--bdr)",
                background: selected===i ? "#9D174D" : "var(--sur)",
                color: selected===i ? "#fff" : "var(--txt)",
                fontWeight:"700", fontSize:"11px", cursor:"pointer",
                whiteSpace:"nowrap"
              }}
            >
              {p.emoji} {p.jour}
              {i===todayIdx && <span style={{marginLeft:"4px",fontSize:"9px"}}>● Auj.</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu du jour */}
      <div style={{padding:"0 16px"}}>
        {/* Titre du jour */}
        <div style={{background:"linear-gradient(135deg,#FCE7F3,#FDF4FF)",border:"1px solid #E879F9",borderRadius:"12px",padding:"16px",marginBottom:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
            <span style={{fontSize:"28px"}}>{prog.emoji}</span>
            <div>
              <div style={{fontWeight:"800",fontSize:"17px",color:"#6B21A8"}}>{prog.jour} — {prog.theme}</div>
              <div style={{fontSize:"12px",color:"#9333EA",marginTop:"2px"}}>{prog.description}</div>
            </div>
          </div>
          <div style={{marginTop:"10px",background:"#fff",borderRadius:"8px",padding:"8px 12px",display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"20px"}}>📊</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:"700",fontSize:"13px",color:"#374151"}}>{doneCount}/{totalExo} exercices complétés</div>
              <div style={{background:"#E5E7EB",borderRadius:"4px",height:"6px",marginTop:"4px"}}>
                <div style={{background:"#9D174D",borderRadius:"4px",height:"6px",width:`${(doneCount/totalExo)*100}%`,transition:"width .3s"}}/>
              </div>
            </div>
          </div>
        </div>

        {/* Vidéo YouTube */}
        <div style={{marginBottom:"14px"}}>
          <div style={{fontWeight:"700",color:"var(--txt2)",fontSize:"12px",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>🎬 Vidéo du jour</div>
          <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid var(--bdr)"}}>
            <iframe
              width="100%" height="220"
              src={`https://www.youtube.com/embed/${prog.videoId}`}
              title={prog.videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{display:"block"}}
            />
          </div>
          <div style={{fontSize:"12px",color:"var(--txt2)",marginTop:"6px",textAlign:"center",fontStyle:"italic"}}>{prog.videoTitle}</div>
        </div>

        {/* Exercices à cocher */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontWeight:"700",color:"var(--txt2)",fontSize:"12px",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>📋 Exercices pratiques</div>
          <div style={{background:"var(--sur)",border:"1px solid var(--bdr)",borderRadius:"12px",overflow:"hidden"}}>
            {prog.exercices.map((exo,i)=>(
              <div
                key={i}
                onClick={()=>toggleCheck(i)}
                style={{
                  display:"flex", alignItems:"flex-start", gap:"12px", padding:"14px 16px",
                  borderBottom: i<prog.exercices.length-1 ? "1px solid var(--bdr)" : "none",
                  cursor:"pointer", background: checked[i] ? "#F0FDF4" : "transparent",
                  transition:"background .2s"
                }}
              >
                <div style={{
                  width:"24px", height:"24px", borderRadius:"50%", flexShrink:0,
                  border:"2px solid", marginTop:"1px",
                  borderColor: checked[i] ? "#16A34A" : "var(--bdr)",
                  background: checked[i] ? "#16A34A" : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  {checked[i] && <span style={{color:"#fff",fontSize:"14px",fontWeight:"900"}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"14px",color: checked[i] ? "#6B7280" : "var(--txt)",textDecoration: checked[i] ? "line-through" : "none",lineHeight:"1.4"}}>
                    {exo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message encouragement */}
        {doneCount === totalExo && (
          <div style={{background:"linear-gradient(135deg,#D1FAE5,#A7F3D0)",border:"1px solid #34D399",borderRadius:"12px",padding:"16px",textAlign:"center",marginBottom:"20px"}}>
            <div style={{fontSize:"28px",marginBottom:"6px"}}>🎉</div>
            <div style={{fontWeight:"800",color:"#065F46",fontSize:"16px"}}>Bravo ! Séance complète !</div>
            <div style={{fontSize:"13px",color:"#047857",marginTop:"4px"}}>Ta voix te remerciera dimanche au culte ! 🙏</div>
          </div>
        )}

        {/* Conseil du jour */}
        <div style={{background:"#FFF7ED",border:"1px solid #FCD34D",borderRadius:"12px",padding:"14px",marginBottom:"24px"}}>
          <div style={{fontWeight:"700",color:"#92400E",marginBottom:"6px",fontSize:"13px"}}>💡 Conseil JCLC</div>
          <div style={{fontSize:"13px",color:"#78350F",lineHeight:"1.5"}}>
            {selected===0 && "Le souffle est le moteur de la voix. Une bonne gestion du souffle te permet de chanter de longues phrases sans te fatiguer."}
            {selected===1 && "Ne commence jamais à chanter sans échauffement ! Penser aux sportifs : ils s'échauffent toujours avant un match."}
            {selected===2 && "Le solfège, c'est le 'alphabet' de la musique. Apprendre les notes te permettra de lire n'importe quel chant."}
            {selected===3 && "Respire par le ventre, pas par la poitrine. Pose une main sur le ventre et une sur la poitrine — seule la main du ventre doit bouger."}
            {selected===4 && "La voix gospel demande ouverture et projection. Chante vers l'avant, pas vers le bas !"}
            {selected===5 && "Le rythme c'est le cœur de la musique. Essaie de frapper le tempo avec le pied pendant que tu chantes."}
            {selected===6 && "Avant le culte, prends soin de ta voix : évite l'eau froide, parle doucement et consacre ta voix à Dieu dans la prière."}
          </div>
        </div>
      </div>
    </div>
  );
}
