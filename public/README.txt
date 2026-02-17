=====================================================
INSTRUCTIONS POUR LA VIDEO D'INTRODUCTION
=====================================================

Pour afficher votre vidéo d'introduction, suivez ces étapes :

1. Placez votre fichier vidéo dans ce dossier "public"
   
2. Renommez-le : intro.mp4
   
   OU si vous avez un autre format (webm, mov, etc.), 
   modifiez le nom dans src/App.tsx ligne correspondante

3. Formats supportés :
   - .mp4 (recommandé)
   - .webm
   - .mov
   - .ogg

4. Taille recommandée :
   - Durée : 3 à 10 secondes
   - Résolution : 1920x1080 ou moins
   - Poids : < 10 MB pour un chargement rapide

=====================================================
STRUCTURE DU DOSSIER
=====================================================

public/
├── intro.mp4          <-- Votre vidéo ici
└── README.txt         <-- Ce fichier

=====================================================
ALTERNATIVE : IMAGE AU LIEU DE VIDEO
=====================================================

Si vous préférez une image de démarrage :
1. Renommez votre image en : intro.jpg ou intro.png
2. Modifiez le composant IntroVideo dans src/App.tsx

=====================================================
