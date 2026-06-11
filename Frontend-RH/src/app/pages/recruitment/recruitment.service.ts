import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {

    private readonly OFFERS_BASE = `${environment.apiUrl}/offers`;
    private readonly CV_BASE = `${environment.apiUrl}/cvs`;

    constructor(private http: HttpClient) {}

    // ── Stage Offers ─────────────────────────────────────────────────────────

    getAllOffers(status?: string): Observable<any[]> {
        let params = new HttpParams().set('size', '200');
        if (status) params = params.set('status', status);
        return this.http.get<any>(this.OFFERS_BASE, { params }).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    getOfferById(id: number): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.OFFERS_BASE}/${id}`).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    createOffer(dto: any): Observable<any> {
        return this.http.post<any>(this.OFFERS_BASE, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    updateOffer(id: number, dto: any): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.OFFERS_BASE}/${id}`, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    updateOfferStatus(id: number, status: string): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.OFFERS_BASE}/${id}/status`, null, { params: { status } }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    deleteOffer(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.OFFERS_BASE}/${id}`).pipe(catchError(this.handleError));
    }

    // ── CV Applications ───────────────────────────────────────────────────────

    getAllApplications(page = 0, size = 200): Observable<any[]> {
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<any>(`${this.CV_BASE}/applications`, { params }).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    getApplicationsByOffer(offerId: number): Observable<any[]> {
        if (!offerId) return throwError(() => new Error('offerId is required'));
        return this.http.get<any>(`${this.CV_BASE}/applications/offer/${offerId}`).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    getApplicationsByStage(stage: string): Observable<any[]> {
        return this.http.get<any>(`${this.CV_BASE}/applications/stage/${stage}`).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    uploadCv(file: File, candidateName: string, candidateEmail: string, offerId?: number): Observable<any> {
        const form = new FormData();
        form.append('file', file);
        form.append('candidateName', candidateName);
        form.append('candidateEmail', candidateEmail);
        if (offerId != null) form.append('offerId', String(offerId));
        return this.http.post<any>(`${this.CV_BASE}/upload`, form).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    updateStage(id: number, stage: string, notes?: string): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.CV_BASE}/applications/${id}/stage`, { stage, notes }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    scoreApplication(id: number, score: number, notes?: string): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        let params = new HttpParams().set('score', String(score));
        if (notes != null) params = params.set('notes', notes);
        return this.http.patch<any>(`${this.CV_BASE}/applications/${id}/score`, null, { params }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    deleteApplication(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.CV_BASE}/applications/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
