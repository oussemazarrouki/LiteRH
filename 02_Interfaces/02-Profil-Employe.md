# Interface : Profil Employé (Accueil)

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Tu dois concevoir cette page de zéro en utilisant rigoureusement le `design_system.md` et le `Theme.js` fourni.
**SÉCURITÉ ET ACCÈS (RBAC) :** Cette page est la page d'accueil par défaut pour le rôle `Employé`.
**RÉPONSIVITÉ (Desktop-First) :** Conçu pour Desktop, mais 100% responsive. Sur mobile, la Sidebar devient un menu Burger et les cartes s'empilent verticalement.
**THÈME :** Doit supporter le switch Dark/White mode (présent dans le Top Bar).

---

## 1. Barre de Navigation (Sidebar & Topbar)
**Sidebar (Fixe à gauche) :**
- 👤 Mon Profil (Actif)
- 📝 Nouvelle Demande de Congé
- 🗂️ Historique des Absences
- 🚪 Déconnexion (Action `signOut` Supabase)

**Topbar :** Titre de la page ("Mon Profil") et Switch de Thème.

---

## 2. Contenu Principal (UI Layout)
Générer une disposition en grille (`Grid` MUI) avec deux cartes principales :

### Carte 1 : Informations Personnelles (MUI Card)
- **Titre :** Mes Informations
- **Champs à afficher (en lecture seule) :** 
  - Nom & Prénom
  - Matricule
  - Email professionnel
  - Département
  - Service
- **Design :** Utiliser des icônes MUI (Person, Email, Work) à côté des labels pour un rendu premium.

### Carte 2 : Solde de Congés (MUI Card - Mise en valeur)
- **Titre :** Mon Solde
- **Data :** Afficher la variable `solde_conge` en très gros (typographie `h2` ou `h1` de MUI).
- **Texte secondaire :** "Jours disponibles".
- **Action :** Un bouton "Demander un congé" (MUI Button, couleur `primary`, `variant="contained"`) qui redirige vers la page de demande.