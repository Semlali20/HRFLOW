import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.scss']
})
export class ProjectlistComponent implements OnInit {
  entriesPerPage: number = 10;
  Stagiaires: any[] = [];
  filteredStagiaires: any[] = [];
  paginatedStagiaires: any[] = [];
  page: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  totalStagiaresCount: number = 0;
  searchText = '';
  searchColumn = '';
  currentSortColumn: string = '';
  currentSortOrder: 'asc' | 'desc' = 'asc';

  constructor(private router: Router, private stagiaireService: StagiaireService) {}

  ngOnInit(): void {
    this.fetchStagiaires();
  }

  fetchStagiaires(): void {
    this.stagiaireService.getAll().subscribe({
      next: data => {
        this.Stagiaires = data;
        this.filteredStagiaires = this.Stagiaires;
        this.totalStagiaresCount = this.Stagiaires.length;
        this.setPaginatedStagiaires();
        this.calculateTotalPages();
      },
      error: err => console.error('Error fetching data:', err)
    });
  }

  setPaginatedStagiaires(): void {
    const start = (this.page - 1) * this.entriesPerPage;
    this.paginatedStagiaires = this.filteredStagiaires.slice(start, start + this.entriesPerPage);
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalStagiaresCount / this.entriesPerPage);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(newPage: number): void {
    if (newPage > 0 && newPage <= this.totalPages) {
      this.page = newPage;
      this.setPaginatedStagiaires();
    }
  }

  onEntriesPerPageChange(): void {
    this.page = 1;
    this.calculateTotalPages();
    this.setPaginatedStagiaires();
  }

  onSearchChange(): void {
    const searchTextLower = this.searchText.toLowerCase();
    if (this.searchColumn) {
      this.filteredStagiaires = this.Stagiaires.filter(s => {
        const val = s[this.searchColumn];
        return val != null && val.toString().toLowerCase().includes(searchTextLower);
      });
    } else {
      this.filteredStagiaires = this.Stagiaires.filter(s =>
        Object.values(s).some(val => val != null && val.toString().toLowerCase().includes(searchTextLower))
      );
    }
    this.totalStagiaresCount = this.filteredStagiaires.length;
    this.page = 1;
    this.calculateTotalPages();
    this.setPaginatedStagiaires();
  }

  viewStagiaires(stagiaire: any): void {
    this.router.navigate(['/stagiaires/profile'], { queryParams: { id: stagiaire.matricule } });
  }

  editStagiaires(stagiaire: any): void {
    this.router.navigate(['/stagiaires/edit'], { queryParams: { id: stagiaire.matricule } });
  }

  deleteStagiaires(stagiaire: any): void {
    Swal.fire({
      title: 'Confirmation', text: 'Are you sure you want to delete this stagiaire?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.stagiaireService.delete(stagiaire.matricule).subscribe({
          next: () => { Swal.fire('Deleted!', 'The stagiaire has been deleted.', 'success'); this.fetchStagiaires(); },
          error: () => Swal.fire('Error', 'Failed to delete stagiaire', 'error')
        });
      }
    });
  }

  sortTable(column: string) {
    if (this.currentSortColumn === column) {
      this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortOrder = 'asc';
    }
    this.paginatedStagiaires.sort((a, b) => {
      const va = a[column], vb = b[column];
      if (va < vb) return this.currentSortOrder === 'asc' ? -1 : 1;
      if (va > vb) return this.currentSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn === column) return this.currentSortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    return 'fa-sort';
  }
}
