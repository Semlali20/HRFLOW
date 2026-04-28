import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type KanbanStage = 'NEW' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'REJECTED';

export interface StageOffer {
    id: number;
    title: string;
    description: string;
    department: string;
    requiredSkills: string;
    durationMonths: number;
    startDate: string;
    status: 'OPEN' | 'CLOSED' | 'FILLED';
}

export interface CvApplication {
    id: number;
    offer?: StageOffer;
    candidateName: string;
    candidateEmail: string;
    cvFileName: string;
    stage: KanbanStage;
    notes: string;
    submittedAt: string;
}

export const KANBAN_STAGES: KanbanStage[] = [
    'NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'
];

@Injectable({ providedIn: 'root' })
export class CvService {

    private readonly BASE = 'http://localhost:8090/api/v1/cvs';

    constructor(private http: HttpClient) {}

    getOpenOffers(): Observable<StageOffer[]> {
        return this.http.get<StageOffer[]>(`${this.BASE}/offers`);
    }

    getAllOffers(): Observable<StageOffer[]> {
        return this.http.get<StageOffer[]>(`${this.BASE}/offers/all`);
    }

    createOffer(offer: Partial<StageOffer>): Observable<StageOffer> {
        return this.http.post<StageOffer>(`${this.BASE}/offers`, offer);
    }

    getAllApplications(): Observable<CvApplication[]> {
        return this.http.get<CvApplication[]>(`${this.BASE}/applications`);
    }

    getByStage(stage: KanbanStage): Observable<CvApplication[]> {
        return this.http.get<CvApplication[]>(`${this.BASE}/applications/stage/${stage}`);
    }

    uploadCv(file: File, candidateName: string, candidateEmail: string, offerId?: number): Observable<CvApplication> {
        const form = new FormData();
        form.append('file', file);
        form.append('candidateName', candidateName);
        form.append('candidateEmail', candidateEmail);
        if (offerId) form.append('offerId', String(offerId));
        return this.http.post<CvApplication>(`${this.BASE}/upload`, form);
    }

    updateStage(id: number, stage: KanbanStage, notes?: string): Observable<CvApplication> {
        return this.http.put<CvApplication>(`${this.BASE}/applications/${id}/stage`, { stage, notes });
    }

    searchCvs(keyword: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.BASE}/search`, { params: { keyword } });
    }
}
