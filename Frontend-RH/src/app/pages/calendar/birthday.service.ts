import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BirthdayService {

    private readonly API = 'http://localhost:8090/api/v1/Collaborateurs';

    constructor(private http: HttpClient) {}

    getBirthdays(): Observable<any[]> {
        return this.http.get<any[]>(this.API).pipe(
            catchError(err => { console.error('Error fetching birthdays:', err); return of([]); })
        );
    }
}
