import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FileManagerService } from 'src/app/pages/filemanager/filemanager.service';
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
    isLoading = false;

    constructor(
        private router: Router,
        private fileManagerService: FileManagerService,
        private confirmSvc: ConfirmService,
        private translate: TranslateService,
    ) {}

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form File Upload', active: true }];
    }

    onSelect(event: any): void {
        this.files.push(...event.addedFiles);
    }

    onRemove(index: number): void {
        this.files.splice(index, 1);
    }

    async uploadFiles(): Promise<void> {
        if (this.files.length === 0) {
            await this.confirmSvc.alert(this.translate.instant('UPLOADS.TOAST_NO_FILE'), this.translate.instant('UPLOADS.TOAST_ERROR_TITLE'), 'error');
            return;
        }
        this.isLoading = true;
        const uploadAll = this.files.map(file => this.fileManagerService.upload(file));
        let completed = 0;
        uploadAll.forEach(obs => {
            obs.subscribe({
                next: async () => {
                    completed++;
                    if (completed === uploadAll.length) {
                        this.isLoading = false;
                        await this.confirmSvc.alert(this.translate.instant('UPLOADS.TOAST_SUCCESS'), this.translate.instant('UPLOADS.TOAST_SUCCESS_TITLE'), 'success');
                        this.router.navigate(['/filemanager']);
                    }
                },
                error: async () => {
                    this.isLoading = false;
                    await this.confirmSvc.alert(this.translate.instant('UPLOADS.TOAST_ERROR'), this.translate.instant('UPLOADS.TOAST_ERROR_TITLE'), 'error');
                }
            });
        });
    }
}
