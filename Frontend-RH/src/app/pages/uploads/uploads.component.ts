import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-uploads',
    templateUrl: './uploads.component.html',
    styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit {

    breadCrumbItems: Array<{}>;
    files: File[] = [];
    isLoading = false;

    constructor(private router: Router, private http: HttpClient) {}

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
        const formData = new FormData();
        this.files.forEach(file => formData.append('files', file, file.name));
        this.http.post('http://localhost:8090/api/files/upload', formData).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire('Succès', 'Fichiers téléchargés avec succès !', 'success')
                    .then(() => this.router.navigate(['/filemanager']));
            },
            error: () => {
                this.isLoading = false;
                Swal.fire('Erreur', 'Erreur lors du téléchargement', 'error');
            }
        });
    }
}
