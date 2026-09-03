# Pixel Quest — Le Cristal Perdu

Un jeu de plateforme 2D complet, jouable directement dans le navigateur, écrit en HTML5/CSS/JavaScript pur (aucune dépendance, aucun framework, aucune image externe — tout est dessiné et généré en code).

## Jouer

Aucune installation n'est nécessaire : ouvrez simplement `index.html` dans un navigateur, ou servez le dossier avec un petit serveur statique :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Contrôles

| Touche | Action |
| --- | --- |
| `←` `→` ou `Q` `D` | Se déplacer |
| `Espace`, `↑`, `W` ou `Z` | Sauter |
| `P` | Pause |

## Objectif

Traverse les 3 niveaux (Forêt, Cavernes, Tour du Cristal), évite ou écrase les ennemis en sautant sur eux, collecte un maximum de pièces, et atteins le cristal à la fin de chaque niveau. Tu commences avec 3 vies ; tomber dans un gouffre ou toucher un ennemi de côté en coûte une. Le meilleur score est sauvegardé localement (`localStorage`).

## Structure du projet

```
index.html       Structure de la page et des écrans (menu, pause, game over, victoire)
style.css        Habillage visuel des écrans et du HUD
js/levels.js      Données des 3 niveaux (plateformes, pièces, ennemis, objectif)
js/audio.js       Effets sonores synthétisés via l'API WebAudio (pas de fichiers audio)
js/game.js        Moteur du jeu : boucle de jeu, physique, collisions, rendu Canvas, état
```

## Fonctionnalités

- Moteur de plateforme complet : gravité, saut, collisions AABB par axe
- 3 niveaux avec thèmes visuels distincts (forêt, caverne, tour)
- Ennemis patrouilleurs (vaincus en sautant dessus, dangereux au contact latéral)
- Pièces à collecter, score et système de vies avec invulnérabilité temporaire
- Caméra qui suit le joueur avec parallaxe de décor
- Écrans de menu, pause, fin de niveau, game over et victoire
- Meilleur score persistant (localStorage)
- Effets sonores générés en JavaScript (sauts, pièces, coups, victoire)

## Tests

Testé manuellement avec Playwright/Chromium (navigation dans les menus, déplacement, saut, collecte de pièces, franchissement des gouffres, élimination des ennemis, complétion de niveau) : aucune erreur console relevée.
