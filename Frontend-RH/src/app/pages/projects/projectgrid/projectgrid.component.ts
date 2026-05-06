import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';

@Component({
  selector: 'app-projectgrid',
  templateUrl: './projectgrid.component.html',
  styleUrls: ['./projectgrid.component.scss']
})
export class ProjectgridComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  stagiaireId: string;
  Stagiaires: any = {};
  documents: any[] = [];
  typeDeStageControl = new FormControl();
  typesDeStage: string[] = ['Stage d\'observation', 'Stage de pfa', 'Stage de projet fin d etude (PFE)'];

  validDocuments: Array<any> = [];
  notValidDocuments: Array<any> = [];
  showStatusMenu: boolean = false;
  status: string = 'En attente';
  statuses: string[] = ['Complete', 'En progression'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stagiaireService: StagiaireService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.stagiaireId = params['id'];
      if (this.stagiaireId) this.fetchStagiaireDetails();
    });
  }

  fetchStagiaireDetails() {
    this.stagiaireService.getById(Number(this.stagiaireId)).subscribe({
      next: data => {
        this.Stagiaires = data;
        this.Stagiaires.dateDébutStage = this.convertDateToISO(this.Stagiaires.dateDébutStage);
        this.Stagiaires.dateFinStage = this.convertDateToISO(this.Stagiaires.dateFinStage);
        const typeDeStage = data.typeDeStage.replace(/\s+/g, ' ').trim().toLowerCase();
        const normalizedTypes = this.typesDeStage.map(t => t.replace(/\s+/g, ' ').trim().toLowerCase());
        const matchIndex = normalizedTypes.indexOf(typeDeStage);
        if (matchIndex !== -1) this.typeDeStageControl.setValue(this.typesDeStage[matchIndex]);
        this.processDocuments();
        this.status = this.Stagiaires.status;
      },
      error: err => console.error('Failed to fetch stagiaire details:', err)
    });
  }

  convertDateToISO(dateTimeStr: string): string {
    return dateTimeStr ? dateTimeStr.split('T')[0] : '';
  }

  updateStagiaire() {
    const requiredFields = ['nom', 'prenom', 'cin', 'département', 'sujetDeStage', 'nomEncadrant', 'ecoleUniversité', 'typeDeStage', 'dateDébutStage', 'dateFinStage'];
    const emptyFields = requiredFields.filter(f => !this.Stagiaires[f]);
    if (emptyFields.length > 0) {
      Swal.fire({ icon: 'error', title: 'Erreur de validation', text: `Veuillez remplir tous les champs obligatoires: ${emptyFields.join(', ')}`, confirmButtonText: 'OK' });
      return;
    }
    this.validDocuments.forEach(doc => { this.Stagiaires[doc.key] = true; });
    this.notValidDocuments.forEach(doc => { this.Stagiaires[doc.key] = false; });
    this.stagiaireService.update(Number(this.stagiaireId), this.Stagiaires).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Les informations du stagiaire ont été mises à jour avec succès', confirmButtonText: 'OK' });
        this.router.navigate(['/stagiaires/list']);
      },
      error: err => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: `Erreur lors de la mise à jour du stagiaire: ${err.message}`, confirmButtonText: 'OK' });
      }
    });
  }

  convertISOToDate(isoDateStr: string): string {
    const [year, month, day] = isoDateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  ngAfterViewInit() {}

  editProfileImage() {
    if (this.fileInput) this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.Stagiaires.photo = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  toggleStatusMenu() {
    this.showStatusMenu = !this.showStatusMenu;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Terminé': return 'grey';
      case 'Complete': return 'green';
      case 'En progression': return 'orange';
      default: return 'grey';
    }
  }

  processDocuments(): void {
    const documentKeys = [
      { key: 'attestationAssurance', name: 'Attestation d\'Assurance' },
      { key: 'carteNationale', name: 'Carte Nationale' },
      { key: 'ficheAnthropométrique', name: 'Fiche Anthropométrique' },
      { key: 'copieCertifiéeDiplômes', name: 'Copie Certifiée des Diplômes' },
      { key: 'relevéIdentitéBancaire', name: 'Relevé d\'Identité Bancaire' },
      { key: 'cv', name: 'CV' },
      { key: 'conventionStage', name: 'Convention de Stage' },
      { key: 'ficheÉvaluation', name: 'Fiche d\'Évaluation' },
      { key: 'charteEngagement', name: 'Charte d\'Engagement' },
      { key: 'attestationStage', name: 'Attestation de Stage' }
    ];
    this.validDocuments = [];
    this.notValidDocuments = [];
    documentKeys.forEach(doc => {
      if (!!this.Stagiaires[doc.key]) this.validDocuments.push({ ...doc, isValid: true });
      else this.notValidDocuments.push({ ...doc, isValid: false });
    });
  }

  changeStatus(newStatus: string) {
    this.status = newStatus;
    this.Stagiaires.status = newStatus;
    this.toggleStatusMenu();
  }

  toggleDocumentValidity(doc: any) {
    const isValid = !!this.Stagiaires[doc.key];
    if (isValid) {
      this.Stagiaires[doc.key] = false;
      doc.isValid = false;
      this.validDocuments = this.validDocuments.filter(d => d.key !== doc.key);
      if (!this.notValidDocuments.some(d => d.key === doc.key)) this.notValidDocuments.push(doc);
    } else {
      this.Stagiaires[doc.key] = true;
      doc.isValid = true;
      this.notValidDocuments = this.notValidDocuments.filter(d => d.key !== doc.key);
      if (!this.validDocuments.some(d => d.key === doc.key)) this.validDocuments.push(doc);
    }
  }
}
