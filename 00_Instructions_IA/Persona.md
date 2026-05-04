# Personas du Projet - Système de Gestion RH

Ce document définit les profils types d'utilisateurs pour guider la génération de l'interface (UI) et de la logique métier (UX).

## 1. L'Administrateur : "L'Opératrice Efficace"
*   **Profil :** Sophie, Secrétaire Administrative.
*   **Contexte d'utilisation :** Utilisation intensive sur PC de bureau tout au long de la journée.
*   **Besoins techniques :** 
    - Rapidité d'exécution.
    - Tableaux de données puissants avec filtres.
    - **Actions groupées (Bulk actions)** : Pouvoir valider ou refuser 20 demandes de congés en une seule sélection.
*   **Comportement :** Elle gère les données de base (employés, services) et traite les flux entrants. Elle n'a pas besoin de notifications intrusives, car elle consulte l'outil régulièrement par routine.

## 2. Le Responsable RH : "Le Superviseur Stratégique"
*   **Profil :** Marc, Directeur des Ressources Humaines.
*   **Contexte d'utilisation :** Consultation ponctuelle sur écran large.
*   **Besoins techniques :** 
    - Vision macroscopique (Dashboard).
    - Simplicité de lecture : "En un coup d'œil, je veux voir qui est absent aujourd'hui".
    - Pas d'édition de données, uniquement de la consultation.
*   **Comportement :** Il cherche des tendances globales (ex: pics d'absentéisme par département) pour la prise de décision.

## 3. L'Utilisateur : "L'Employé Autonome"
*   **Profil :** Thomas, Collaborateur.
*   **Contexte d'utilisation :** Web (Navigateur PC/Laptop).
*   **Besoins techniques :** 
    - Interface épurée et sans distraction.
    - Affichage direct du solde (ex: "Il vous reste 12 jours").
    - Formulaire de demande de congé rapide.
*   **Comportement :** Il ne veut pas comprendre la complexité du calcul des 2,5 jours/mois. Il veut juste voir son solde final et savoir si sa demande est "En attente" ou "Validée".
