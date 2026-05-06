import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FileManagerService } from './filemanager.service';
import { ManagedFile } from 'src/app/core/models/hr.models';

@Component({
    selector: 'app-filemanager',
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit {

    today = new Date();
    breadCrumbItems: Array<{}>;
    files: ManagedFile[] = [];
    isLoading = true;
    searchKeyword = '';

    constructor(private fileManagerService: FileManagerService) {}

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Apps' }, { label: 'File Manager', active: true }];
        this.loadFiles();
    }

    loadFiles(): void {
        this.isLoading = true;
        this.fileManagerService.getAll().subscribe({
            next: data => { this.files = data; this.isLoading = false; },
            error: () => { this.isLoading = false; }
        });
    }

    searchFiles(): void {
        if (!this.searchKeyword.trim()) { this.loadFiles(); return; }
        this.isLoading = true;
        this.fileManagerService.search(this.searchKeyword).subscribe({
            next: data => { this.files = data; this.isLoading = false; },
            error: () => { this.isLoading = false; }
        });
    }

    deleteAllFiles(): void {
        Swal.fire({ title: 'Confirmation', text: 'Supprimer tous les fichiers ?', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Oui, supprimer' })
            .then(result => {
                if (!result.isConfirmed) return;
                this.fileManagerService.deleteAll().subscribe({
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
                this.fileManagerService.delete(fileName).subscribe({
                    next: () => { this.files = this.files.filter(f => f.name !== fileName); Swal.fire('Supprimé', '', 'success'); },
                    error: () => Swal.fire('Erreur', 'Échec de la suppression.', 'error')
                });
            });
    }

    openFile(fileName: string): void {
        window.open(this.fileManagerService.getViewUrl(fileName), '_blank');
    }

    getFileIcon(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'mdi mdi-file-pdf text-danger';
        if (ext === 'doc' || ext === 'docx') return 'mdi mdi-file-word text-primary';
        if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) return 'mdi mdi-file-image text-muted';
        return 'mdi mdi-file-document text-dark';
    }
}
