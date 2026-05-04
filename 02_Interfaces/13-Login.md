# Interface : Page de Connexion (Login)

## ⚠️ DIRECTIVES STRICTES POUR L'IA (CLAUDE)
**Image de référence :** AUCUNE. Utiliser le `design_system.md` et le `Theme.js`.
**STYLE UI/UX (Enterprise Standard) :** Concevoir une page de connexion moderne, idéalement en "Split-Screen" sur Desktop (50% de l'écran avec une couleur pleine/gradient/illustration discrète du thème, et 50% avec le formulaire centré). Sur mobile, le formulaire prend 100% de l'espace.
**EXCLUSIONS FORMELLES (RÈGLES MÉTIER) :** 
1. **AUCUN** lien "Créer un compte" ou "S'inscrire" (Système interne fermé).
2. **AUCUN** lien "Mot de passe oublié" (La réinitialisation se fait uniquement par l'Administrateur).
3. **AUCUNE** icône de Chatbot.
**THÈME :** Le bouton de bascule Dark/White mode doit être discrètement placé en haut à droite de l'écran.

---

## 1. Zone Formulaire (Contenu Principal)
Créer un conteneur centré (ou dans la partie droite du split-screen) avec les éléments suivants :

### A. En-tête du formulaire
- **Logo / Nom de l'application :** Afficher le nom de l'application (ex: JUMPARK) en typographie `h4` ou `h3` avec la police principale du thème.
- **Sous-titre :** "Veuillez vous connecter à votre espace." (Typographie `body1`, couleur secondaire).

### B. Champs de saisie (MUI TextFields)
Le formulaire doit mapper strictement les identifiants de Supabase Auth et de la table `Employe`.
1. **Email :** 
   - Type : `email`
   - Requis : Oui
   - Placeholder : "votre.email@entreprise.com"
2. **Mot de passe :** 
   - Type : `password`
   - Requis : Oui
   - Ajouter l'icône MUI "œil" (`visibility / visibility_off`) en fin de champ pour afficher/masquer le mot de passe.

### C. Actions
- **Bouton de validation :** Bouton "Se connecter" (`variant="contained"`, couleur `primary`, `fullWidth` pour prendre toute la largeur du formulaire, taille `large`).
- **État de chargement :** Au clic, le bouton doit afficher un indicateur de chargement (Spinner MUI) et être désactivé pendant la requête.

---

## 2. Logique Backend & Redirection (Supabase)

L'IA doit implémenter la logique d'authentification suivante :
1. **Authentification :** Utiliser `supabase.auth.signInWithPassword({ email, password })`.
2. **Gestion d'erreur :** Si l'authentification échoue (mauvais email ou mot de passe), afficher une **MUI Alert** ou **Snackbar** rouge (`error`) au-dessus du formulaire : *"Identifiants incorrects. Veuillez réessayer."*
3. **Récupération du Rôle :** Si le login réussit, récupérer les informations de l'employé depuis la table publique `Employe` (via l'ID de l'utilisateur authentifié) pour connaître son `role` (ADMIN, RH, EMPLOYE).
4. **Routage Dynamique (Redirection post-login) :**
   - Si `role === 'ADMIN'` ➔ Rediriger vers `/admin/personnel`
   - Si `role === 'RH'` ➔ Rediriger vers `/rh/dashboard`
   - Si `role === 'EMPLOYE'` ➔ Rediriger vers `/employe/profil`