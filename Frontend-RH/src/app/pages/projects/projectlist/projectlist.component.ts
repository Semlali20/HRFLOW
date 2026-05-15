import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private router: Router,
    private stagiaireService: StagiaireService,
    private confirmSvc: ConfirmService,
    private translate: TranslateService,
  ) {}

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

  async deleteStagiaires(stagiaire: any): Promise<void> {
    const confirmed = await this.confirmSvc.confirm(this.translate.instant('INTERNS.DELETE_CONFIRM'), this.translate.instant('INTERNS.CONFIRM_TITLE'));
    if (!confirmed) return;
    this.stagiaireService.delete(stagiaire.matricule).subscribe({
      next: async () => { await this.confirmSvc.alert(this.translate.instant('INTERNS.DELETE_SUCCESS'), this.translate.instant('INTERNS.DELETED_TITLE'), 'success'); this.fetchStagiaires(); },
      error: async () => await this.confirmSvc.alert(this.translate.instant('INTERNS.DELETE_ERROR'), this.translate.instant('INTERNS.ERROR_TITLE'), 'error'),
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
