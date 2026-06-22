# 🎵 Groupe de Louange — JCLC
### Application de gestion — Jésus-Christ Le Chemin, Creil & Lognes

---

## 📱 Compatibilité
- ✅ Téléphone (iOS & Android) — installation possible comme application
- ✅ Tablette
- ✅ Ordinateur (Windows, Mac, Linux)

---

## 🚀 Mise en ligne — 3 options

### Option 1 — Vercel (recommandée, gratuite)

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Installez Vercel CLI :
   ```bash
   npm install -g vercel
   ```
3. Dans le dossier du projet :
   ```bash
   npm install
   vercel
   ```
4. Suivez les instructions → votre app est en ligne en 2 minutes !
5. Vous obtiendrez une URL du type : `https://jclc-louange.vercel.app`

### Option 2 — Netlify (gratuite)

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Dans le dossier du projet :
   ```bash
   npm install
   npm run build
   ```
3. Glissez-déposez le dossier `dist/` sur [app.netlify.com/drop](https://app.netlify.com/drop)
4. C'est en ligne instantanément !

### Option 3 — GitHub Pages (gratuite)

1. Créez un repository GitHub
2. Poussez le code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE-NOM/jclc-louange.git
   git push -u origin main
   ```
3. Dans les Settings du repo → Pages → Source : GitHub Actions
4. L'app se déploie automatiquement à chaque modification

---

## 💻 Développement local

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
# → Ouvre http://localhost:5173

# Construire pour la production
npm run build

# Prévisualiser la version de production
npm run preview
```

---

## 📲 Installation comme application (PWA)

Une fois l'app en ligne, vos membres peuvent l'installer sur leur téléphone :

### Sur iPhone/iPad (Safari) :
1. Ouvrir l'URL dans Safari
2. Appuyer sur le bouton Partager ↑
3. "Sur l'écran d'accueil"
4. L'app s'installe avec le logo JCLC !

### Sur Android (Chrome) :
1. Ouvrir l'URL dans Chrome
2. Appuyer sur les 3 points ⋮
3. "Ajouter à l'écran d'accueil"

---

## 🔐 Identifiants par défaut

| Compte | Identifiant | Mot de passe |
|--------|------------|--------------|
| Administrateur | admin | `Admin2024!` |
| Pasteur Alexandre | pasteur | `Pasteur2024!` |
| Membres | (nom dans la liste) | Code PIN 4 chiffres (défaut: `0000`) |

⚠️ **Changez les mots de passe admin après la première connexion !**

---

## 📁 Structure du projet

```
jclc-louange/
├── src/
│   ├── App.jsx      # Application principale
│   ├── logo.js      # Logo JCLC (base64)
│   └── main.jsx     # Point d'entrée React
├── public/
│   └── manifest.json  # PWA manifest
├── index.html         # Page HTML principale
├── vite.config.js     # Configuration Vite
├── netlify.toml       # Config Netlify
├── vercel.json        # Config Vercel
└── package.json       # Dépendances
```

---

## 🛠️ Fonctionnalités

- 👥 **Gestion des membres** par église (Creil & Lognes)
- 🔐 **Connexion sécurisée** : mot de passe admin, code PIN membres
- 📅 **Disponibilités** : samedis (Creil) / dimanches (Lognes)
- 📋 **Planification** avec vue calendrier mensuelle
- ⭐ **Planning personnalisé** par membre
- 🔔 **Notifications** Email + SMS
- 🎵 **Bibliothèque de chants** avec transposition automatique
- 📥 **Import IA** : photo ou texte → chant structuré
- 📄 **Programmes** imprimables avec accords en rouge
- 📬 **Rappel automatique** le 1er du mois
- ✨ **Verset de la semaine** (12 versets en rotation)
- 🔑 **Permissions bibliothèque** configurables par membre
- 📱 **PWA** : installable sur téléphone comme une app native

---

## 💬 Support

Pour toute question, contactez l'administrateur de l'assemblée.
