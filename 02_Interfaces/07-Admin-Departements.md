# Interface : Gestion des Départements

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** Utiliser la capture d'écran fournie UNIQUEMENT pour le design global (tableau épuré, bouton d'ajout en haut à droite, pagination en bas).
The reference: `manage_departments_1.png`
**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible UNIQUEMENT au rôle `Administrateur`.
**EXCLUSIONS FORMELLES :** Ne PAS intégrer l'icône Chatbot (en bas à droite de l'image).
**ALIGNEMENT DATA CRITIQUE :** Les colonnes et champs de saisie doivent correspondre EXACTEMENT à la classe `Departement` du diagramme UML. Il n'y a que deux attributs gérés : `id` (généré automatiquement) et `nom`.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur) :**
- 👥 Personnel
- 🏢 Départements (État : Actif/Sélectionné)
- 🏷️ Services
- 🏖️ Jours Fériés
- ⚙️ Type congés
- 📬 Demandes congés
- 🗂️ Absences
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Départements"
- Action : Bouton `+ Ajouter Département` (MUI Button, variant "outlined" ou "contained").
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau CRUD)
Utiliser un `DataGrid` (MUI) minimaliste pour afficher les départements.

**Colonnes du tableau (Mapping UML) :**
1. **ID :** Mapping avec `Departement.id` (À afficher de manière abrégée car c'est un UUID long, ou à cacher selon les meilleures pratiques UI).
2. **Nom :** Mapping avec `Departement.nom`.
3. **Actions :** 2 icônes MUI par ligne (✏️ Modifier, 🗑️ Supprimer).

---

## 3. Modales (Dialogs MUI) d'Action
Puisque l'entité est extrêmement simple, les modales doivent être très épurées.

### A. Ajouter un Département (Création)
- **Titre du Dialog :** "Nouveau Département"
- **Champs du formulaire :**
  - `Nom` : Composant `TextField` (Requis).
  *(Note pour l'IA : L'`id` de type UUID est généré par la base de données Supabase, l'interface ne doit demander que le nom).*
- **Actions :** Bouton "Annuler" et Bouton "Enregistrer" (`INSERT` dans Supabase).

### B. Modifier le Département (Mise à jour)
- **Interface :** Identique à la création. Le `TextField` est pré-rempli avec le `nom` du département sélectionné.
- **Logique :** Déclenche un `UPDATE` dans Supabase sur l'attribut `nom`.

### C. Suppression & Logique Relationnelle
- **Logique UI :** Au clic sur l'icône corbeille (🗑️), ouvrir un `Dialog` de confirmation.
- **Message d'alerte :** *"Êtes-vous sûr de vouloir supprimer ce département ? Attention, vous ne pouvez pas le supprimer s'il contient encore des services actifs."*
- **Action et Gestion d'Erreur :** Bouton "Confirmer". Déclenche un `DELETE`. Si Supabase retourne une erreur de type "Foreign Key Constraint" (car des services y sont liés), afficher une **MUI Snackbar rouge (`error`)** explicite : *"Impossible de supprimer : ce département contient des services liés."* Si succès, rafraîchir le tableau.