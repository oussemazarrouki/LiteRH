@startuml
skinparam handwritten false
skinparam monochrome true
skinparam packageStyle rect
skinparam defaultFontName "Inter"

class Departement {
    - id : UUID
    - nom : String
    + ajouter() : void
    + modifier() : void
    + supprimer() : void
}

class Service {
    - id : UUID
    - nom : String
    - id_departement : UUID
    + ajouter() : void
    + modifier() : void
    + supprimer() : void
}

class Employe {
    - id : UUID
    - matricule : String
    - nom : String
    - prenom : String
    - email : String
    - mot_de_passe : String
    - role : Enum {ADMIN, RH, EMPLOYE}
    - solde_conge : Float
    - id_service : UUID
    + authentifier() : boolean
    + ajouter() : void
    + modifier() : void
    + supprimer() : void
}

class TypeConge {
    - id : UUID
    - label : String
    - est_deductible : boolean
    + ajouter() : void
    + modifier() : void
    + supprimer() : void
}

class DemandeConge {
    - id : UUID
    - id_employe : UUID
    - id_type : UUID
    - date_debut : Date
    - date_fin : Date
    - statut : Enum {ATTENTE, VALIDE, REFUSE}
    - commentaire : String
    + soumettre() : void
    + approuver() : void
    + rejeter() : void
}

class Absence {
    - id : UUID
    - id_employe : UUID
    - date_debut : Date
    - date_fin : Date
    - motif : String
    + ajouter() : void
    + modifier() : void
    + supprimer() : void
}

class JourFerie {
    - id : UUID
    - nom : String
    - date : Date
    + ajouter() : void
    + modifier() : void
    + supprimer() : void
}

' --- Relations ---

' Hiérarchie organisationnelle
Departement "1" *-- "0..*" Service : contient >
Service "1" -- "0..*" Employe : regroupe >

' Activités de l'employé
Employe "1" -- "0..*" DemandeConge : sollicite >
Employe "1" -- "0..*" Absence : enregistre >

' Typologie et calculs
TypeConge "1" -- "0..*" DemandeConge : catégorise >
DemandeConge ..> JourFerie : <<use>> consulte pour calcul durée

@enduml