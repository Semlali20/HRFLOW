import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KanbanStage, StageOffer, CvApplication, KANBAN_STAGES } from 'src/app/core/models/hr.models';

export { KanbanStage, StageOffer, CvApplication, KANBAN_STAGES };

@Injectable({ providedIn: 'root' })
export class CvService {

    private readonly BASE = `${environment.apiUrl}/cvs`;

    constructor(private http: HttpClient) {}

    getOpenOffers(): Observable<StageOffer[]> {
        return this.http.get<StageOffer[]>(`${this.BASE}/offers`).pipe(catchError(this.handleError));
    }

    getAllOffers(): Observable<StageOffer[]> {
        return this.http.get<StageOffer[]>(`${this.BASE}/offers/all`).pipe(catchError(this.handleError));
    }

    createOffer(offer: Partial<StageOffer>): Observable<StageOffer> {
        return this.http.post<StageOffer>(`${this.BASE}/offers`, offer).pipe(catchError(this.handleError));
    }

    getAllApplications(): Observable<CvApplication[]> {
        return this.http.get<CvApplication[]>(`${this.BASE}/applications`).pipe(catchError(this.handleError));
    }

    getByStage(stage: KanbanStage): Observable<CvApplication[]> {
        return this.http.get<CvApplication[]>(`${this.BASE}/applications/stage/${stage}`).pipe(catchError(this.handleError));
    }

    uploadCv(file: File, candidateName: string, candidateEmail: string, offerId?: number): Observable<CvApplication> {
        if (!file) return throwError(() => new Error('file is required'));
        const form = new FormData();
        form.append('file', file);
        form.append('candidateName', candidateName);
        form.append('candidateEmail', candidateEmail);
        if (offerId) form.append('offerId', String(offerId));
        return this.http.post<CvApplication>(`${this.BASE}/upload`, form).pipe(catchError(this.handleError));
    }

    updateStage(id: number, stage: KanbanStage, notes?: string): Observable<CvApplication> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<CvApplication>(`${this.BASE}/applications/${id}/stage`, { stage, notes }).pipe(catchError(this.handleError));
    }

    searchCvs(keyword: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.BASE}/search`, { params: { keyword } }).pipe(catchError(this.handleError));
    }

    downloadCv(fileName: string): Observable<ArrayBuffer> {
        if (!fileName) return throwError(() => new Error('fileName is required'));
        return this.http.get(`${this.BASE}/download/${fileName}`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
