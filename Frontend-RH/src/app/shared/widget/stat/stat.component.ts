import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';

@Component({
    selector: 'app-stat',
    templateUrl: './stat.component.html',
    styleUrls: ['./stat.component.scss']
})
export class StatComponent implements OnInit {

    @Input() title: string;
    @Input() value: string;
    @Input() icon: string;

    totalCollaborateurs = 0;
    totalStagiares = 0;

    constructor(
        private router: Router,
        private collaborateurService: CollaborateurService,
        private stagiaireService: StagiaireService
    ) {}

    ngOnInit(): void {
        this.collaborateurService.getAll().subscribe({
            next: data => this.totalCollaborateurs = data.length,
            error: err => console.error('Error fetching collaborateurs count:', err)
        });
        this.stagiaireService.getAll().subscribe({
            next: data => this.totalStagiares = data.length,
            error: err => console.error('Error fetching interns count:', err)
        });
    }

    navigateToCollaborateur(): void {
        this.router.navigate(['/dashboard']);
    }
}
