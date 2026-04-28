import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-filemanager',
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit {

    breadCrumbItems: Array<{}>;
    files: Array<{ name: string; dateModified: string; size: string }> = [];
    isLoading = true;
    searchKeyword = '';

    private readonly API = 'http://localhost:8090/api/files';

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Apps' }, { label: 'File Manager', active: true }];
        this.loadFiles();
    }

    loadFiles(): void {
        this.isLoading = true;
        this.http.get<string[]>(`${this.API}/all`).subscribe({
            next: data => {
                this.files = data.map(f => ({ name: f, dateModified: new Date().toLocaleDateString(), size: 'Unknown' }));
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
        });
    }

    searchFiles(): void {
        if (!this.searchKeyword.trim()) { this.loadFiles(); return; }
        this.isLoading = true;
        const params = new HttpParams().set('keywords', this.searchKeyword);
        this.http.get<string[]>(`${this.API}/search`, { params }).subscribe({
            next: data => {
                this.files = data.map(f => ({ name: f, dateModified: new Date().toLocaleDateString(), size: 'Unknown' }));
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
        });
    }

    deleteAllFiles(): void {
        Swal.fire({ title: 'Confirmation', text: 'Supprimer tous les fichiers ?', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Oui, supprimer' })
            .then(result => {
                if (!result.isConfirmed) return;
                this.http.delete(`${this.API}/deleteAll`).subscribe({
                    next: () => { this.files = []; Swal.fire('Supprimé', 'Tous les fichiers supprimés.', 'success'); },
                    error: () => Swal.fire('Erreur', 'Échec de la suppression.', 'error')
                });
            });
    }

    deleteFile(fileName: string): void {
        Swal.fire({ title: 'Confirmation', text: `Supprimer ${fileName} ?`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Oui' })
            .then(result => {
                if (!result.isConfirmed) return;
                const params = new HttpParams().set('filename', fileName);
                this.http.delete(`${this.API}/delete`, { params }).subscribe({
                    next: () => { this.files = this.files.filter(f => f.name !== fileName); Swal.fire('Supprimé', '', 'success'); },
                    error: () => Swal.fire('Erreur', 'Échec de la suppression.', 'error')
                });
            });
    }

    openFile(fileName: string): void {
        window.open(`${this.API}/view?filename=${fileName}`, '_blank');
    }

    getFileIcon(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'mdi mdi-file-pdf text-danger';
        if (ext === 'doc' || ext === 'docx') return 'mdi mdi-file-word text-primary';
        if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) return 'mdi mdi-file-image text-muted';
        return 'mdi mdi-file-document text-dark';
    }
}
