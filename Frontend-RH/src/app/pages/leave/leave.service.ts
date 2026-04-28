import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveType {
    id: number;
    name: string;
    description: string;
    maxDaysPerYear: number;
    active: boolean;
}

export interface LeaveRequest {
    id: number;
    requester: { id: number; firstname: string; lastname: string; email: string };
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    durationDays: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    approverComment: string;
    createdAt: string;
    decidedAt: string;
}

export interface LeaveBalance {
    leaveType: LeaveType;
    year: number;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
}

export interface LeaveSubmitRequest {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveService {

    private readonly BASE = 'http://localhost:8090/api/v1/leaves';

    constructor(private http: HttpClient) {}

    getLeaveTypes(): Observable<LeaveType[]> {
        return this.http.get<LeaveType[]>(`${this.BASE}/types`);
    }

    getMyRequests(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(`${this.BASE}/my`);
    }

    getAllRequests(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(this.BASE);
    }

    getPendingRequests(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(`${this.BASE}/pending`);
    }

    submitRequest(payload: LeaveSubmitRequest): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(this.BASE, payload);
    }

    approve(id: number, comment: string): Observable<LeaveRequest> {
        return this.http.put<LeaveRequest>(`${this.BASE}/${id}/approve`, { comment });
    }

    reject(id: number, comment: string): Observable<LeaveRequest> {
        return this.http.put<LeaveRequest>(`${this.BASE}/${id}/reject`, { comment });
    }

    getMyBalances(): Observable<LeaveBalance[]> {
        return this.http.get<LeaveBalance[]>(`${this.BASE}/balance`);
    }
}
