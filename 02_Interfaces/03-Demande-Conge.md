# Interface : Gestion et Demande de Congés

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Utilise rigoureusement `design_system.md` et `Theme.js`.
**SÉCURITÉ ET ACCÈS (RBAC) :** Accessible UNIQUEMENT au rôle `Employé`.
**ALIGNEMENT DATA :** Les champs doivent correspondre exactement aux attributs de la classe `DemandeConge` du diagramme.
**THÈME :** Support Dark/White mode automatique.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar :** 👤 Mon Profil, 📝 Gestion des Congés (Actif), 🗂️ Mes Absences, 🚪 Déconnexion.
**Topbar :** Titre "Mes Demandes de Congés" + Switch de Thème.

---

## 2. Contenu Principal (Tableau & Actions)

### A. Entête et Logique de Solde
- **Action :** Bouton `+ NOUVELLE DEMANDE`.
- **Contrôle de Flux :** 
    - Si `Employe.solde_conge <= 0`, bloquer l'ouverture et afficher une **MUI Alert** : *"Solde insuffisant pour une nouvelle demande."*
    - Si `Employe.solde_conge > 0`, ouvrir le **MUI Dialog**.

### B. Historique (MUI DataGrid)
Afficher les données de la table `DemandeConge` filtrées par l'ID de l'utilisateur connecté.
- **Colonnes (Mapping exact) :**
  - **Type :** `TypeConge.label` (via `id_type`).
  - **Début :** `DemandeConge.date_debut`.
  - **Fin :** `DemandeConge.date_fin`.
  - **Statut :** `DemandeConge.statut` (Utiliser MUI Chips : Orange pour `ATTENTE`, Vert pour `VALIDE`, Rouge pour `REFUSE`).
  - **Commentaire :** `DemandeConge.commentaire` (Afficher un extrait ou une icône info si présent).

---

## 3. Formulaire de Saisie (MUI Dialog)
*Formulaire pour créer une instance de la classe `DemandeConge`.*

### Champs du Formulaire :
1. **Type de Congé :** 
   - Composant : `Select`.
   - Source : `TypeConge.label` (lié à `DemandeConge.id_type`).
2. **Date de début :** 
   - Composant : `DatePicker`.
   - Mapping : `DemandeConge.date_debut`.
3. **Date de fin :** 
   - Composant : `DatePicker`.
   - Mapping : `DemandeConge.date_fin`.
4. **Commentaire :** 
   - Composant : `TextField` (multiline).
   - Mapping : `DemandeConge.commentaire`.

### Actions :
- **Annuler :** Fermer le Dialog.
- **Confirmer :** 
    - `INSERT` dans `DemandeConge` avec `statut = 'ATTENTE'`.
    - Notification de succès via **MUI Snackbar**.
    - Rechargement automatique du tableau.