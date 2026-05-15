import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KanbanStage, StageOffer, CvApplication, KANBAN_STAGES } from 'src/app/core/models/hr.models';

export { KanbanStage, StageOffer, CvApplication, KANBAN_STAGES };

@Injectable({ providedIn: 'root' })
export class CvService {

    private readonly BASE        = `${environment.apiUrl}/cvs`;
    private readonly OFFERS_BASE = `${environment.apiUrl}/offers`;

    constructor(private http: HttpClient) {}

    // ── Stage Offers ───────────────────────────────────────────────────────────

    getOpenOffers(): Observable<StageOffer[]> {
        const params = new HttpParams().set('status', 'OPEN').set('size', '100');
        return this.http.get<any>(this.OFFERS_BASE, { params }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapOffer);
            }),
            catchError(this.handleError)
        );
    }

    getAllOffers(): Observable<StageOffer[]> {
        return this.http.get<any>(this.OFFERS_BASE, { params: new HttpParams().set('size', '100') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapOffer);
            }),
            catchError(this.handleError)
        );
    }

    createOffer(offer: Partial<StageOffer>): Observable<StageOffer> {
        return this.http.post<any>(this.OFFERS_BASE, offer).pipe(
            map(res => mapOffer(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    // ── CV Applications ────────────────────────────────────────────────────────

    getAllApplications(): Observable<CvApplication[]> {
        return this.http.get<any>(`${this.BASE}/applications`, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapApplication);
            }),
            catchError(this.handleError)
        );
    }

    getByStage(stage: KanbanStage): Observable<CvApplication[]> {
        return this.http.get<any>(`${this.BASE}/applications/stage/${stage}`, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapApplication);
            }),
            catchError(this.handleError)
        );
    }

    uploadCv(file: File, candidateName: string, candidateEmail: string, offerId?: number): Observable<CvApplication> {
        if (!file) return throwError(() => new Error('file is required'));
        const form = new FormData();
        form.append('file', file);
        form.append('candidateName', candidateName);
        form.append('candidateEmail', candidateEmail);
        if (offerId) form.append('offerId', String(offerId));
        return this.http.post<any>(`${this.BASE}/upload`, form).pipe(
            map(res => mapApplication(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    /** PATCH /cvs/applications/{id}/stage */
    updateStage(id: number, stage: KanbanStage, notes?: string): Observable<CvApplication> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/applications/${id}/stage`, { stage, notes }).pipe(
            map(res => mapApplication(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    searchCvs(keyword: string): Observable<CvApplication[]> {
        return this.http.get<any>(`${this.BASE}/search`, { params: { keyword } }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapApplication);
            }),
            catchError(this.handleError)
        );
    }

    /** GET /cvs/applications/offer/{offerId} */
    getApplicationsByOffer(offerId: number): Observable<CvApplication[]> {
        return this.http.get<any>(`${this.BASE}/applications/offer/${offerId}`, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapApplication);
            }),
            catchError(this.handleError)
        );
    }

    /** PATCH /cvs/applications/{id}/score */
    updateScore(id: number, score: number, notes?: string): Observable<CvApplication> {
        if (!id) return throwError(() => new Error('id is required'));
        let params = new HttpParams().set('score', String(score));
        if (notes) params = params.set('notes', notes);
        return this.http.patch<any>(`${this.BASE}/applications/${id}/score`, null, { params }).pipe(
            map(res => mapApplication(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    /** DELETE /cvs/applications/{id} */
    deleteApplication(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/applications/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    /** PUT /offers/{id} */
    updateOffer(id: number, offer: Partial<StageOffer>): Observable<StageOffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.OFFERS_BASE}/${id}`, offer).pipe(
            map(res => mapOffer(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    /** PATCH /offers/{id}/status?status=X */
    updateOfferStatus(id: number, status: string): Observable<StageOffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.OFFERS_BASE}/${id}/status`, null, { params: { status } }).pipe(
            map(res => mapOffer(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    /** DELETE /offers/{id} */
    deleteOffer(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.OFFERS_BASE}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    downloadCv(fileName: string): Observable<ArrayBuffer> {
        if (!fileName) return throwError(() => new Error('fileName is required'));
        return this.http.get(`${this.BASE}/download/${fileName}`, { responseType: 'arraybuffer' }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}

function mapOffer(o: any): StageOffer {
    return {
        id:             o.id,
        title:          o.title          ?? '',
        description:    o.description    ?? '',
        department:     o.department?.name ?? (typeof o.department === 'string' ? o.department : ''),
        requiredSkills: o.requiredSkills ?? '',
        durationMonths: o.durationMonths ?? 0,
        startDate:      normalizeDate(o.startDate),
        status:         o.status         ?? 'OPEN',
    };
}

function normalizeDate(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    // Java LocalDate as array: [year, month, day]
    if (Array.isArray(val) && val.length >= 3) {
        const [y, mo, d] = val as number[];
        return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return String(val);
}

function mapApplication(a: any): CvApplication {
    return {
        id:             a.id,
        offer:          a.offer ? { id: a.offer.id, name: a.offer.name ?? a.offer.title ?? '' } : undefined,
        candidateName:  a.candidateName  ?? '',
        candidateEmail: a.candidateEmail ?? '',
        cvFileName:     a.cvFileName     ?? '',
        stage:          a.stage          ?? 'NEW',
        notes:          a.notes          ?? '',
        createdAt:      normalizeDateTime(a.createdAt ?? a.submittedAt),
    };
}

function normalizeDateTime(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    // Java LocalDateTime serialized as array: [year, month, day, hour?, minute?, second?]
    if (Array.isArray(val) && val.length >= 3) {
        const [y, mo, d, h = 0, min = 0, s = 0] = val as number[];
        return new Date(y, mo - 1, d, h, min, s).toISOString();
    }
    return String(val);
}
