# Interface : Tableau de Bord (Dashboard)

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** `Dashboard.png`
**Consigne de Design :** Inspire-toi de cette capture (cartes, ombres, disposition en 3 colonnes), mais adapte-la à notre logique stricte.
**SÉCURITÉ ET ACCÈS (RBAC) :** Cette page est **EXCLUSIVEMENT RÉSERVÉE au rôle `Responsable RH`**. C'est sa page d'accueil par défaut post-connexion. Les rôles `Admin` et `Employé` doivent être bloqués s'ils tentent d'accéder à l'URL `/dashboard`.
**EXCLUSIONS :** Pas de chatbot, pas de widget "Anniversaires" (remplacer par "Dernières demandes").

**RÉPONSIVITÉ (Desktop-First) :** L'application est conçue principalement pour un usage sur ordinateur de bureau (Desktop). Cependant, elle DOIT être 100% responsive. Sur les petits écrans (mobile/tablette) :
1. La Sidebar doit disparaître au profit d'un menu "Burger" (Drawer Material UI).
2. La grille (3 colonnes) doit se transformer en une seule colonne (empilement vertical des cartes et des graphiques).
---

## 1. Barre de Navigation Latérale (Sidebar - Vue RH)
Puisque le Responsable RH n'a qu'un rôle d'analyse, sa barre latérale doit être extrêmement épurée.

**Lien principal (Unique) :**
- 📊 Dashboard (Page actuelle, active)

**Actions Utilisateur (En bas de la Sidebar ou dans l'en-tête) :**
- 👤 Mon Profil (Redirige vers la page de profil)
- 🚪 Déconnexion (Met fin à la session Supabase et renvoie au Login)

*(Note pour l'IA : Ne code pas les autres liens visibles sur la capture d'écran de référence pour ce rôle).*

---