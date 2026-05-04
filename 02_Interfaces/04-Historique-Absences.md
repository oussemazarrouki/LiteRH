# Interface : Historique de Mes Absences

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Tu dois concevoir cette page en utilisant rigoureusement le `design_system.md` et le fichier `Theme.js` fourni.
**SÉCURITÉ ET ACCÈS (RBAC) :** Rôle `Employé` uniquement. 
**FILTRE DE DONNÉES CRITIQUE :** La requête Supabase DOIT filtrer les données pour n'afficher **QUE** les enregistrements appartenant à l'employé actuellement connecté (`WHERE id_employe = current_user_id`).
**ALIGNEMENT DATA :** Les champs du tableau doivent correspondre exactement aux attributs de la classe `Absence` du diagramme UML.
**RÉPONSIVITÉ :** Le tableau de données doit être encapsulé dans un conteneur avec `overflow-x: auto` pour pouvoir scroller horizontalement sur mobile sans casser l'interface.

---

## 1. Navigation (Sidebar & Topbar)
**Sidebar (Fixe à gauche) :**
- 👤 Mon Profil
- 📝 Gestion des Congés 
- 🗂️ Mes Absences (État : Actif/Sélectionné)
- 🚪 Déconnexion

**Topbar :** 
- Titre : "Mes Absences"
- Composant : Switch de Thème (Clair/Sombre).

---

## 2. Contenu Principal (Tableau de Données)
Utiliser le composant MUI `DataGrid` (ou `Table` si plus adapté pour la personnalisation) à l'intérieur d'une MUI Card. 
*Note pour l'IA : Contrairement aux congés, cette page est en lecture seule (Consultation). L'employé ne fait pas de "demande" d'absence, il consulte celles qui ont été enregistrées.*

### Spécifications du Tableau :
Les données proviennent exclusivement de la table `Absence`.

**Colonnes (Mapping exact avec la classe `Absence`) :**
1. **Date de début :** Mapping avec `Absence.date_debut` (Format DD/MM/YYYY).
2. **Date de fin :** Mapping avec `Absence.date_fin` (Format DD/MM/YYYY).
3. **Motif :** Mapping avec `Absence.motif` (Affiche le texte explicatif de l'absence).

*(Note : Pas de colonne "Statut" ni "Type" ici, ces attributs appartiennent à la classe DemandeConge).*

### Comportement et UX :
- **Tri par défaut :** Le tableau doit afficher les absences les plus récentes en premier (Tri descendant sur la `date_debut`).
- **Pagination :** Afficher 10 résultats par page.
- **Empty State :** Si la base de données ne renvoie aucun résultat, afficher une illustration discrète ou un texte centré et stylisé : *"Aucune absence enregistrée dans votre historique."*