# Interface : Gestion des Jours Fériés

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Tu dois concevoir cette page en utilisant rigoureusement le `design_system.md` et le fichier `Theme.js`. Le design doit être cohérent avec les autres pages d'administration (Tableau central `DataGrid` dans une `Card` MUI, modales épurées).
**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible UNIQUEMENT au rôle `Administrateur`.
**ALIGNEMENT DATA CRITIQUE :** La table doit refléter EXACTEMENT la classe `JourFerie` du diagramme UML. Attributs stricts : `id`, `nom`, `date`.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur) :**
- 👥 Personnel
- 🏢 Départements 
- 🏷️ Services 
- 🏖️ Jours Fériés (État : Actif/Sélectionné)
- ⚙️ Type congés
- 📬 Demandes congés
- 🗂️ Absences
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Jours Fériés"
- Action : Bouton `+ Ajouter un Jour Férié` (MUI Button, `variant="contained"`, couleur `primary`).
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau CRUD)
Utiliser un composant `DataGrid` (MUI) pour afficher le calendrier des jours fériés.

**Colonnes du tableau (Mapping UML) :**
1. **Nom :** Mapping avec `JourFerie.nom` (ex: "Aïd al-Fitr", "Fête du Travail").
2. **Date :** Mapping avec `JourFerie.date` (Affichage au format DD/MM/YYYY).
3. **Actions :** 2 icônes MUI par ligne (✏️ Modifier, 🗑️ Supprimer).

**Comportement (UX) :** 
- Trier le tableau par défaut sur la colonne `date` (chronologique, les dates futures en premier).

---

## 3. Modales (Dialogs MUI) d'Action

### A. Ajouter un Jour Férié (Création)
- **Titre du Dialog :** "Nouveau Jour Férié"
- **Champs du formulaire :**
  - `Nom de l'événement` : Composant `TextField` (Requis).
  - `Date` : Composant `DatePicker` de `@mui/x-date-pickers` (Requis).
- **Actions :** Bouton "Annuler" (Ferme la modale) et Bouton "Enregistrer" (Déclenche un `INSERT` dans Supabase avec affichage d'une Snackbar de succès).

### B. Modifier le Jour Férié (Mise à jour)
- **Interface :** Identique à la création. Les champs sont pré-remplis avec les données de la ligne sélectionnée.
- **Logique :** Permet de corriger une erreur de frappe sur le nom ou d'ajuster la date (`UPDATE` dans Supabase).

### C. Suppression
- **Logique UI :** Au clic sur l'icône corbeille (🗑️), ouvrir un petit `Dialog` de confirmation : *"Êtes-vous sûr de vouloir supprimer ce jour férié ?"*
- **Action :** Bouton "Confirmer". Déclenche un `DELETE` dans la base de données et rafraîchit le tableau automatiquement.