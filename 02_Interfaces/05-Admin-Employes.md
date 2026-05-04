# Interface : Gestion du Personnel

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Images de référence :** Utiliser les 4 captures d'écran fournies UNIQUEMENT pour s'inspirer du design des modales (UI/UX, disposition en grille, style des champs de saisie). 
The references are `manage_employe_2.png`,`manage_employe_3.png`,`manage_employe_1.png` and `manage_employe_4.png`
**SÉCURITÉ ET ACCÈS (RBAC) :** Page d'accueil par défaut et accessible UNIQUEMENT au rôle `Administrateur`.
**EXCLUSIONS FORMELLES :** 
1. Ne PAS intégrer l'icône Chatbot (en bas à droite).
2. Ne PAS intégrer le bouton "Télécharger Presence" en haut.
**ALIGNEMENT DATA CRITIQUE :** Les captures d'écran contiennent des champs factices (CIN, Adresse, Nationalité, etc.). **TU DOIS LES IGNORER ABSOLUMENT.** Tu ne dois utiliser QUE les attributs stricts de la table `Employe` : `matricule`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `solde_conge`, et la clé étrangère `id_service`.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur Strict) :**
- 👥 Personnel (Défaut / Actif)
- 🏢 Départements
- 🏷️ Services
- 🏖️ Jours Fériés
- ⚙️ Type congés
- 📬 Demandes congés
- 🗂️ Absences
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** Titre "Personnel" + Bouton `+ Ajouter Employé` + Switch Dark/White mode.

---

## 2. Contenu Principal (Tableau CRUD)
Utiliser un `DataGrid` (MUI) pour afficher la liste des employés.

**Colonnes du tableau :**
1. **Matricule**
2. **Nom**
3. **Prénom**
4. **Email**
5. **Rôle** (Enum: ADMIN, RH, EMPLOYE)
6. **Service** (Jointure avec la table `Service` via `id_service`)
7. **Département** (Jointure avec la table `Departement` via le Service)
8. **Actions :** 3 icônes MUI par ligne (👁️ Voir, ✏️ Modifier, 🗑️ Supprimer).

---

## 3. Modales (Dialogs MUI) d'Action
Le clic sur un bouton d'action ouvre une modale (`Dialog`) centrée, reprenant le style clair et aéré des captures d'écran, **mais limitée aux champs autorisés**.

### A. Ajouter un employé (Création)
- **Champs requis :**
  - `Matricule` (TextField)
  - `Nom` (TextField)
  - `Prénom` (TextField)
  - `Email` (TextField, type email)
  - `Mot de passe` (TextField, type password - mappé sur l'attribut `mot_de_passe`)
  - `Rôle` (Select MUI : ADMIN, RH, EMPLOYE)
  - `Service` (Select MUI : Liste dynamique tirée de la table `Service`)
- **Actions & Logique :** Bouton "Enregistrer". Doit impérativement utiliser `supabase.auth.admin.createUser` pour créer l'identité d'authentification, puis faire un `INSERT` dans la table publique `Employe`.

### B. Modifier Personnel (Mise à jour)
- **Interface :** Identique à la création. Les champs sont pré-remplis avec les données de l'employé, sauf le mot de passe qui reste visuellement vide par sécurité.
- **Logique backend critique (Supabase) :** 
  - Si le champ "Mot de passe" est rempli ou si l'"Email" est modifié, l'IA DOIT générer le code faisant appel à `supabase.auth.admin.updateUserById` pour mettre à jour les identifiants de connexion (`auth.users`), en plus de l'`UPDATE` classique sur la table publique `Employe`.
  - Si le champ "Mot de passe" est laissé vide, seul l'`UPDATE` de la table publique est nécessaire (sans toucher au mot de passe existant).

### C. Détails de l'employé (Lecture seule)
- **Interface :** Modale reprenant le design de la capture "Détails de l'employé", mais affichant uniquement les données métiers.
- **Données affichées :** Matricule, Nom, Prénom, Email, Rôle, Service de rattachement, Département, et **Solde de Congé Actuel**. *(Le mot de passe ne doit jamais être affiché ici).*

### D. Suppression
- **Sécurité :** Au clic sur la corbeille (🗑️), ouvrir une petite modale de confirmation : *"Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible."* avec les boutons "Annuler" et "Confirmer". Doit supprimer l'utilisateur de `auth.users` et de la table `Employe`.