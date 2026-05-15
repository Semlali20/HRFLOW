import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  files: File[] = [];

  constructor(
    private router: Router,
    private collaborateurService: CollaborateurService,
    private confirmSvc: ConfirmService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form File Upload', active: true }];
  }

  async onSelect(event: any): Promise<void> {
    const file = event.addedFiles[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (file && validTypes.includes(file.type)) {
      this.files.push(file);
    } else {
      await this.confirmSvc.alert(this.translate.instant('FORM_IMPORT.INVALID_FILE_TYPE'), this.translate.instant('FORM_IMPORT.INVALID_FILE_TITLE'), 'error');
    }
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  async onUpload(): Promise<void> {
    if (this.files.length === 0) {
      await this.confirmSvc.alert(this.translate.instant('FORM_IMPORT.NO_FILE'), this.translate.instant('FORM_IMPORT.NO_FILE_TITLE'), 'error');
      return;
    }
    this.collaborateurService.importFromExcel(this.files[0]).subscribe({
      next: async () => {
        await this.confirmSvc.alert(this.translate.instant('FORM_IMPORT.SUCCESS'), this.translate.instant('FORM_IMPORT.SUCCESS_TITLE'), 'success');
        this.router.navigate(['/collaborateur']);
      },
      error: async () => await this.confirmSvc.alert(this.translate.instant('FORM_IMPORT.ERROR'), this.translate.instant('FORM_IMPORT.ERROR_TITLE'), 'error'),
    });
  }
}
