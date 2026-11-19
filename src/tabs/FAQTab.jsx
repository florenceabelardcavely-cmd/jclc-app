import React, { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════
//  FAQ TAB (nouveau)
// ══════════════════════════════════════════════════
export const FAQ_ITEMS=[
  {q:"Comment me connecter à l'application ?",a:"Sélectionnez votre prénom dans la liste de recherche, puis entrez votre code PIN à 4 chiffres fourni par l'administrateur. Les administrateurs utilisent un mot de passe. La session reste active pendant 8 heures puis vous devrez vous reconnecter."},
  {q:"Comment indiquer mes disponibilités ?",a:"Allez dans l'onglet 'Disponibilités', puis cochez les dates de service où vous êtes disponible. Vos disponibilités aident l'administrateur à construire le planning mensuel."},
  {q:"Comment voir mon planning ?",a:"Allez dans l'onglet 'Mon planning'. Votre planning n'est visible que lorsque l'administrateur l'a validé. Vous recevrez une notification dès qu'il est disponible."},
  {q:"Comment fonctionne la transposition des accords ?",a:"Dans l'onglet Musicien ou Répétition, cliquez sur les boutons de notes (Do, Ré, Mi...) à côté de chaque chant pour changer la tonalité. La transposition se fait instantanément et est mémorisée pour votre prochaine connexion."},
  {q:"Qu'est-ce que l'onglet Musicien ?",a:"L'onglet Musicien affiche les chants du prochain programme de culte avec accords transposables en direct. Si vous servez dans deux assemblées (Creil et Lognes), vous pouvez basculer entre les deux en haut de l'onglet."},
  {q:"Qu'est-ce que l'onglet Répétition ?",a:"L'onglet Répétition permet de créer des listes de chants pour les répétitions, avec métronome intégré, tap tempo, liens audio et mode présentation. Chaque liste est associée à une assemblée (Creil ou Lognes)."},
  {q:"Qu'est-ce que l'onglet Chantres ?",a:"L'onglet Chantres propose un programme d'entraînement vocal hebdomadaire pour les débutants : exercices de souffle, échauffement gospel, solfège et technique vocale, avec des vidéos YouTube intégrées et des cases à cocher pour suivre votre progression. Un échauffement rapide avant culte est également disponible."},
  {q:"Comment ajouter un chant en PDF ?",a:"Allez dans la bibliothèque, cliquez sur '📥 Importer', puis choisissez l'onglet PDF. Sélectionnez votre fichier PDF et l'IA extraira automatiquement les paroles et accords."},
  {q:"Comment créer un programme de culte ?",a:"Allez dans l'onglet 'Programmes', sélectionnez l'assemblée (Creil ou Lognes) si vous gérez les deux, puis cliquez sur '+ Créer'. Vous pouvez ajouter des chants, préciser la tonalité et la catégorie pour chaque chant."},
  {q:"Comment partager le planning sous forme de flyer ?",a:"Dans l'onglet Programmes, cliquez sur '🖼️ Flyer' pour générer et télécharger le planning en image partageable sur WhatsApp. Les couleurs sont différentes selon l'assemblée : rose/magenta pour Lognes, violet/indigo pour Creil."},
  {q:"Comment exporter un programme pour ProPresenter ?",a:"Dans l'onglet Programmes, cliquez sur l'icône d'export ProPresenter. Un fichier .txt sera généré avec les paroles uniquement, prêt à être importé dans ProPresenter pour la projection."},
  {q:"Je ne vois pas mon nom dans la liste de connexion. Que faire ?",a:"Contactez votre administrateur pour qu'il vous ajoute à la liste des membres. Une notification vous sera envoyée avec votre code PIN dès votre ajout."},
  {q:"Comment connaître mon code PIN ?",a:"Votre code PIN vous a été communiqué lors de votre ajout par l'administrateur. Si vous l'avez oublié, contactez l'administrateur qui peut le voir dans l'onglet 'Permissions'."},
  {q:"Pourquoi je ne vois pas les dates du calendrier ?",a:"Le calendrier affiche les dates en fonction de votre église. Creil : dimanches et mercredis. Lognes : dimanches et mardis."},
  {q:"Comment est calculée la statistique de présence ?",a:"L'administrateur peut consulter dans l'onglet 'Statistiques' le nombre de services assurés par chaque membre, basé sur les assignations dans le planning."},
  {q:"L'application fonctionne-t-elle sans internet ?",a:"Pas encore en mode hors-ligne complet, mais cette fonctionnalité est prévue. Pour l'instant, une connexion internet est nécessaire pour charger les données. Nous recommandons d'ouvrir l'app avant d'arriver à l'église pour que tout soit chargé."},
  {q:"Comment installer l'application sur mon téléphone ?",a:"Sur iPhone : ouvrez Safari, appuyez sur le bouton Partager puis 'Sur l'écran d'accueil'. Sur Android : ouvrez Chrome, appuyez sur les 3 points puis 'Ajouter à l'écran d'accueil'. L'icône JCLC apparaîtra comme une vraie application."},
  {q:"Pourquoi ma session s'est-elle terminée ?",a:"Pour des raisons de sécurité, votre session expire automatiquement après 8 heures d'inactivité. Reconnectez-vous avec votre code PIN. Ceci est particulièrement utile sur les tablettes partagées."},
];

export function FAQTab({isAdmin}){
  const [open,setOpen]=useState(null);
  const items=isAdmin?FAQ_ITEMS:[...FAQ_ITEMS.filter(f=>!f.q.includes("ajouter")||!f.q.includes("admin"))];
  return(
    <div>
      <div className="ph"><div><div className="pt">❓ Questions fréquentes</div><div className="ps">Aide et guide d'utilisation de l'application</div></div></div>
      <div className="card">
        {FAQ_ITEMS.map((item,i)=>(
          <div key={i} className="fa-item" onClick={()=>setOpen(open===i?null:i)}>
            <div className="fa-q">{item.q}<span>{open===i?"▲":"▼"}</span></div>
            {open===i&&<div className="fa-a">{item.a}</div>}
          </div>
        ))}
      </div>
      <div className="ib ind">
        💡 Vous ne trouvez pas la réponse à votre question ? Contactez votre administrateur ou le Directeur Musical.
      </div>
    </div>
  );
}
