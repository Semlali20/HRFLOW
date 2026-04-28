import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-collaborateur',
    templateUrl: './collaborateur.component.html',
    styleUrls: ['./collaborateur.component.scss'],
    providers: [DatePipe],
})
export class CollaborateurComponent implements OnInit {

    private readonly API = 'http://localhost:8090/api/v1/Collaborateurs';

    totalCollaborateursCount = 0;
    isVisible = false;
    collaborateurs: any[] = [];
    filteredCollaborateurs: any[] = [];
    selectedCollaborateur: any;
    entriesPerPage = 10;
    paginatedCollaborateurs: any[] = [];
    page = 1;
    totalPages = 0;
    totalPagesArray: number[] = [];
    searchText = '';
    searchColumn = '';
    currentSortColumn = '';
    currentSortOrder: 'asc' | 'desc' = 'asc';

    constructor(private datePipe: DatePipe, private http: HttpClient) {}

    ngOnInit(): void {
        this.fetchCollaborateurs();
    }

    fetchCollaborateurs(): void {
        this.http.get<any[]>(this.API).subscribe({
            next: data => {
                this.collaborateurs = data;
                this.filteredCollaborateurs = [...data];
                this.totalCollaborateursCount = data.length;
                this.calculateTotalPages();
                this.setPaginatedCollaborateurs();
            },
            error: err => console.error('Error fetching collaborateurs:', err)
        });
    }

    setPaginatedCollaborateurs(): void {
        const start = (this.page - 1) * this.entriesPerPage;
        this.paginatedCollaborateurs = this.filteredCollaborateurs.slice(start, start + this.entriesPerPage);
    }

