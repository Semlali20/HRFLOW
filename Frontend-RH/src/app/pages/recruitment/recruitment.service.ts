import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
    JobOffer, JobOfferCreateDto, Candidate, CandidateUpdateDto, RecruitmentStats
} from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {

    private readonly OFFERS_BASE = `${environment.apiUrl}/recruitment/offers`;
    private readonly CANDIDATES_BASE = `${environment.apiUrl}/recruitment/candidates`;

    constructor(private http: HttpClient) {}

    // ── Offers ───────────────────────────────────────────────────────────────

    getAllOffers(): Observable<JobOffer[]> {
        return this.http.get<JobOffer[]>(this.OFFERS_BASE).pipe(catchError(this.handleError));
    }

    getOpenOffers(): Observable<JobOffer[]> {
        return this.http.get<JobOffer[]>(`${this.OFFERS_BASE}/open`).pipe(catchError(this.handleError));
    }

    getOfferById(id: number): Observable<JobOffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<JobOffer>(`${this.OFFERS_BASE}/${id}`).pipe(catchError(this.handleError));
    }

    createOffer(dto: JobOfferCreateDto): Observable<JobOffer> {
        if (!dto.title || !dto.department) {
            return throwError(() => new Error('title and department are required'));
        }
        return this.http.post<JobOffer>(this.OFFERS_BASE, dto).pipe(catchError(this.handleError));
    }

    updateOffer(id: number, dto: Partial<JobOfferCreateDto>): Observable<JobOffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<JobOffer>(`${this.OFFERS_BASE}/${id}`, dto).pipe(catchError(this.handleError));
    }

    closeOffer(id: number): Observable<JobOffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<JobOffer>(`${this.OFFERS_BASE}/${id}/close`, {}).pipe(catchError(this.handleError));
    }

    deleteOffer(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.OFFERS_BASE}/${id}`).pipe(catchError(this.handleError));
    }

    // ── Candidates ───────────────────────────────────────────────────────────

    getAllCandidates(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(this.CANDIDATES_BASE).pipe(catchError(this.handleError));
    }

    getCandidatesByOffer(offerId: number): Observable<Candidate[]> {
        if (!offerId) return throwError(() => new Error('offerId is required'));
        return this.http.get<Candidate[]>(`${this.CANDIDATES_BASE}/offer/${offerId}`).pipe(catchError(this.handleError));
    }

    getCandidateById(id: number): Observable<Candidate> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<Candidate>(`${this.CANDIDATES_BASE}/${id}`).pipe(catchError(this.handleError));
    }

    updateCandidateStatus(id: number, dto: CandidateUpdateDto): Observable<Candidate> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<Candidate>(`${this.CANDIDATES_BASE}/${id}`, dto).pipe(catchError(this.handleError));
    }

    scheduleInterview(id: number, interviewDate: string, notes?: string): Observable<Candidate> {
        return this.updateCandidateStatus(id, { status: 'INTERVIEW_SCHEDULED', interviewDate, notes });
    }

    shortlist(id: number, notes?: string): Observable<Candidate> {
        return this.updateCandidateStatus(id, { status: 'SHORTLISTED', notes });
    }

    rejectApplication(id: number, notes?: string): Observable<Candidate> {
        return this.updateCandidateStatus(id, { status: 'REJECTED', notes });
    }

    makeOffer(id: number, notes?: string): Observable<Candidate> {
        return this.updateCandidateStatus(id, { status: 'OFFERED', notes });
    }

    deleteCandidate(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.CANDIDATES_BASE}/${id}`).pipe(catchError(this.handleError));
    }

    downloadCv(id: number): Observable<ArrayBuffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get(`${this.CANDIDATES_BASE}/${id}/cv`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    getStats(): Observable<RecruitmentStats> {
        return this.http.get<RecruitmentStats>(`${this.CANDIDATES_BASE}/stats`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
