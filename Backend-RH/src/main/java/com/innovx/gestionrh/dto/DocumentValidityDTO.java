package com.innovx.gestionrh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentValidityDTO {
    private Long matricule;
    private boolean attestationAssurance;
    private boolean carteNationale;
    private boolean ficheAnthropométrique;
    private boolean copieCertifiéeDiplômes;
    private boolean relevéIdentitéBancaire;
    private boolean cv;
    private boolean conventionStage;
    private boolean ficheÉvaluation;
    private boolean charteEngagement;
    private boolean attestationStage;

    // Constructors, Getters, and Setters
}