    calculateTotalPages(): void {
        this.totalPages = Math.ceil(this.filteredCollaborateurs.length / this.entriesPerPage);
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    onPageChange(newPage: number): void {
        if (newPage > 0 && newPage <= this.totalPages) {
            this.page = newPage;
            this.setPaginatedCollaborateurs();
        }
    }

    onEntriesPerPageChange(): void {
        this.page = 1;
        this.calculateTotalPages();
        this.setPaginatedCollaborateurs();
    }

    onSearchChange(): void {
        const search = this.searchText.toLowerCase();
        this.filteredCollaborateurs = this.collaborateurs.filter(c => {
            if (this.searchColumn) {
                const val = c[this.searchColumn];
                return val != null && val.toString().toLowerCase().includes(search);
            }
            return Object.values(c).some(v => v != null && v.toString().toLowerCase().includes(search));
        });
        this.totalCollaborateursCount = this.filteredCollaborateurs.length;
        this.page = 1;
        this.calculateTotalPages();
        this.setPaginatedCollaborateurs();
    }

    viewCollaborateur(collaborateur: any): void {
        this.http.get<any>(`${this.API}/${collaborateur.matricule}`).subscribe({
            next: c => {
                Swal.fire({
                    title: 'Détails Collaborateur',
                    html: `
                    <div style="text-align:left">
                      <p><b>Nom:</b> ${c.nom} ${c.prenom}</p>
                      <p><b>CIN:</b> ${c.cin || ''}</p>
                      <p><b>Age:</b> ${c.age || ''}</p>
                      <p><b>Sexe:</b> ${c.sexe || ''}</p>
                      <p><b>Nationalité:</b> ${c.nationalité || ''}</p>
                      <p><b>Date naissance:</b> ${c.date_naissance || ''}</p>
                      <p><b>Email:</b> ${c.email || ''}</p>
                      <hr>
                      <p><b>Filiale:</b> ${c.filiale || ''}</p>
                      <p><b>Département:</b> ${c.département || ''}</p>
                      <p><b>Type:</b> ${c.type || ''}</p>
                      <p><b>Fonction:</b> ${c.fonction || ''}</p>
                      <p><b>Ancienneté:</b> ${c.ancienneté || ''}</p>
                      <p><b>Date d'entrée:</b> ${c.date_entree || ''}</p>
                    </div>`,
                    showCloseButton: true,
                    showConfirmButton: false,
                });
            },
            error: err => console.error('Error fetching collaborateur details:', err)
        });
    }

    addCollaborateur(): void {
        Swal.fire({
            title: 'Ajouter un Collaborateur',
            html: this.getFormHtml(),
            showCancelButton: true,
            focusConfirm: false,
            width: '75%',
            preConfirm: () => {
                const data = this.readFormFields();
                if (!data) { Swal.showValidationMessage('Veuillez remplir tous les champs.'); return false; }
                this.http.post<any>(this.API, data).subscribe({
                    next: () => { Swal.fire('Succès', 'Collaborateur ajouté', 'success'); this.fetchCollaborateurs(); },
                    error: () => Swal.fire('Erreur', 'Erreur lors de l\'ajout', 'error')
                });
            }
        });
    }

    editCollaborateur(collaborateur: any): void {
        const toHtmlDate = (d: string) => {
            if (!d) return '';
            const parts = d.split('-');
            return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
        };
        Swal.fire({
            title: 'Modifier Collaborateur',
            html: this.getFormHtml(collaborateur, toHtmlDate),
            showCancelButton: true,
            focusConfirm: false,
            width: '75%',
            preConfirm: () => {
                const data = this.readFormFields();
                if (!data) { Swal.showValidationMessage('Veuillez remplir tous les champs.'); return false; }
                this.http.put<any>(`${this.API}/${collaborateur.matricule}`, data).subscribe({
                    next: () => { Swal.fire('Succès', 'Collaborateur modifié', 'success'); this.fetchCollaborateurs(); },
                    error: () => Swal.fire('Erreur', 'Erreur lors de la modification', 'error')
                });
            }
        });
    }

    deleteCollaborateur(collaborateur: any): void {
        Swal.fire({
            title: 'Confirmation',
            text: 'Supprimer ce collaborateur ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer'
        }).then(result => {
            if (result.isConfirmed) {
                this.http.delete(`${this.API}/${collaborateur.matricule}`).subscribe({
                    next: () => { Swal.fire('Supprimé', 'Collaborateur supprimé.', 'success'); this.fetchCollaborateurs(); },
                    error: () => Swal.fire('Erreur', 'Échec de la suppression', 'error')
                });
            }
        });
    }

    sortTable(column: string): void {
        if (this.currentSortColumn === column) {
            this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.currentSortOrder = 'asc';
        }
        this.paginatedCollaborateurs.sort((a, b) => {
            const vA = a[column], vB = b[column];
            const dir = this.currentSortOrder === 'asc' ? 1 : -1;
            return vA < vB ? -dir : vA > vB ? dir : 0;
        });
    }

    getSortIcon(column: string): string {
        if (this.currentSortColumn === column) {
            return this.currentSortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
        }
        return 'fa-sort';
    }

    private readFormFields(): any | null {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value ?? '';
        const nom = get('nom'), prenom = get('prenom'), cin = get('cin'), sexe = get('sexe');
        const nationalité = get('nationalite'), age = get('age'), email = get('email');
        const date_naissance = get('date_naissance'), categorie = get('categorie');
        const filiale = get('filiale'), type = get('type'), département = get('departement');
        const fonction = get('fonction'), date_entree = get('date_entree'), ancienneté = get('anciennete');
        if (!nom || !prenom) return null;
        return { nom, prenom, cin, sexe: sexe || undefined, nationalité, age, email,
                 date_naissance, categorie, filiale, type, département, fonction, date_entree, ancienneté };
    }

    private getFormHtml(c?: any, toHtmlDate?: (d: string) => string): string {
        const v = (field: string) => c ? (c[field] ?? '') : '';
        const d = (field: string) => c && toHtmlDate ? toHtmlDate(c[field] ?? '') : '';
        return `
        <div style="display:flex;gap:1rem;text-align:left">
          <div style="flex:1">
            <label>Nom:</label><input id="nom" class="swal2-input" value="${v('nom')}">
            <label>Prénom:</label><input id="prenom" class="swal2-input" value="${v('prenom')}">
            <label>CIN:</label><input id="cin" class="swal2-input" value="${v('cin')}">
            <label>Sexe:</label><select id="sexe" class="swal2-input">
              <option value="Masculin">Masculin</option><option value="Féminin">Féminin</option>
            </select>
            <label>Nationalité:</label><input id="nationalite" class="swal2-input" value="${v('nationalité')}">
            <label>Age:</label><input id="age" type="number" class="swal2-input" value="${v('age')}">
            <label>Email:</label><input id="email" class="swal2-input" value="${v('email')}">
            <label>Date naissance:</label><input id="date_naissance" type="date" class="swal2-input" value="${d('date_naissance')}">
          </div>
          <div style="flex:1">
            <label>Catégorie:</label><input id="categorie" class="swal2-input" value="${v('categorie')}">
            <label>Filiale:</label><input id="filiale" class="swal2-input" value="${v('filiale')}">
            <label>Type:</label><input id="type" class="swal2-input" value="${v('type')}">
            <label>Département:</label><input id="departement" class="swal2-input" value="${v('département')}">
            <label>Fonction:</label><input id="fonction" class="swal2-input" value="${v('fonction')}">
            <label>Date d'entrée:</label><input id="date_entree" type="date" class="swal2-input" value="${d('date_entree')}">
            <label>Ancienneté:</label><input id="anciennete" class="swal2-input" value="${v('ancienneté')}">
          </div>
        </div>`;
    }
}
