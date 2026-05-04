# Interface : Gestion des Services

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** Utiliser la capture d'écran fournie pour l'inspiration visuelle (DataGrid, espacements, bouton d'ajout).
The reference: `manage_services_1.png`
**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible UNIQUEMENT au rôle `Administrateur`.
**EXCLUSIONS FORMELLES :** Ne PAS intégrer l'icône Chatbot (en bas à droite).
**ALIGNEMENT DATA CRITIQUE :** La table doit refléter la classe `Service` du diagramme UML. Attributs stricts : `id`, `nom`, `id_departement`.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur) :**
- 👥 Personnel
- 🏢 Départements 
- 🏷️ Services (État : Actif/Sélectionné)
- 🏖️ Jours Fériés
- ⚙️ Type congés
- 📬 Demandes congés
- 🗂️ Absences
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Services"
- Action : Bouton `+ Ajouter Service` (MUI Button).
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau CRUD)
Utiliser un `DataGrid` (MUI) pour afficher la liste.

**Colonnes du tableau (Mapping UML) :**
1. **ID :** Mapping avec `Service.id` (Affichage abrégé ou masqué selon les bonnes pratiques).
2. **Nom :** Mapping avec `Service.nom`.
3. **Département :** **Attention Jointure Requise.** Tu dois utiliser l'`id_departement` de la table `Service` pour aller chercher et afficher le `nom` correspondant dans la table `Departement`.
4. **Actions :** 2 icônes MUI par ligne (✏️ Modifier, 🗑️ Supprimer).

---

## 3. Modales (Dialogs MUI) d'Action

### A. Ajouter un Service (Création)
- **Titre du Dialog :** "Nouveau Service"
- **Champs du formulaire :**
  - `Nom du Service` : Composant `TextField` (Requis).
  - `Département de rattachement` : Composant `Select` ou `Autocomplete` (MUI). Ce champ doit charger dynamiquement la liste des départements existants (depuis la table `Departement`) pour que l'Admin puisse en choisir un. La valeur enregistrée en base sera l'`id_departement`.
- **Actions :** Bouton "Annuler" et Bouton "Enregistrer" (`INSERT` dans Supabase).

### B. Modifier le Service (Mise à jour)
- **Interface :** Identique à la création. Les champs sont pré-remplis avec le `nom` du service et son `Département` actuel.
- **Logique :** Permet de renommer le service ou de le changer de département (`UPDATE` dans Supabase).

### C. Suppression & Logique Relationnelle
- **Logique UI :** Au clic sur l'icône corbeille (🗑️), ouvrir un `Dialog` de confirmation.
- **Message d'alerte :** *"Êtes-vous sûr de vouloir supprimer ce service ? Cette action est impossible s'il contient encore des employés actifs."*
- **Gestion d'Erreur :** Bouton "Confirmer". Si Supabase retourne une erreur de contrainte de clé étrangère (parce que des instances d'`Employe` pointent encore vers cet `id_service`), afficher une **MUI Snackbar rouge (`error`)** : *"Impossible de supprimer : ce service contient des employés rattachés. Veuillez d'abord réassigner ces employés."*