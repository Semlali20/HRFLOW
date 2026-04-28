package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;


    @Column(name = "attestation_assurance")
    private boolean attestationAssurance;

    @Column(name = "carte_nationale")
    private boolean carteNationale;

    @Column(name = "fiche_anthropométrique")
    private boolean ficheAnthropométrique;

    @Column(name = "copie_certifiée_diplômes")
    private boolean copieCertifiéeDiplômes;

    @Column(name = "relevé_identité_bancaire")
    private boolean relevéIdentitéBancaire;

    @Column(name = "CV")
    private boolean cv;

    @Column(name = "convention_stage")
    private boolean conventionStage;

    @Column(name = "fiche_évaluation")
    private boolean ficheÉvaluation;

    @Column(name = "charte_engagement")
    private boolean charteEngagement;

    @Column(name = "attestation_stage")
    private boolean attestationStage;
}
