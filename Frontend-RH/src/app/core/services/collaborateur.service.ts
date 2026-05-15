import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Collaborateur, CollaborateurCreateDto } from 'src/app/core/models/hr.models';

/** Maps a backend CollaborateurResponse (English camelCase) to the frontend Collaborateur (French names). */
function mapEmployee(e: any): Collaborateur {
    return {
        matricule: e.id,
        nom:       e.lastName  ?? '',
        prenom:    e.firstName ?? '',
        email:     e.email     ?? '',
        sexe:      genderToSexe(e.gender),
        CIN:       e.cin       ?? '',
        Nationalité: e.nationality ?? '',
        CATEGORIE:   e.category    ?? '',
        age:         e.age         ?? undefined,
        date_naissance: e.dateOfBirth  ?? '',
        FILIALE:        e.branch       ?? '',
        Type:           e.contractType ?? '',
        Département:    e.department?.name ?? '',
        Fonction:       e.position?.name   ?? '',
        date_entree:    e.hireDate          ?? '',
        Ancienneté:     e.seniorityYears    ?? 0,
        status:         e.status            ?? '',
        _backendId:     e.id,
        _departmentId:  e.department?.id    ?? null,
        _positionId:    e.position?.id      ?? null,
        _version:       e.version           ?? 0,
    } as any;
}

function genderToSexe(gender?: string): string {
    if (!gender) return '';
    const g = gender.toUpperCase();
    if (g === 'MALE')   return 'M';
    if (g === 'FEMALE') return 'F';
    return gender;
}

/** Maps the frontend form (French names) back to a backend CollaborateurRequest (English, with IDs). */
export function mapToBackendRequest(dto: any): any {
    // Use || (not ??) for optional fields so empty strings '' also fall through to null
    const orNull = (v: any) => v || null;
    return {
        firstName:    dto.prenom      || dto.firstName || '',
        lastName:     dto.nom         || dto.lastName  || '',
        gender:       sexeToGender(dto.sexe || dto.gender),
        cin:          orNull(dto.CIN         ?? dto.cin),
        nationality:  orNull(dto.Nationalité ?? dto.nationalite ?? dto.nationality),
        category:     orNull(dto.CATEGORIE   ?? dto.category),
        dateOfBirth:  orNull(dto.date_naissance ?? dto.dateOfBirth),
        email:        dto.email       || '',
        phone:        orNull(dto.phone),
        address:      orNull(dto.address),
        branch:       orNull(dto.FILIALE ?? dto.branch),
        departmentId: dto.departmentId ?? dto._departmentId ?? null,
        positionId:   dto.positionId  ?? dto._positionId  ?? null,
        contractType: mapContractType(dto.Type ?? dto.contractType),
        hireDate:     orNull(dto.date_entree ?? dto.hireDate),
        status:       dto.status      || 'ACTIVE',
        version:      dto.version     ?? dto._version ?? null,
    };
}

function sexeToGender(sexe?: string): string {
    if (!sexe) return 'MALE';
    const s = sexe.toUpperCase();
    if (s === 'M' || s === 'MASCULIN' || s === 'MALE' || s === 'HOMME') return 'MALE';
    if (s === 'F' || s === 'FEMININ'  || s === 'FEMALE' || s === 'FEMME') return 'FEMALE';
    return 'MALE';
}

function mapContractType(type?: string): string {
    if (!type) return 'CDI';
    const t = type.toUpperCase();
    if (t === 'CDI')    return 'CDI';
    if (t === 'CDD')    return 'CDD';
    if (t === 'STAGE')  return 'STAGE';
    if (t.includes('INTÉRIM') || t.includes('INTERIM')) return 'INTERIM';
    return t;
}

@Injectable({ providedIn: 'root' })
export class CollaborateurService {

    private readonly BASE = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) {}

    getAll(search?: string): Observable<Collaborateur[]> {
        let params = new HttpParams().set('size', '200');
        if (search?.trim()) params = params.set('search', search.trim());
        return this.http.get<any>(this.BASE, { params }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res)
                    ? res
                    : (res?.content ?? res?.data ?? []);
                return items.map(mapEmployee);
            }),
            catchError(this.handleError)
        );
    }

    getById(id: number): Observable<Collaborateur> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}`).pipe(
            map(res => mapEmployee(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    create(dto: CollaborateurCreateDto | any): Observable<Collaborateur> {
        const body = mapToBackendRequest(dto);
        return this.http.post<any>(this.BASE, body).pipe(
            map(res => mapEmployee(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    update(id: number, dto: Partial<CollaborateurCreateDto> | any): Observable<Collaborateur> {
        if (!id) return throwError(() => new Error('id is required'));
        const body = mapToBackendRequest({ ...dto, _backendId: id });
        return this.http.put<any>(`${this.BASE}/${id}`, body).pipe(
            map(res => mapEmployee(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    /** PATCH /employees/{id}/status?status=X */
    updateStatus(id: number, status: string): Observable<Collaborateur> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/status`, null, { params: { status } }).pipe(
            map(res => mapEmployee(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    /** GET /employees/department/{departmentId} */
    getByDepartment(departmentId: number): Observable<Collaborateur[]> {
        return this.http.get<any>(`${this.BASE}/department/${departmentId}`, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items.map(mapEmployee);
            }),
            catchError(this.handleError)
        );
    }

    /** PATCH /employees/{id}/link-user/{userId} */
    linkUser(id: number, userId: number): Observable<Collaborateur> {
        return this.http.patch<any>(`${this.BASE}/${id}/link-user/${userId}`, null).pipe(
            map(res => mapEmployee(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    /** PATCH /employees/{id}/unlink-user */
    unlinkUser(id: number): Observable<Collaborateur> {
        return this.http.patch<any>(`${this.BASE}/${id}/unlink-user`, null).pipe(
            map(res => mapEmployee(res?.data ?? res)),
            catchError(this.handleError)
        );
    }

    importFromExcel(file: File): Observable<string> {
        if (!file) return throwError(() => new Error('file is required'));
        const form = new FormData();
        form.append('file', file);
        return this.http.post(`${environment.apiUrl}/excel/import`, form, { responseType: 'text' }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        console.error('[CollaborateurService] Error:', err);
        return throwError(() => err);
    }
}
