# Flux Utilisateurs (User Flows) & Règles Métier

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
Ce document définit les parcours utilisateurs (User Flows) et le routage (Routing) de l'application. Tu dois utiliser un routeur moderne (ex: `react-router-dom`) et protéger les routes avec des "Guards" basés sur le rôle de l'utilisateur stocké dans le contexte global ou l'état de l'application post-authentification Supabase.

---

## 1. Flux d'Authentification et Routage Dynamique (L'Aiguilleur)
C'est le point d'entrée unique de l'application. Le système doit diriger l'utilisateur vers la bonne interface selon son rôle défini dans l'`Enum {ADMIN, RH, EMPLOYE}` de la table `Employe`.

1. L'utilisateur arrive sur la route `/login` (Interface : `13-Login.md`).
2. Il soumet ses identifiants (Email + Mot de passe).
3. **Appel Supabase :** `supabase.auth.signInWithPassword()`.
4. **Récupération du profil :** Le système requête la table publique `Employe` pour obtenir le `role`.
5. **Routage :**
   - Si Rôle = `ADMIN` ➔ Redirection vers `/admin/personnel` (Interface : `05-Admin-Employes.md`).
   - Si Rôle = `RH` ➔ Redirection vers `/rh/dashboard` (Interface : `01-Dashboard.md`).
   - Si Rôle = `EMPLOYE` ➔ Redirection vers `/employe/profil` (Interface : `02-Profil-Employe.md`).

---

## 2. Parcours Employé : Demande de Congé (Contrôle du Solde)
L'employé est responsable de la soumission de ses demandes. Ce flux intègre une règle métier stricte.

1. L'employé navigue vers `/employe/demande-conges` (Interface : `03-Demande-Conge.md`).
2. Il clique sur le bouton "+ Nouvelle Demande".
3. **Contrôle Métier (Frontend Guard) :**
   - **Condition A :** Si `Employe.solde_conge <= 0`, l'action est bloquée. Affichage d'une alerte : *"Action impossible : Solde de congés épuisé."*
   - **Condition B :** Si `Employe.solde_conge > 0`, ouverture de la modale de formulaire.
4. L'employé remplit les dates et sélectionne le type de congé (Jointure sur `TypeConge.label`).
5. **Soumission :** Création d'une instance `DemandeConge` avec le `statut` défini par défaut sur `ATTENTE`.
6. Le tableau se rafraîchit pour afficher la nouvelle demande en tête de liste.

---

## 3. Parcours Administrateur : Validation des Congés et Impact Solde
L'administrateur gère l'état (le cycle de vie) des demandes soumises par les employés.

1. L'Admin navigue vers `/admin/demandes` (Interface : `11-Admin-DemandesConges.md`).
2. Il consulte les demandes avec le statut `ATTENTE`.
3. Il sélectionne une demande et clique sur "Traiter/Modifier".
4. Il passe le `statut` de `ATTENTE` à `VALIDE`.
5. **Logique Métier Critique (Backend/Service) :**
   - Lors de la validation (`UPDATE` du statut sur `VALIDE`), le système doit vérifier l'attribut booléen `est_deductible` de la table `TypeConge` associée.
   - **SI** `est_deductible == true` : Le système calcule la durée du congé (Date fin - Date début, en tenant compte potentiellement des `JourFerie` `<<use>>`) et **soustrait** ce total du champ `solde_conge` de l'employé concerné.
   - **SI** `est_deductible == false` : Le statut est mis à jour, mais le `solde_conge` de l'employé reste intact.

---

## 4. Parcours Administrateur : Création et Mise à jour du Personnel
L'Admin crée les accès et gère les identifiants en respectant la dualité Supabase (Auth + Base de données publique).

### A. Création (Onboarding)
1. L'Admin navigue vers `/admin/personnel`.
2. Il clique sur "+ Ajouter Employé" et remplit le formulaire complet (incluant le mot de passe).
3. **Soumission :** 
   - Étape 1 : Appel à `supabase.auth.admin.createUser()` pour créer le compte d'authentification.
   - Étape 2 : `INSERT` dans la table `Employe` avec l'`id` (UUID) retourné par l'étape 1.

### B. Modification des Identifiants
1. L'Admin ouvre la modale de modification d'un employé existant.
2. Si le champ "Mot de passe" est rempli par l'Admin ou si l'Email a changé :
3. **Soumission :** Appel obligatoire à `supabase.auth.admin.updateUserById()` pour synchroniser le système de sécurité, puis `UPDATE` de la table `Employe`.

---

## 5. Règles de Suppression et Intégrité Référentielle (Foreign Keys)
Dans toutes les interfaces d'Administration (Départements, Services, Types de congés), les règles de protection suivantes s'appliquent pour éviter de casser la base de données :

- **Tentative de suppression d'un Département :** Échoue (Snackbar d'erreur) si au moins un `Service` y est encore rattaché (`id_departement`).
- **Tentative de suppression d'un Service :** Échoue si au moins un `Employe` y est encore rattaché (`id_service`).
- **Tentative de suppression d'un Type de Congé :** Échoue s'il est utilisé dans l'historique de la table `DemandeConge` (`id_type`).
- *Solution UI :* Afficher systématiquement un message demandant à l'Administrateur de réassigner les éléments dépendants avant de pouvoir effectuer la suppression.