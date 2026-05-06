import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FileManagerService } from 'src/app/pages/filemanager/filemanager.service';

@Component({
    selector: 'app-uploads',
    templateUrl: './uploads.component.html',
    styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit {

    breadCrumbItems: Array<{}>;
    files: File[] = [];
    isLoading = false;

    constructor(private router: Router, private fileManagerService: FileManagerService) {}

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form File Upload', active: true }];
    }

    onSelect(event: any): void {
        this.files.push(...event.addedFiles);
    }

    onRemove(index: number): void {
        this.files.splice(index, 1);
    }

    uploadFiles(): void {
        if (this.files.length === 0) { Swal.fire('Erreur', 'Aucun fichier sélectionné', 'error'); return; }
        this.isLoading = true;
        const uploadAll = this.files.map(file => this.fileManagerService.upload(file));
        let completed = 0;
        uploadAll.forEach(obs => {
            obs.subscribe({
                next: () => {
                    completed++;
                    if (completed === uploadAll.length) {
                        this.isLoading = false;
                        Swal.fire('Succès', 'Fichiers téléchargés avec succès !', 'success')
                            .then(() => this.router.navigate(['/filemanager']));
                    }
                },
                error: () => {
                    this.isLoading = false;
                    Swal.fire('Erreur', 'Erreur lors du téléchargement', 'error');
                }
            });
        });
    }
}
