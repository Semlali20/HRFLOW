package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@SQLRestriction("is_deleted = false")
public class Collaborateurs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Matricule")
    private  Long  matricule;

    @Column(name = "nom")
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "Sexe")
    private String Sexe;

    @Column(name = "CIN")
    private String CIN;

    @Column(name = "Nationalité")
    private String Nationalité;

    @Column(name = "CATEGORIE")
    private String CATEGORIE;

    @Column(name = "age")
    private int age;

    @Column(name = "date de naissance")
    private String date_naissance;
    @Column(name = "email")
    private String email;

    @Column(name = "FILIALE")
    private String FILIALE;

    @Column(name = "Type de contrat")
    private String Type;

    @Column(name = "Département")
    private String Département;

    @Column(name = "Fonction")
    private String Fonction;

    @Column(name = "date d'entree")
    private String date_entree;

    @Column(name = "Ancienneté")
    private double Ancienneté;

    @Builder.Default
    private boolean isDeleted= false;

}
