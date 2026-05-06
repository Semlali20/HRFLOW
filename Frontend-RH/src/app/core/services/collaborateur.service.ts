import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Collaborateur, CollaborateurCreateDto } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class CollaborateurService {

    /** Backend endpoint: GET/POST /Collaborateurs */
    private readonly BASE = `${environment.apiUrl}/Collaborateurs`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(this.BASE).pipe(catchError(this.handleError));
    }

    getById(matricule: number): Observable<Collaborateur> {
        if (!matricule) return throwError(() => new Error('matricule is required'));
        return this.http.get<Collaborateur>(`${this.BASE}/${matricule}`).pipe(catchError(this.handleError));
    }

    create(dto: CollaborateurCreateDto): Observable<Collaborateur> {
        if (!dto.nom || !dto.prenom || !dto.email) {
            return throwError(() => new Error('nom, prenom and email are required'));
        }
        return this.http.post<Collaborateur>(this.BASE, dto).pipe(catchError(this.handleError));
    }

    update(matricule: number, dto: Partial<CollaborateurCreateDto>): Observable<Collaborateur> {
        if (!matricule) return throwError(() => new Error('matricule is required'));
        return this.http.put<Collaborateur>(`${this.BASE}/${matricule}`, dto).pipe(catchError(this.handleError));
    }

    delete(matricule: number): Observable<void> {
        if (!matricule) return throwError(() => new Error('matricule is required'));
        return this.http.delete<void>(`${this.BASE}/${matricule}`).pipe(catchError(this.handleError));
    }

    importFromExcel(file: File): Observable<string> {
        if (!file) return throwError(() => new Error('file is required'));
        const form = new FormData();
        form.append('file', file);
        return this.http.post(`${this.BASE}/import`, form, { responseType: 'text' }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[CollaborateurService] Error:', err);
        return throwError(() => err);
    }
}
