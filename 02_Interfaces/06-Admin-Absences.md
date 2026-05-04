# Interface : Gestion des Absences (Vue Administrateur)

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** La capture d'écran fournie sert UNIQUEMENT d'inspiration pour le style visuel (layout du tableau, position du bouton "Ajouter", design clair/épuré).
The reference: `manage_absences_1.png`
**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible UNIQUEMENT au rôle `Administrateur`.
**EXCLUSIONS FORMELLES :** 
1. Ne PAS intégrer l'icône Chatbot (en bas à droite de l'image).
2. **ALIGNEMENT DATA CRITIQUE :** L'image contient des colonnes erronées ("Certifié", une seule "Date", etc.). **TU DOIS LES IGNORER.** Tu ne dois utiliser QUE les attributs stricts de la classe `Absence` du diagramme UML : `id`, `id_employe`, `date_debut`, `date_fin`, `motif`.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur) :**
- 👥 Personnel
- 🏢 Départements
- 🏷️ Services
- 🏖️ Jours Fériés
- ⚙️ Type congés
- 📬 Demandes congés
- 🗂️ Absences (État : Actif/Sélectionné)
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Absences"
- Action : Bouton `+ Ajouter Absence` (MUI Button, variant "outlined" ou "contained").
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau CRUD)
Utiliser un `DataGrid` (MUI) pour afficher l'historique global des absences de tous les employés.

**Colonnes du tableau (Mapping UML Strict) :**
1. **Employé :** (Jointure requise : Afficher le `nom` et `prenom` depuis la table `Employe` via `id_employe`).
2. **Date de début :** Mapping avec `Absence.date_debut`.
3. **Date de fin :** Mapping avec `Absence.date_fin`.
4. **Motif :** Mapping avec `Absence.motif`.
5. **Actions :** 2 icônes MUI par ligne (✏️ Modifier, 🗑️ Supprimer).

---

## 3. Modales (Dialogs MUI) d'Action
Le clic sur un bouton d'action ouvre une modale (`Dialog`) centrée pour les opérations CRUD.

### A. Ajouter une absence (Création par l'Admin)
- **Champs du formulaire :**
  - `Employé` : Un composant `Autocomplete` ou `Select` (MUI) pour chercher et sélectionner un employé existant (enregistre l'`id_employe`).
  - `Date de début` : Composant `DatePicker`.
  - `Date de fin` : Composant `DatePicker` (doit être >= à la date de début).
  - `Motif` : Composant `TextField` (multiline).
- **Actions :** Bouton "Annuler" et Bouton "Enregistrer" (Déclenche un `INSERT` dans Supabase).

### B. Modifier l'absence (Mise à jour)
- **Interface :** Identique à la création.
- **Logique :** Les champs sont pré-remplis avec les données de la ligne sélectionnée. Permet de corriger une date ou un motif (`UPDATE` dans Supabase).

### C. Suppression
- **Logique :** Au clic sur la corbeille (🗑️), ouvrir un `Dialog` de confirmation : *"Voulez-vous vraiment supprimer cet enregistrement d'absence ?"*.
- **Action :** Bouton "Confirmer" (Déclenche un `DELETE` dans Supabase) et rafraîchissement du tableau.