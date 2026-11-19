# Organisation du code de l'appli JCLC

L'ancien `App.jsx` géant (≈ 6 800 lignes) est découpé en petits fichiers.

| Dossier / fichier | Contenu |
| --- | --- |
| `App.jsx` | Écran principal : connexion, menus, chargement Supabase, actions |
| `config.js` | Assemblées, rôles, équipes (technique, communication), mois, versets |
| `state.js` | État de départ de l'appli |
| `styles.js` | Tout le CSS |
| `lib/supabase.js` | Accès à la base Supabase |
| `lib/music.js` | Tonalités, transposition, format ChordPro |
| `lib/helpers.js` | Dates, membres, équipes |
| `lib/migrations.js` | Opérations uniques lancées à la connexion admin |
| `data/` | Chants intégrés, livret de juillet 2026, ancien planning Lognes |
| `tabs/` | Un fichier par onglet (Accueil, Musicien, Programmes, Piano…) |
| `teams/` | Écrans communs aux équipes technique et communication |
| `components/` | Fenêtres partagées (fiches chant, programmes, flyer, membres…) |
| `assets/logoB64.js` | Logo JCLC |
