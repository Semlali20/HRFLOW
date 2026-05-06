import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CvService, CvApplication, KanbanStage, KANBAN_STAGES } from '../cv/cv.service';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { padding:0 24px 40px; font-family:'Inter',sans-serif; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px;}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0;}
    .header-right{display:flex;align-items:center;gap:12px;}
    .header-date{font-size:13px;color:#8FA3B8;display:flex;align-items:center;gap:6px;}
    .btn-primary{background:#1B7872;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;}
    .btn-primary:hover{background:#1A9690;}

    /* ── Stats Row ── */
    .stats-row{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-bottom:20px;}
    .stat-card{background:#fff;border-radius:10px;padding:16px 18px;box-shadow:0 4px 20px rgba(22,34,51,.08);}
    .stat-label{font-size:11.5px;color:#8FA3B8;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;}
    .stat-value{font-size:26px;font-weight:800;color:#1A2B3C;line-height:1;}

    /* ── Kanban Board ── */
    .kanban-board{display:flex;gap:14px;overflow-x:auto;padding-bottom:12px;}
    .kanban-col{min-width:240px;flex:1;background:#F8FAFC;border-radius:12px;display:flex;flex-direction:column;}
    .col-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid #EDF0F5;}
    .col-title{font-size:12px;font-weight:700;color:#4A6080;text-transform:uppercase;letter-spacing:.05em;}
    .col-count{background:#E2E8F0;color:#4A6080;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700;}
    .col-body{flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:200px;}

    /* ── Kanban Card ── */
    .k-card{background:#fff;border-radius:10px;padding:14px;box-shadow:0 2px 8px rgba(22,34,51,.06);cursor:pointer;transition:all .15s;border:1.5px solid transparent;}
    .k-card:hover{border-color:#2FA8A0;box-shadow:0 4px 16px rgba(47,168,160,.1);}
    .k-name{font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:3px;}
    .k-email{font-size:11.5px;color:#8FA3B8;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .k-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;}
    .k-offer{font-size:11px;background:#F1F5F9;color:#4A6080;padding:2px 8px;border-radius:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;}
    .k-date{font-size:10.5px;color:#B0BEC5;}

    /* ── Stage badges ── */
    .stage-NEW               {background:#DBEAFE;color:#1E40AF;}
    .stage-REVIEWING         {background:#FEF3C7;color:#92400E;}
    .stage-SHORTLISTED       {background:#D1FAE5;color:#065F46;}
    .stage-INTERVIEW_SCHEDULED{background:#EDE9FE;color:#6D28D9;}
    .stage-OFFERED           {background:#DCFCE7;color:#15803D;}
    .stage-REJECTED          {background:#FFE4E6;color:#BE123C;}

    /* ── State boxes ── */
    .state-box{padding:60px 0;text-align:center;color:#8FA3B8;font-size:14px;}
    .state-box i{font-size:36px;display:block;margin-bottom:10px;}
    .state-box--error{color:#EF4444;}
    .spinner{width:32px;height:32px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* ── Detail Panel ── */
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:480px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden;}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .rp-title{font-size:15px;font-weight:700;color:#1A2B3C;}
    .rp-close{width:30px;height:30px;border:none;background:#F1F5F9;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;color:#4A6080;}
    .rp-close:hover{background:#E2E8F0;}
    .rp-body{flex:1;overflow-y:auto;padding:20px 22px;}

    .dp-section{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px;}
    .dp-field{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #F5F7FA;}
    .dp-field:last-of-type{border-bottom:none;}
    .dp-lbl{display:flex;align-items:center;gap:7px;font-size:12px;color:#8FA3B8;}
    .dp-lbl i{font-size:14px;}
    .dp-val{font-size:13px;font-weight:600;color:#1A2B3C;}
    .dp-divider{border:none;border-top:1px solid #F0F3F6;margin:14px 0;}

    .stage-select{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;cursor:pointer;}
    .stage-select:focus{border-color:#2FA8A0;}

    .rp-footer{padding:14px 22px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px;}
    .btn-save{padding:10px 24px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-save:disabled{opacity:.5;cursor:default;}
    .btn-cancel{padding:10px 20px;background:#F1F5F9;color:#4A6080;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both;}

    /* ── Upload Panel ── */
    .upload-form{display:flex;flex-direction:column;gap:14px;}
    .form-field{display:flex;flex-direction:column;gap:5px;}
    .form-lbl{font-size:13px;font-weight:600;color:#1A2B3C;}
    .form-input{padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;transition:border .15s;}
    .form-input:focus{border-color:#2FA8A0;}
    .form-input::placeholder{color:#C0CDD8;}
    .file-drop{border:2px dashed #D1D5DB;border-radius:10px;padding:24px;text-align:center;cursor:pointer;color:#8FA3B8;font-size:13px;transition:border .15s;}
    .file-drop:hover{border-color:#2FA8A0;color:#2FA8A0;}
    .file-selected{font-size:12.5px;color:#1B7872;font-weight:600;margin-top:6px;}
  `],
  template: `
  <!-- Detail Panel backdrop -->
  <div class="backdrop" *ngIf="selected || showUpload" (click)="closeAll()"></div>

  <!-- ── CV Application Detail Panel ── -->
  <div class="rp" *ngIf="selected">
    <div class="rp-header">
      <span class="rp-title">CV Application</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <div class="dp-section">Candidate Information</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-user"></i> Name</span>
        <span class="dp-val">{{ selected.candidateName }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-envelope"></i> Email</span>
        <span class="dp-val">{{ selected.candidateEmail }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-file"></i> CV File</span>
        <span class="dp-val">{{ selected.cvFileName || '—' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar"></i> Submitted</span>
        <span class="dp-val">{{ selected.submittedAt | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>

      <hr class="dp-divider">

      <div class="dp-section">Offer</div>
      <div class="dp-field" *ngIf="selected.offer">
        <span class="dp-lbl"><i class="bx bx-briefcase"></i> Title</span>
        <span class="dp-val">{{ selected.offer.title }}</span>
      </div>
      <div class="dp-field" *ngIf="selected.offer">
        <span class="dp-lbl"><i class="bx bx-building"></i> Department</span>
        <span class="dp-val">{{ selected.offer.department }}</span>
      </div>
      <div class="dp-field" *ngIf="!selected.offer">
        <span class="dp-lbl"><i class="bx bx-info-circle"></i> Offer</span>
        <span class="dp-val" style="color:#8FA3B8;font-weight:400">No specific offer</span>
      </div>

      <hr class="dp-divider">

      <div class="dp-section">Kanban Stage</div>
      <select class="stage-select" [(ngModel)]="editStage">
        <option *ngFor="let s of stages" [value]="s">{{ s }}</option>
      </select>

      <div class="dp-field" style="margin-top:12px;">
        <span class="dp-lbl"><i class="bx bx-note"></i> Notes</span>
        <input class="form-input" [(ngModel)]="editNotes" [placeholder]="selected.notes || 'Add notes…'" style="width:100%;font-size:12.5px;" />
      </div>

    </div>
    <div class="rp-footer">
      <button class="btn-cancel" (click)="closeAll()">Cancel</button>
      <button class="btn-save" [disabled]="saving" (click)="saveStage()">Save</button>
    </div>
  </div>

  <!-- ── Upload CV Panel ── -->
  <div class="rp" *ngIf="showUpload">
    <div class="rp-header">
      <span class="rp-title">Upload CV</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">
      <div class="upload-form">
        <div class="form-field">
          <label class="form-lbl">Candidate Name *</label>
          <input class="form-input" [(ngModel)]="uploadForm.name" placeholder="Full name" />
        </div>
        <div class="form-field">
          <label class="form-lbl">Candidate Email *</label>
          <input class="form-input" [(ngModel)]="uploadForm.email" type="email" placeholder="email@example.com" />
        </div>
        <div class="form-field">
          <label class="form-lbl">Stage Offer (optional)</label>
          <select class="stage-select" [(ngModel)]="uploadForm.offerId">
            <option [ngValue]="null">No specific offer</option>
            <option *ngFor="let o of offers" [ngValue]="o.id">{{ o.title }} — {{ o.department }}</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-lbl">CV File (PDF/DOC) *</label>
          <label class="file-drop">
            <i class="bx bx-upload" style="font-size:28px;display:block;margin-bottom:8px;"></i>
            Click to select CV file
            <input type="file" style="display:none" accept=".pdf,.doc,.docx" (change)="onFileSelect($event)" />
          </label>
          <div class="file-selected" *ngIf="uploadForm.file">{{ uploadForm.file.name }}</div>
        </div>
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn-cancel" (click)="closeAll()">Cancel</button>
      <button class="btn-save" [disabled]="uploading || !uploadForm.file || !uploadForm.name || !uploadForm.email" (click)="submitUpload()">
        <i class="bx bx-upload"></i> {{ uploading ? 'Uploading…' : 'Upload CV' }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <!-- ══════════ Page ══════════ -->
  <div class="page">
    <div class="page-header">
      <h4 class="page-title">Recruitment &amp; CV Kanban</h4>
      <div class="header-right">
        <span class="header-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
        <button class="btn-primary" (click)="showUpload = true; selected = null">
          <i class="bx bx-upload"></i> Upload CV
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card" *ngFor="let s of stages">
        <div class="stat-label">{{ s | titlecase }}</div>
        <div class="stat-value">{{ countStage(s) }}</div>
      </div>
    </div>

    <!-- Loading -->
    <div class="state-box" *ngIf="loading">
      <div class="spinner"></div>Loading applications…
    </div>

    <!-- Error -->
    <div class="state-box state-box--error" *ngIf="!loading && error">
      <i class="bx bx-error-circle"></i>{{ error }}
      <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="load()">Retry</button>
    </div>

    <!-- Kanban -->
    <div class="kanban-board" *ngIf="!loading && !error">
      <div class="kanban-col" *ngFor="let stage of stages">
        <div class="col-header">
          <span class="col-title">{{ stageName(stage) }}</span>
          <span class="col-count">{{ countStage(stage) }}</span>
        </div>
        <div class="col-body">
          <div class="k-card" *ngFor="let app of byStage(stage)" (click)="openDetail(app)">
            <div class="k-name">{{ app.candidateName }}</div>
            <div class="k-email">{{ app.candidateEmail }}</div>
            <div class="k-meta">
              <span class="k-offer">{{ app.offer?.title || 'Open' }}</span>
              <span class="k-date">{{ app.submittedAt | date:'dd/MM/yy' }}</span>
            </div>
          </div>
          <div *ngIf="byStage(stage).length === 0" style="padding:16px;text-align:center;font-size:12px;color:#CBD5E0">
            No candidates
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class RecruitmentComponent implements OnInit {

  today = new Date();
  stages: KanbanStage[] = [...KANBAN_STAGES];

  applications: CvApplication[] = [];
  offers: any[] = [];
  loading = false;
  error: string | null = null;
  saving = false;
  uploading = false;
  toast: string | null = null;

  selected: CvApplication | null = null;
  editStage: KanbanStage = 'NEW';
  editNotes = '';

  showUpload = false;
  uploadForm: { name: string; email: string; offerId: number | null; file: File | null } = this.emptyUpload();

  constructor(private cvService: CvService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = null;
    this.cvService.getAllApplications().subscribe({
      next: data => { this.applications = data; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Failed to load applications.'; this.loading = false; }
    });
    this.cvService.getAllOffers().subscribe({
      next: data => this.offers = data,
      error: () => {}
    });
  }

  byStage(stage: KanbanStage): CvApplication[] {
    return this.applications.filter(a => a.stage === stage);
  }

  countStage(stage: KanbanStage): number {
    return this.applications.filter(a => a.stage === stage).length;
  }

  stageName(s: KanbanStage): string {
    const map: Record<KanbanStage, string> = {
      NEW: 'New', REVIEWING: 'Reviewing', SHORTLISTED: 'Shortlisted',
      INTERVIEW_SCHEDULED: 'Interview', OFFERED: 'Offered', REJECTED: 'Rejected'
    };
    return map[s] ?? s;
  }

  openDetail(app: CvApplication): void {
    this.selected = app;
    this.editStage = app.stage;
    this.editNotes = app.notes || '';
    this.showUpload = false;
  }

  saveStage(): void {
    if (!this.selected) return;
    this.saving = true;
    this.cvService.updateStage(this.selected.id, this.editStage, this.editNotes).subscribe({
      next: updated => {
        this.applications = this.applications.map(a => a.id === updated.id ? updated : a);
        this.selected = null;
        this.saving = false;
        this.showToast('Stage updated.');
      },
      error: err => { this.saving = false; this.showToast(err?.error?.message || 'Failed to update.'); }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.uploadForm.file = input.files[0];
  }

  submitUpload(): void {
    if (!this.uploadForm.file || !this.uploadForm.name || !this.uploadForm.email) return;
    this.uploading = true;
    this.cvService.uploadCv(
      this.uploadForm.file,
      this.uploadForm.name,
      this.uploadForm.email,
      this.uploadForm.offerId ?? undefined
    ).subscribe({
      next: app => {
        this.applications = [app, ...this.applications];
        this.closeAll();
        this.uploading = false;
        this.showToast('CV uploaded successfully.');
      },
      error: err => { this.uploading = false; this.showToast(err?.error?.message || 'Upload failed.'); }
    });
  }

  closeAll(): void {
    this.selected = null;
    this.showUpload = false;
    this.uploadForm = this.emptyUpload();
  }

  private emptyUpload() {
    return { name: '', email: '', offerId: null as number | null, file: null as File | null };
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
