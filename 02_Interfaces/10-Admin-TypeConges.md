# Interface : Gestion des Types de Congés

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** Utiliser la capture d'écran fournie pour le design général (DataGrid clair, bouton d'ajout).
The reference: `manage_vacation_types_1.png`

**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible UNIQUEMENT au rôle `Administrateur`.
**EXCLUSIONS FORMELLES :** Ne PAS intégrer l'icône Chatbot (en bas à droite).
**ALIGNEMENT DATA CRITIQUE (CORRECTION UI) :** La capture d'écran est incomplète par rapport à la base de données. Tu DOIS t'aligner strictement sur la classe `TypeConge` du diagramme UML. Les attributs obligatoires sont : `id`, `label` (correspond au 'Nom' sur l'image), et **`est_deductible`** (un booléen manquant sur l'image mais obligatoire dans le code).

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur) :**
- 👥 Personnel
- 🏢 Départements 
- 🏷️ Services 
- 🏖️ Jours Fériés 
- ⚙️ Type congés (État : Actif/Sélectionné)
- 📬 Demandes congés
- 🗂️ Absences
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** - Titre : "Types de Congé"
- Action : Bouton `+ Ajouter Type de Congé` (MUI Button).
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau CRUD)
Utiliser un composant `DataGrid` (MUI) pour afficher la liste.

**Colonnes du tableau (Mapping UML Strict) :**
1. **ID :** Mapping avec `TypeConge.id` (À masquer ou abréger).
2. **Label :** Mapping avec `TypeConge.label` (ex: Congé Payé, Maladie).
3. **Déductible du solde :** Mapping avec `TypeConge.est_deductible`. (Afficher sous forme de MUI Chip visuel : "Oui" en vert si `true`, "Non" en gris si `false`).
4. **Actions :** 2 icônes MUI par ligne (✏️ Modifier, 🗑️ Supprimer).

---

## 3. Modales (Dialogs MUI) d'Action

### A. Ajouter un Type de Congé (Création)
- **Titre du Dialog :** "Nouveau Type de Congé"
- **Champs du formulaire :**
  - `Label` : Composant `TextField` (Requis).
  - `Est déductible du solde` : Composant `Switch` ou `Checkbox` MUI (Par défaut sur `true`).
- **Actions :** Bouton "Annuler" et Bouton "Enregistrer" (`INSERT` dans Supabase).

### B. Modifier le Type (Mise à jour)
- **Interface :** Identique à la création. Pré-remplir le `TextField` et le `Switch` avec les données existantes.
- **Logique :** Déclenche un `UPDATE` dans Supabase.

### C. Suppression & Logique Relationnelle
- **Logique UI :** Au clic sur l'icône corbeille (🗑️), ouvrir un `Dialog` de confirmation.
- **Message d'alerte :** *"Êtes-vous sûr de vouloir supprimer ce type de congé ? Vous ne pouvez pas le supprimer s'il est déjà utilisé dans l'historique des demandes."*
- **Gestion d'Erreur :** Bouton "Confirmer". Si Supabase retourne une erreur de contrainte de clé étrangère (car l'ID est utilisé dans la table `DemandeConge`), afficher une **MUI Snackbar rouge (`error`)** explicite : *"Impossible de supprimer : ce type est lié à des demandes de congés existantes."*