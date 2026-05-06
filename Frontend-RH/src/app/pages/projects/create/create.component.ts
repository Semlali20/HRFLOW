import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { StagiaireCreateDto } from 'src/app/core/models/hr.models';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  stagiaireName: string = '';
  prenom: string = '';
  cin: string = '';
  departement: string = '';
  sujetDeStage: string = '';
  universite: string = '';
  typeDeStage: string = '';
  startDate: string = '';
  endDate: string = '';
  status: string = '';
  collaborateurs: any[] = [];
  selectedCollaborateur: any = null;
  selectedCollaborateurFullName: string | null = null;
  imageURL: any;
  selectedFiles: File[] = [];

  documents = [
    { id: 'cv', label: 'CV', isValid: false },
    { id: 'attestationAssurance', label: 'Attestation d\'Assurance', isValid: false },
    { id: 'carteNationale', label: 'Carte Nationale', isValid: false },
    { id: 'ficheAnthropometrique', label: 'Fiche Anthropométrique', isValid: false },
    { id: 'copieCertifieeDiplomes', label: 'Copie Certifiée des Diplômes', isValid: false },
    { id: 'releveIdentiteBancaire', label: 'Relevé d\'Identité Bancaire', isValid: false },
    { id: 'conventionStage', label: 'Convention de Stage', isValid: false },
    { id: 'ficheEvaluation', label: 'Fiche d\'Évaluation', isValid: false },
    { id: 'charteEngagement', label: 'Charte d\'Engagement', isValid: false },
    { id: 'attestationStage', label: 'Attestation de Stage', isValid: false }
  ];

  constructor(
    private router: Router,
    private collaborateurService: CollaborateurService,
    private stagiaireService: StagiaireService
  ) {}

  ngOnInit() {
    this.fetchCollaborateurs();
  }

  onRemove(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  onSelect(event: any) {
    this.selectedFiles.push(...event.addedFiles);
  }

  selectImage() {
    const inputElement = document.getElementById('project-image-input') as HTMLInputElement;
    inputElement.click();
  }

  displayImage(event: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.imageURL = e.target.result; };
      reader.readAsDataURL(inputElement.files[0]);
    }
  }

  fetchCollaborateurs() {
    this.collaborateurService.getAll().subscribe({
      next: data => {
        this.collaborateurs = data.map(c => ({ id: c.matricule, fullName: `${c.nom} ${c.prenom}` }));
      },
      error: err => console.error('Error fetching collaborateurs:', err)
    });
  }

  onCollaborateurSelect(event: any) {
    this.selectedCollaborateurFullName = event.fullName;
  }

  onSubmit() {
    if (!this.selectedCollaborateurFullName) {
      console.error('No collaborator selected or name is missing.');
      return;
    }
    const jsonData = {
      nom: this.stagiaireName,
      prenom: this.prenom,
      cin: this.cin,
      département: this.departement,
      sujetDeStage: this.sujetDeStage,
      ecoleUniversité: this.universite,
      typeDeStage: this.typeDeStage,
      dateDébutStage: this.startDate,
      dateFinStage: this.endDate,
      status: this.status,
      nomEncadrant: this.selectedCollaborateurFullName,
      photo: this.imageURL,
      attestationAssurance: this.documents.find(d => d.id === 'attestationAssurance')?.isValid || false,
      carteNationale: this.documents.find(d => d.id === 'carteNationale')?.isValid || false,
      ficheAnthropométrique: this.documents.find(d => d.id === 'ficheAnthropometrique')?.isValid || false,
      copieCertifiéeDiplômes: this.documents.find(d => d.id === 'copieCertifieeDiplomes')?.isValid || false,
      relevéIdentitéBancaire: this.documents.find(d => d.id === 'releveIdentiteBancaire')?.isValid || false,
      cv: this.documents.find(d => d.id === 'cv')?.isValid || false,
      conventionStage: this.documents.find(d => d.id === 'conventionStage')?.isValid || false,
      ficheÉvaluation: this.documents.find(d => d.id === 'ficheEvaluation')?.isValid || false,
      charteEngagement: this.documents.find(d => d.id === 'charteEngagement')?.isValid || false,
      attestationStage: this.documents.find(d => d.id === 'attestationStage')?.isValid || false
    };
    this.stagiaireService.create(jsonData as StagiaireCreateDto).subscribe({
      next: () => Swal.fire({ title: 'Success!', text: 'Stagiaire created successfully', icon: 'success', confirmButtonText: 'OK' })
        .then(result => { if (result.value) this.router.navigate(['/stagiaires/list']); }),
      error: err => console.error('Error creating stagiaire', err)
    });
  }
}
