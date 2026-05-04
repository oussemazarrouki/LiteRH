# Plan et Cas de Tests (QA & ISTQB Standards)

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE / QA ENGINEER)
Ce document sert de référence absolue pour le développement dirigé par les tests (TDD) et la validation finale. 
**Outils recommandés pour l'implémentation :**
- **Unit & Integration :** `Vitest` (optimisé pour Vite) + `React Testing Library`.
- **E2E (End-to-End) :** `Cypress` ou `Playwright`.
**Couverture attendue :** Les règles métier (Calcul des congés, RBAC, Clés étrangères) doivent avoir une couverture de 100%.

---

## 1. Tests Unitaires (Unit Testing)
*Objectif : Tester les fonctions isolées et la logique métier pure du Frontend (sans appel réseau réel).*

### TU-01 : Validation des dates de Demande de Congé
- **Précondition :** L'utilisateur est sur le formulaire de demande de congé.
- **Entrées :** `date_debut` = 15/06/2026, `date_fin` = 10/06/2026.
- **Résultat Attendu :** Le formulaire renvoie une erreur de validation immédiate (MUI TextField error) : *"La date de fin doit être ultérieure ou égale à la date de début."* Le bouton "Soumettre" est désactivé.

### TU-02 : Contrôle du Solde de Congé
- **Précondition :** Fonction d'évaluation du droit de congé `checkSolde(solde_conge)`.
- **Classes d'équivalence (ISTQB) :**
  - Cas A : `solde_conge` = 0 ➔ Résultat attendu : `false` (Alerte : Solde épuisé).
  - Cas B : `solde_conge` = 1.5 ➔ Résultat attendu : `true` (Ouverture Modale).
  - Cas C : `solde_conge` = -1 ➔ Résultat attendu : `false`.

### TU-03 : Routage basé sur le Rôle (RBAC)
- **Précondition :** L'utilisateur soumet un login valide.
- **Entrées/Résultats Attendus :**
  - Si `role === 'ADMIN'` ➔ Le routeur retourne le chemin `/admin/personnel`.
  - Si `role === 'EMPLOYE'` ➔ Le routeur retourne le chemin `/employe/profil`.

---

## 2. Tests d'Intégration (Integration Testing)
*Objectif : Vérifier que le Frontend (React/MUI) communique correctement avec le Backend (Supabase) et gère correctement les états.*

### TI-01 : Création d'une identité (Supabase Auth + Public Table)
- **Scénario :** L'Admin ajoute un nouvel employé.
- **Actions :** Remplissage du formulaire de création et soumission.
- **Résultat Attendu :** 
  1. `supabase.auth.admin.createUser` retourne un succès (UUID généré).
  2. Un `INSERT` est déclenché dans la table publique `Employe` avec cet UUID.
  3. Le `DataGrid` MUI se met à jour pour afficher la nouvelle ligne.

### TI-02 : Jointures Complexes (Affichage du Service et Département)
- **Scénario :** Affichage de la table `Personnel`.
- **Résultat Attendu :** L'appel Supabase doit inclure les jointures nécessaires pour que l'`id_service` affiche bien le `nom` du service ET le `nom` du `Departement` parent.

### TI-03 : Contrainte de Clé Étrangère (Suppression Bloquée)
- **Précondition :** Un Département "IT" possède 2 Services actifs.
- **Action :** L'Admin clique sur la corbeille pour supprimer le Département "IT" puis confirme.
- **Résultat Attendu :** L'appel API `DELETE` échoue. Le frontend intercepte l'erreur Supabase et affiche une `Snackbar` d'erreur MUI : *"Impossible de supprimer : ce département contient des services liés."*

---

## 3. Tests de Bout-en-Bout (E2E Testing)
*Objectif : Simuler des parcours utilisateurs complets (User Flows) sur l'interface.*

### E2E-01 : Cycle de vie d'une demande de congé (Le Flux Critique)
- **Étape 1 (Employé) :** Login en tant qu'Employé. Navigation vers "Mes Congés".
- **Étape 2 (Employé) :** Création d'une demande de "Congé Payé" (`est_deductible = true`) de 3 jours. Statut initial affiché : `ATTENTE` (Chip Orange). Déconnexion.
- **Étape 3 (Admin) :** Login en tant qu'Admin. Navigation vers "Demandes Congés".
- **Étape 4 (Admin) :** La demande de l'employé est visible. L'Admin la modifie et change le statut en `VALIDE` (Chip Vert).
- **Résultat Attendu (Validation Métier) :** 
  1. Le statut passe à `VALIDE`.
  2. Le `solde_conge` de l'employé est décrémenté de 3 jours dans la table `Employe`.

### E2E-02 : Affichage filtré des historiques (Isolation des données)
- **Action :** Connexion avec l'employé A. Navigation vers "Mes Absences" et "Mes Congés".
- **Résultat Attendu :** Le `DataGrid` n'affiche **que** les lignes où `id_employe` correspond à l'UUID de l'employé A. Aucun enregistrement de l'employé B ne doit fuiter dans l'interface (Vérification UI + vérification de la requête réseau).

---

## 4. Tests de Sécurité & Contrôle d'Accès
*Objectif : S'assurer de l'inviolabilité du système selon la matrice des rôles.*

### TS-01 : Protection des Routes Frontend (Guards)
- **Action :** Un `EMPLOYE` authentifié modifie l'URL manuellement pour accéder à `/admin/personnel`.
- **Résultat Attendu :** Le Guard React (ex: `<ProtectedRoute allowedRoles={['ADMIN']} />`) intercepte la navigation et redirige l'utilisateur vers `/employe/profil` (ou affiche une page 403 Access Denied).

### TS-02 : Protection des Données Backend (Supabase RLS - Row Level Security)
- **Précondition :** Un utilisateur "Employé" essaie de forcer une requête Supabase via la console du navigateur.
- **Action :** Exécution manuelle de `supabase.from('Employe').delete().eq('matricule', 'EMP001')`.
- **Résultat Attendu :** Supabase rejette la requête (Code 401/403) car les policies RLS interdisent le CRUD sur cette table aux rôles non-Administrateurs.

### TS-03 : Sécurité de la Page Login
- **Action :** Tentative de connexion avec une adresse email existante mais un mot de passe erroné.
- **Résultat Attendu :** Affichage d'un message générique *"Identifiants incorrects"* (Ne jamais préciser si c'est l'email ou le mot de passe qui est faux, pour contrer l'énumération de comptes).