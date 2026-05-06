import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ManagedFile } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class FileManagerService {

    private readonly BASE = `${environment.filesUrl}`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<ManagedFile[]> {
        return this.http.get<string[]>(`${this.BASE}/all`).pipe(
            map(names => names.map(name => ({
                name,
                dateModified: new Date().toLocaleDateString(),
                size: 'Unknown'
            }))),
            catchError(this.handleError)
        );
    }

    search(keywords: string): Observable<ManagedFile[]> {
        if (!keywords?.trim()) return throwError(() => new Error('keywords is required'));
        const params = new HttpParams().set('keywords', keywords);
        return this.http.get<string[]>(`${this.BASE}/search`, { params }).pipe(
            map(names => names.map(name => ({
                name,
                dateModified: new Date().toLocaleDateString(),
                size: 'Unknown'
            }))),
            catchError(this.handleError)
        );
    }

    upload(file: File): Observable<void> {
        if (!file) return throwError(() => new Error('file is required'));
        const form = new FormData();
        form.append('file', file);
        return this.http.post<void>(`${this.BASE}/upload`, form).pipe(catchError(this.handleError));
    }

    delete(filename: string): Observable<void> {
        if (!filename) return throwError(() => new Error('filename is required'));
        const params = new HttpParams().set('filename', filename);
        return this.http.delete<void>(`${this.BASE}/delete`, { params }).pipe(catchError(this.handleError));
    }

    deleteAll(): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/deleteAll`).pipe(catchError(this.handleError));
    }

    getViewUrl(filename: string): string {
        return `${this.BASE}/view?filename=${encodeURIComponent(filename)}`;
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
