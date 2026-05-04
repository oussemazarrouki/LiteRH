@startuml
skinparam handwritten false
skinparam monochrome true
skinparam packageStyle rectangle
skinparam defaultFontName "Inter"

' Organisation de l'affichage de gauche à droite
left to right direction

' --- 1. Acteurs du Système ---
actor "Administrateur" as Admin
actor "Responsable RH" as RH
actor "Utilisateur (Employé)" as Employe

' --- Système de Gestion RH ---

    ' --- 2. Cas d'Utilisation Communs ---
        usecase "Authentification" as UC00
    

    ' --- 3A. Administration ---
    
        usecase "Gérer les employés" as UC01
        usecase "Gérer les services" as UC02
        usecase "Gérer les départements" as UC03
        usecase "Gérer les absences" as UC04
        usecase "Gérer les jours fériés" as UC05
        usecase "Gérer les types de congés" as UC06
        usecase "Approuver/Rejeter les demandes" as UC07
    

    ' --- 3B. Ressources Humaines ---
    
        usecase "Consulter le tableau de bord" as UC08
    

    ' --- 3C. Employé (Self-Service) ---
        usecase "Consulter profil" as UC09
        usecase "Soumettre demande de congé" as UC10
        usecase "Consulter solde de congés" as UC11
        usecase "Consulter historique absences" as UC12
    


' --- Relations Acteurs <-> Cas d'Utilisation ---

' Authentification commune à tous
Admin --> UC00
RH --> UC00
Employe --> UC00

' Relations Administrateur
Admin --> UC01
Admin --> UC02
Admin --> UC03
Admin --> UC04
Admin --> UC05
Admin --> UC06
Admin --> UC07

' Relations Responsable RH
RH --> UC08

' Relations Utilisateur (Employé)
Employe --> UC09
Employe --> UC10
Employe --> UC11
Employe --> UC12

@enduml