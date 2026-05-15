import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Stagiaire, StagiaireCreateDto } from 'src/app/core/models/hr.models';

function mapIntern(e: any): Stagiaire {
    return {
        matricule:       e.id,
        nom:             e.lastName          ?? '',
        prenom:          e.firstName         ?? '',
        CIN:             e.cin               ?? '',
        département:     e.department?.name  ?? '',
        sujetDeStage:    e.internshipSubject  ?? '',
        ecoleUniversité: e.school            ?? '',
        typeDeStage:     e.internshipType    ?? '',
        dateDébutStage:  e.startDate         ?? '',
        dateFinStage:    e.endDate           ?? '',
        dateDeNaissance: e.dateOfBirth       ?? '',
        durée:           e.durationMonths    ?? 0,
        status:          e.status            ?? '',
        nomEncadrant:    e.supervisorName    ?? '',
        photo:           e.photoPath         ?? '',
        totalValidDocuments:    e.submittedDocuments ?? 0,
        totalNotValidDocuments: Math.max(0, (e.totalDocuments ?? 0) - (e.submittedDocuments ?? 0)),
        _backendId:      e.id,
        _departmentId:   e.department?.id   ?? null,
        _version:        e.version          ?? 0,
    } as any;
}

export function mapToInternRequest(dto: any): any {
    return {
        firstName:        dto.prenom           ?? dto.firstName        ?? '',
        lastName:         dto.nom              ?? dto.lastName         ?? '',
        cin:              dto.CIN              ?? dto.cin              ?? '',
        dateOfBirth:      dto.dateDeNaissance  ?? dto.dateOfBirth      ?? null,
        departmentId:     dto.departmentId     ?? dto._departmentId    ?? null,
        internshipSubject:dto.sujetDeStage     ?? dto.internshipSubject ?? '',
        supervisorName:   dto.nomEncadrant     ?? dto.supervisorName   ?? '',
        school:           dto.ecoleUniversité  ?? dto.school           ?? '',
        internshipType:   dto.typeDeStage      ?? dto.internshipType   ?? null,
        startDate:        dto.dateDébutStage   ?? dto.startDate        ?? '',
        endDate:          dto.dateFinStage     ?? dto.endDate          ?? '',
        status:           dto.status           ?? 'ACTIVE',
        version:          dto.version          ?? dto._version         ?? null,
    };
}

@Injectable({ providedIn: 'root' })
export class StagiaireService {

    private readonly BASE = `${environment.apiUrl}/interns`;

    constructor(private http: HttpClient) {}

    getAll(search?: string): Observable<Stagiaire[]> {
        let params = new HttpParams().set('size', '200');
        if (search?.trim()) params = params.set('search', search.trim());
        return this.http.get<any>(this.BASE, { params }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapIntern);
            }),
            catchError(this.handleError)
        );
    }

    getById(id: number): Observable<Stagiaire> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}`).pipe(
            map(res => mapIntern(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    create(dto: StagiaireCreateDto | any): Observable<Stagiaire> {
        const body = mapToInternRequest(dto);
        return this.http.post<any>(this.BASE, body).pipe(
            map(res => mapIntern(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    update(id: number, dto: Partial<StagiaireCreateDto> | any): Observable<Stagiaire> {
        if (!id) return throwError(() => new Error('id is required'));
        const body = mapToInternRequest({ ...dto, _backendId: id });
        return this.http.put<any>(`${this.BASE}/${id}`, body).pipe(
            map(res => mapIntern(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    updateStatus(id: number, status: string): Observable<Stagiaire> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/status`, null, { params: { status } }).pipe(
            map(res => mapIntern(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    getDocuments(id: number): Observable<any[]> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}/documents`).pipe(
            map(res => { const d = res?.data ?? res; return Array.isArray(d) ? d : []; }),
            catchError(this.handleError)
        );
    }

    updateDocument(id: number, doc: { documentType: string; submitted: boolean; submittedDate?: string | null; notes?: string; version?: number | null }): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.BASE}/${id}/documents`, doc).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        console.error('[StagiaireService] Error:', err);
        return throwError(() => err);
    }
}
