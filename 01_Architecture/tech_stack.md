# Stack Technique & Déploiement

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
En tant qu'IA générant le code de cette application, tu DOIS te limiter strictement aux technologies listées ci-dessous. 

---

## 1. Frontend (Interface Utilisateur)
- **Framework Principal :** React.js (Initialisé avec **Vite** pour des performances optimales en développement).
- **Langage :** JavaScript (ou TypeScript si tu le juges plus sécurisé pour le mapping des données, mais garde un code lisible).
- **Routage :** `react-router-dom` (Version 6+ pour gérer les vues et les redirections liées aux rôles).
- **Gestion d'état global :** React Context API (Suffisant pour stocker la session utilisateur `user` et le thème clair/sombre sans surcharger l'application).

## 2. UI / UX Design System (Approche Hybride)
L'application utilise une approche hybride très précise. Tu dois respecter cette séparation des responsabilités pour le style :
- **Tailwind CSS :** À utiliser pour TOUTE la structure de la page (Layouts), les espacements (margin/padding), les flexbox/grids, la typographie basique, et les couleurs de fond/textes hors composants MUI.
- **Material UI (@mui/material) :** À utiliser UNIQUEMENT pour les composants interactifs et complexes nécessitant une logique métier ou un design spécifique :
  - Boutons, TextFields, Selects, Dialogs (Modales), Snackbars (Alertes).
  - `@mui/x-date-pickers` : Indispensable pour les formulaires de demande de congés et d'absences.
  - `@mui/x-data-grid` : Pour afficher TOUS les tableaux CRUD de l'administration et l'historique de l'employé.
- **Icônes :** `@mui/icons-material`.

## 3. Backend as a Service (BaaS) & Base de Données
- **Fournisseur :** Supabase.
- **Client de connexion :** `@supabase/supabase-js`.
- **Authentification :** Supabase Auth (Email/Password). L'authentification gère la session, la base de données PostgreSQL gère les données métiers.
- **Sécurité (RLS) :** L'IA devra configurer les requêtes en partant du principe que le Row Level Security (RLS) de Supabase est activé pour protéger les données.

## 4. Environnement et Déploiement
- **Développement :** Localhost (via `npm run dev` avec Vite + configuration PostCSS pour Tailwind).
- **Hébergement cible :** Vercel (L'IA doit s'assurer que le code généré ne contient pas de bugs empêchant le "build" de production sur Vercel, notamment en vérifiant bien les imports).
- **Variables d'environnement :** Utiliser la convention Vite (`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`) dans le fichier `.env`.

## 5. Architecture du Code (Approche MVC dans React)
Le code généré DOIT respecter une stricte séparation des préoccupations (Separation of Concerns), inspirée du modèle MVC. Tu dois structurer les fichiers de la manière suivante :

- **M (Model) -> Dossier `/services` :** Ce dossier contient TOUS les appels à la base de données (`supabase.from...`). Les composants UI ne doivent jamais appeler Supabase directement.
- **C (Controller) -> Dossier `/hooks` :** Contient la logique métier (Custom Hooks React). C'est ici qu'on appelle les services, qu'on gère les états de chargement (`isLoading`) et les erreurs.
- **V (View) -> Dossier `/pages` et `/components` :** Les composants visuels (MUI + Tailwind). Ils se contentent d'afficher les données qu'ils reçoivent des hooks et de déclencher des fonctions au clic.

## 6. Structure du Projet React (Codebase Architecture)
L'IA générant le code DOIT strictement organiser le dossier `src/` selon l'arborescence suivante. Cette structure garantit la séparation des préoccupations (MVC) et la scalabilité :
```text
src/
├── assets/         # Images, icônes SVG (Ex: LogoBlack.svg, LogoWhite.svg)
├── components/     # Composants réutilisables MUI/Tailwind (Boutons, Modales, DataGrids)
├── context/        # React Context (AuthContext, ThemeContext)
├── hooks/          # (CONTROLLER) Custom hooks contenant la logique métier (ex: useEmployes.js)
├── layouts/        # Structure de page (ex: AdminLayout avec Sidebar et Topbar)
├── pages/          # (VIEW) Les vues principales. Chaque fichier dans `Interfaces/` correspond à une page ici.
├── services/       # (MODEL) Appels exclusifs à Supabase (ex: supabaseClient.js, employeService.js)
├── theme/          # Configuration du thème MUI (Intégration de Theme.js)
├── utils/          # Fonctions utilitaires (formatage de dates, calculs)
├── App.jsx         # Configuration du Routeur (react-router-dom) et des Guards (RBAC)
└── main.jsx        # Point d'entrée de l'application