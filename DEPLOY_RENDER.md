# 🚀 Guide de Déploiement sur Render

## Prérequis

1. Un compte sur [Render.com](https://render.com)
2. Un compte GitHub, GitLab ou Bitbucket
3. Votre projet poussé sur un repository Git

---

## 📋 Étapes de Déploiement

### Étape 1 : Préparer le Repository

Assurez-vous que votre projet contient ces fichiers :
```
├── server.js          ✅ Serveur Express pour la production
├── render.yaml        ✅ Configuration Render
├── package.json       ✅ Dépendances
├── public/
│   └── intro.mp4      ✅ Votre vidéo d'introduction (optionnel)
└── src/               ✅ Code source React
```

### Étape 2 : Pousser sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - EduAnalytics SaaS"

# Ajouter votre repository distant
git remote add origin https://github.com/VOTRE_USERNAME/eduanalytics.git

# Pousser le code
git push -u origin main
```

### Étape 3 : Créer le Service sur Render

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub
4. Sélectionnez votre repository `eduanalytics`

### Étape 4 : Configurer le Service

Remplissez les champs suivants :

| Champ | Valeur |
|-------|--------|
| **Name** | `eduanalytics-saas` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node server.js` |
| **Plan** | `Free` |

### Étape 5 : Variables d'Environnement

Ajoutez ces variables dans la section "Environment" :

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `18.17.0` |

### Étape 6 : Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendez que le build se termine (2-5 minutes)
3. Votre app sera disponible sur `https://eduanalytics-saas.onrender.com`

---

## 🎬 Ajouter la Vidéo d'Introduction

### Option A : Inclure dans le Repository

```bash
# Copier votre vidéo dans public/
cp /chemin/vers/votre/video.mp4 public/intro.mp4

# Commiter et pousser
git add public/intro.mp4
git commit -m "Add intro video"
git push
```

⚠️ **Note** : GitHub limite les fichiers à 100 MB. Si votre vidéo est plus grande :
- Compressez-la (recommandé < 15 MB)
- Ou utilisez Git LFS
- Ou hébergez-la sur un CDN externe

### Option B : Utiliser un CDN externe

Modifiez `src/App.tsx` et remplacez :
```tsx
src="/intro.mp4"
```
par :
```tsx
src="https://votre-cdn.com/intro.mp4"
```

Services CDN recommandés :
- [Cloudinary](https://cloudinary.com) (gratuit jusqu'à 25 GB)
- [Bunny.net](https://bunny.net) (très économique)
- [AWS S3 + CloudFront](https://aws.amazon.com/s3/)

---

## 🔄 Déploiement Automatique

Render redéploie automatiquement à chaque push sur la branche `main` :

```bash
# Faire des modifications
git add .
git commit -m "Update feature"
git push origin main
# → Render redéploie automatiquement !
```

---

## 🛠️ Commandes Utiles

### Tester en local avant déploiement

```bash
# Build de production
npm run build

# Tester avec le serveur Express
node server.js

# Ouvrir http://localhost:3000
```

### Voir les logs sur Render

1. Dashboard Render → Votre service
2. Onglet "Logs"
3. Consultez les erreurs en temps réel

---

## 🐛 Dépannage

### Le build échoue

```bash
# Vérifiez que le build fonctionne en local
npm install
npm run build
```

### La vidéo ne se charge pas

1. Vérifiez que `intro.mp4` est dans le dossier `public/`
2. Vérifiez la taille (< 100 MB pour GitHub)
3. Testez l'URL directe : `https://votre-app.onrender.com/intro.mp4`

### Page blanche après déploiement

1. Vérifiez les logs dans Render Dashboard
2. Assurez-vous que `server.js` existe
3. Vérifiez que le build génère le dossier `dist/`

### Le site est lent au premier chargement

C'est normal avec le plan gratuit de Render. Le serveur "dort" après 15 min d'inactivité et met ~30 secondes à se réveiller.

Solutions :
- Upgrader vers un plan payant ($7/mois)
- Utiliser [UptimeRobot](https://uptimerobot.com) pour garder le serveur actif

---

## 📊 Performances Recommandées

Pour une expérience optimale :

| Élément | Recommandation |
|---------|----------------|
| Vidéo intro | < 15 MB, H.264, 720p |
| Images | WebP format, < 500 KB |
| Bundle JS | < 500 KB gzipped |

---

## 🔗 URLs Utiles

- **Render Dashboard** : https://dashboard.render.com
- **Documentation Render** : https://render.com/docs
- **Status Render** : https://status.render.com

---

## ✅ Checklist Finale

- [ ] Code poussé sur GitHub
- [ ] `server.js` présent à la racine
- [ ] `render.yaml` configuré
- [ ] Variables d'environnement définies
- [ ] Build réussi sur Render
- [ ] Site accessible via l'URL Render
- [ ] Vidéo d'introduction fonctionne (si utilisée)

---

**🎉 Votre EduAnalytics SaaS est maintenant en production !**
