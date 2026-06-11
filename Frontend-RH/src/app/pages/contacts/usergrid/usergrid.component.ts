import { Component, OnInit } from '@angular/core';
import { CollaborateurService } from '../../../core/services/collaborateur.service';

@Component({
  selector: 'app-usergrid',
  templateUrl: './usergrid.component.html',
  styleUrls: ['./usergrid.component.scss']
})

/**
 * Contacts user grid component
 */
export class UsergridComponent implements OnInit {
  employees: any[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  showSettingsCard = false;
  title = '';
  resp = '';
  newResp = '';
  dateOverture = '';
  dateCloture = '';

  constructor(private collaborateurService: CollaborateurService) {}

  ngOnInit(): void {
    this.loading = true;
    this.collaborateurService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  get filteredEmployees(): any[] {
    if (!this.searchTerm.trim()) return this.employees;
    const q = this.searchTerm.toLowerCase();
    return this.employees.filter(e =>
      `${e.prenom ?? ''} ${e.nom ?? ''}`.toLowerCase().includes(q) ||
      (e.Département ?? '').toLowerCase().includes(q) ||
      (e.Fonction ?? '').toLowerCase().includes(q)
    );
  }

  trackById(index: number, emp: any): any {
    return emp._backendId ?? emp.matricule ?? index;
  }

  toggleSettingsCard() {
    this.showSettingsCard = !this.showSettingsCard;
  }

  clearResp() {
    this.resp = '';
  }

  onSubmit() {
    console.log('Title:', this.title);
    console.log('Responsibility:', this.resp);
    console.log('Date d\'ouverture:', this.dateOverture);
    console.log('Date cloture:', this.dateCloture);
  }
}
