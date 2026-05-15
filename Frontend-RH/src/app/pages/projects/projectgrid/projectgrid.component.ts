import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateService } from '@ngx-translate/core';

const DOC_KEY_TO_ENUM: Record<string, string> = {
  attestationAssurance:    'ATTESTATION_ASSURANCE',
  carteNationale:          'CARTE_NATIONALE',
  ficheAnthropométrique:   'FICHE_ANTHROPOMETRIQUE',
  copieCertifiéeDiplômes:  'COPIE_CERTIFIEE_DIPLOMES',
  relevéIdentitéBancaire:  'RELEVE_IDENTITE_BANCAIRE',
  cv:                      'CV',
  conventionStage:         'CONVENTION_STAGE',
  ficheÉvaluation:         'FICHE_EVALUATION',
  charteEngagement:        'CHARTE_ENGAGEMENT',
  attestationStage:        'ATTESTATION_STAGE',
};

const LABEL_TO_STATUS: Record<string, string> = {
  'Complete':       'COMPLETED',
  'En progression': 'ACTIVE',
  'En attente':     'PENDING',
  'Terminé':        'COMPLETED',
};

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
  backendDocs: any[] = [];
  typeDeStageControl = new FormControl();
  typesDeStage: string[] = ['Stage d\'observation', 'Stage de pfa', 'Stage de projet fin d etude (PFE)'];

  validDocuments: Array<any> = [];
  notValidDocuments: Array<any> = [];
  showStatusMenu: boolean = false;
  status: string = 'En attente';
  statuses: string[] = ['Complete', 'En progression'];
  savingStatus = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stagiaireService: StagiaireService,
    private confirmSvc: ConfirmService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.stagiaireId = params['id'];
      if (this.stagiaireId) this.fetchStagiaireDetails();
    });
  }

  fetchStagiaireDetails() {
    const id = Number(this.stagiaireId);
    forkJoin({
      intern: this.stagiaireService.getById(id),
      docs:   this.stagiaireService.getDocuments(id),
    }).subscribe({
      next: ({ intern, docs }) => {
        this.Stagiaires = intern;
        this.Stagiaires.dateDébutStage = this.convertDateToISO(this.Stagiaires.dateDébutStage);
        this.Stagiaires.dateFinStage = this.convertDateToISO(this.Stagiaires.dateFinStage);
        const typeDeStage = (intern.typeDeStage || '').replace(/\s+/g, ' ').trim().toLowerCase();
        const normalizedTypes = this.typesDeStage.map(t => t.replace(/\s+/g, ' ').trim().toLowerCase());
        const matchIndex = normalizedTypes.indexOf(typeDeStage);
        if (matchIndex !== -1) this.typeDeStageControl.setValue(this.typesDeStage[matchIndex]);
        this.backendDocs = docs;
        this.mergeBackendDocs(docs);
        this.processDocuments();
        this.status = this.Stagiaires.status;
      },
      error: err => console.error('Failed to fetch stagiaire details:', err)
    });
  }

  private mergeBackendDocs(docs: any[]): void {
    docs.forEach(d => {
      const key = Object.keys(DOC_KEY_TO_ENUM).find(k => DOC_KEY_TO_ENUM[k] === d.documentType);
      if (key) this.Stagiaires[key] = d.submitted;
    });
  }

  convertDateToISO(dateTimeStr: string): string {
    return dateTimeStr ? dateTimeStr.split('T')[0] : '';
  }

  async updateStagiaire(): Promise<void> {
    const requiredFields = ['nom', 'prenom', 'cin', 'département', 'sujetDeStage', 'nomEncadrant', 'ecoleUniversité', 'typeDeStage', 'dateDébutStage', 'dateFinStage'];
    const emptyFields = requiredFields.filter(f => !this.Stagiaires[f]);
    if (emptyFields.length > 0) {
      await this.confirmSvc.alert(`${this.translate.instant('INTERNS.VALIDATION_REQUIRED')}: ${emptyFields.join(', ')}`, this.translate.instant('INTERNS.VALIDATION_ERROR_TITLE'), 'error');
      return;
    }
    this.validDocuments.forEach(doc => { this.Stagiaires[doc.key] = true; });
    this.notValidDocuments.forEach(doc => { this.Stagiaires[doc.key] = false; });
    this.stagiaireService.update(Number(this.stagiaireId), this.Stagiaires).subscribe({
      next: async () => {
        this.syncDocumentsToBackend();
        await this.confirmSvc.alert(this.translate.instant('INTERNS.UPDATE_SUCCESS'), this.translate.instant('INTERNS.SUCCESS_TITLE'), 'success');
        this.router.navigate(['/stagiaires/list']);
      },
      error: async err => {
        await this.confirmSvc.alert(`${this.translate.instant('INTERNS.UPDATE_ERROR')}: ${err.message}`, this.translate.instant('INTERNS.ERROR_TITLE'), 'error');
      }
    });
  }

  private syncDocumentsToBackend(): void {
    const id = Number(this.stagiaireId);
    Object.keys(DOC_KEY_TO_ENUM).forEach(key => {
      const enumVal = DOC_KEY_TO_ENUM[key];
      const submitted = !!this.Stagiaires[key];
      const backendDoc = this.backendDocs.find(d => d.documentType === enumVal);
      this.stagiaireService.updateDocument(id, {
        documentType: enumVal,
        submitted,
        submittedDate: submitted ? new Date().toISOString().split('T')[0] : null,
        version: backendDoc?.version ?? null,
      }).subscribe({ error: e => console.warn(`Doc sync failed for ${key}:`, e) });
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

  async changeStatus(newStatus: string): Promise<void> {
    const backendStatus = LABEL_TO_STATUS[newStatus] ?? newStatus;
    this.savingStatus = true;
    this.stagiaireService.updateStatus(Number(this.stagiaireId), backendStatus).subscribe({
      next: () => {
        this.status = newStatus;
        this.Stagiaires.status = newStatus;
        this.savingStatus = false;
        this.toggleStatusMenu();
      },
      error: async err => {
        this.savingStatus = false;
        console.error('Status update failed:', err);
        await this.confirmSvc.alert(this.translate.instant('INTERNS.STATUS_UPDATE_ERROR'), this.translate.instant('INTERNS.ERROR_TITLE'), 'error');
      }
    });
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
