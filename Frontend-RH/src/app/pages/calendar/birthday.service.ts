import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Collaborateur } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class BirthdayService {

    /** Backend endpoint: GET /employees */
    private readonly API = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) {}

    getBirthdays(): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(this.API).pipe(
            catchError(err => { console.error('[BirthdayService] Error fetching employees:', err); return of([]); })
        );
    }
}
