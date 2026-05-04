# Interface : Profil Administrateur

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Utiliser le `design_system.md` et le `Theme.js` pour générer une interface propre (cartes MUI, disposition en grille).
**SÉCURITÉ ET ACCÈS (RBAC) :** Page accessible au rôle `Administrateur`.
**ALIGNEMENT DATA :** Les informations proviennent de la table `Employe` où l'ID correspond à l'utilisateur actuellement connecté (`current_user_id`). 

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Menu Administrateur Strict) :**
- 👥 Personnel
- 🏢 Départements
- 🏷️ Services
- 🏖️ Jours Fériés
- ⚙️ Type congés
- 📬 Demandes congés
- 🗂️ Absences
- 👤 Profil (État : Actif/Sélectionné)
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Mon Profil"
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (UI Layout)
Générer une disposition en grille (`Grid` MUI) avec deux ou trois cartes principales.

### Carte 1 : Informations Personnelles (Lecture seule)
- **Titre :** Mes Informations
- **Champs à afficher :** 
  - `Matricule`
  - `Nom` & `Prénom`
  - `Email`
  - `Rôle` (Sera affiché comme "Administrateur" selon l'Enum)
  - `Service` & `Département` (Nécessite une jointure via `id_service`)
  - `Solde de congés` (Affiché à titre informatif)
- **Design :** Utiliser des icônes MUI (Person, Email, Shield/Admin) à côté des labels pour un rendu premium.

### Carte 2 : Sécurité (Mise à jour du mot de passe)
*Puisque le mot de passe est géré dans le système (Supabase Auth), l'utilisateur doit pouvoir le modifier lui-même.*
- **Titre :** Sécurité du compte
- **Formulaire :**
  - Champ : "Nouveau mot de passe" (`TextField` MUI, type `password`).
  - Champ : "Confirmer le mot de passe" (`TextField` MUI, type `password`).
- **Action :** Bouton "Mettre à jour le mot de passe". 
- **Logique Backend :** Au clic, vérifier que les deux mots de passe correspondent, puis utiliser la méthode `supabase.auth.updateUser({ password: newPassword })` pour mettre à jour l'authentification. Afficher une `Snackbar` de succès.