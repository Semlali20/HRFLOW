import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Stagiaire, StagiaireCreateDto } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class StagiaireService {

    /** Backend endpoint: GET/POST /stagiares */
    private readonly BASE = `${environment.apiUrl}/stagiares`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Stagiaire[]> {
        return this.http.get<Stagiaire[]>(this.BASE).pipe(catchError(this.handleError));
    }

    getById(matricule: number): Observable<Stagiaire> {
        if (!matricule) return throwError(() => new Error('matricule is required'));
        return this.http.get<Stagiaire>(`${this.BASE}/${matricule}`).pipe(catchError(this.handleError));
    }

    create(dto: StagiaireCreateDto): Observable<Stagiaire> {
        if (!dto.nom || !dto.prenom) {
            return throwError(() => new Error('nom and prenom are required'));
        }
        return this.http.post<Stagiaire>(this.BASE, dto).pipe(catchError(this.handleError));
    }

    update(matricule: number, dto: Partial<StagiaireCreateDto>): Observable<Stagiaire> {
        if (!matricule) return throwError(() => new Error('matricule is required'));
        return this.http.put<Stagiaire>(`${this.BASE}/${matricule}`, dto).pipe(catchError(this.handleError));
    }

    delete(matricule: number): Observable<void> {
        if (!matricule) return throwError(() => new Error('matricule is required'));
        return this.http.delete<void>(`${this.BASE}/${matricule}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[StagiaireService] Error:', err);
        return throwError(() => err);
    }
}
