# Système de Design - Gestion RH (MUI Based)

Ce document définit les règles graphiques et les composants de base pour l'interface utilisateur, basés sur la bibliothèque Material UI (MUI) et le fichier `Theme.js` existant.

## 1. Palette de Couleurs (Mode Sombre par défaut)

L'application utilise principalement le **Dark Mode** pour réduire la fatigue oculaire de l'administrateur.

*   **Couleur Primaire (Teal/Mint) :** `#a9dfd8` (Utilisée pour les boutons d'action, les sélections et les éléments actifs).
*   **Arrière-plan Global :** `#161821`
*   **Surface (Cartes & Dialogues) :** `#21222c`
*   **Texte :**
    *   Primaire : `#FFFFFF` (Titres et contenus importants)
    *   Secondaire : `#E2E8F0` (Labels et descriptions)
    *   Tertiaire : `#94A3B8` (Textes d'aide et désactivés)

### Couleurs Sémantiques
*   **Succès :** `rgba(169, 223, 216)` (Identique au primaire)
*   **Avertissement :** `rgba(252, 184, 89)` (Orange)
*   **Erreur :** `rgba(242, 109, 91)` (Corail/Rouge)
*   **Info :** `rgba(40, 174, 243)` (Bleu ciel)

---

## 2. Typographie
*   **Police de caractères :** `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`.
*   **Style :** Propre, sans-serif, mettant l'accent sur la lisibilité des données chiffrées (tableaux).

---

## 3. Composants Clés (Spécifications MUI)

### A. Tableaux de données (DataGrid / Table)
*   **En-tête :** Fond `#F1F5F9` (en mode clair) ou gris foncé avec texte `#64748B`.
*   **Lignes :** Bordure inférieure `#E2E8F0`. Effet de survol (hover) léger pour faciliter la lecture.
*   **Actions :** Icônes discrètes (Eye, Pencil, Trash) pour les actions CRUD.

### B. Cartes & Conteneurs (MUI Card)
*   **Bords :** Arrondis standards MUI.
*   **Ombres :** Utilisation de l'ombre personnalisée `shadowsArray` (1px à 3px pour les cartes de base).
*   **Dashboard :** Les cartes de statistiques doivent inclure des icônes de catégorie (ex: icône "Groupe" pour le total des employés).

### C. Boutons (MUI Button)
*   **Style :** `textTransform: 'none'` (pas de majuscules automatiques).
*   **Bordure :** `borderRadius: '6px'`.
*   **Action Principale :** Bouton plein (contained) en couleur `#a9dfd8` avec texte contrasté.

### D. Barre de navigation (Sidebar)
*   **Fond :** `#21222c`.
*   **Navigation :** Menu vertical à gauche avec icônes (Dashboard, Personnel, Département, Congés, etc.).
*   **État Actif :** Indicateur coloré (Mint) sur le côté ou fond légèrement plus clair pour l'élément sélectionné.

---

## 4. Expérience Utilisateur (UX)

*   **Switch de Thème :** L'application doit supporter le basculement entre le `darkTheme` et le `whiteTheme`.
*   **Formulaires :** Les champs de saisie (Inputs) doivent utiliser le style `autofill` personnalisé pour éviter les flashs blancs sur fond sombre.
*   **Feedbacks :** Utilisation de Badges colorés pour les statuts de congés :
    *   *Vert :* Validé
    *   *Orange :* En attente
    *   *Rouge :* Refusé

---

## 5. Assets & Branding
*   **Logo :** Use icons instead of logos for both white and dark mode
