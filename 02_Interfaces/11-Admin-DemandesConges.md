# Interface : Gestion des Demandes de Congés (Vue Admin)

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Tu dois concevoir cette page en utilisant rigoureusement le `design_system.md` et le fichier `Theme.js`. Le design doit rester cohérent avec le reste du panel d'administration (Tableau central, fond épuré).
**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible UNIQUEMENT au rôle `Administrateur`.
**RÈGLE MÉTIER CRITIQUE :** L'administrateur n'a **PAS LE DROIT** de créer une demande. Il n'y a donc AUCUN bouton "+ Ajouter". Ses seules actions sont la consultation, la modification du statut (Approbation/Refus) et la suppression.
**ALIGNEMENT DATA :** La table reflète la classe `DemandeConge` du diagramme UML. 

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur) :**
- 👥 Personnel
- 🏢 Départements 
- 🏷️ Services 
- 🏖️ Jours Fériés 
- ⚙️ Type congés 
- 📬 Demandes congés (État : Actif/Sélectionné)
- 🗂️ Absences
- 👤 Profil
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Gestion des Demandes"
- Action : **AUCUN BOUTON D'AJOUT ICI.**
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau de Validation)
Utiliser un composant `DataGrid` (MUI) pour afficher toutes les demandes du système.

**Colonnes du tableau (Jointures UML requises) :**
1. **Employé :** Jointure via `id_employe` vers la table `Employe` (Afficher "Nom Prénom").
2. **Type de Congé :** Jointure via `id_type` vers la table `TypeConge` (Afficher le `label`).
3. **Début :** Mapping avec `date_debut`.
4. **Fin :** Mapping avec `date_fin`.
5. **Commentaire :** Mapping avec `commentaire` (Afficher un extrait, ou une icône tooltip si le texte est long).
6. **Statut :** Mapping avec `statut`. Utiliser des **MUI Chips** stricts :
   - `ATTENTE` -> Couleur Orange (`warning`)
   - `VALIDE` -> Couleur Vert (`success`)
   - `REFUSE` -> Couleur Rouge (`error`)
7. **Actions :** 2 icônes MUI par ligne (✏️ Traiter/Modifier, 🗑️ Supprimer).

---

## 3. Modales (Dialogs MUI) d'Action

### A. Traiter la demande (Mise à jour du Statut)
*C'est l'action principale de l'Admin.*
- **Titre du Dialog :** "Traitement de la demande"
- **Contenu en lecture seule :** Afficher un résumé clair de la demande (Nom de l'employé, Dates, Type de congé, Commentaire de l'employé) pour que l'Admin sache ce qu'il valide.
- **Champ modifiable :** 
  - `Statut` : Un composant `Select` ou `RadioGroup` (MUI) avec les 3 options de l'Enum : `ATTENTE`, `VALIDE`, `REFUSE`.
- **Actions & Logique Backend :** Bouton "Enregistrer". Fait un `UPDATE` du champ `statut` dans Supabase. 
*(Note Backend Avancée pour l'IA : Si le statut passe à `VALIDE`, prévoir dans la logique métier une vérification pour déduire les jours du `solde_conge` de l'employé si le type de congé a `est_deductible = true`).*

### B. Suppression
- **Logique UI :** Au clic sur l'icône corbeille (🗑️), ouvrir un `Dialog` de confirmation.
- **Message d'alerte :** *"Êtes-vous sûr de vouloir supprimer cette demande de l'historique ? Cette action est irréversible."*
- **Action :** Bouton "Confirmer" (`DELETE` dans Supabase) et rafraîchissement du tableau.