/**
 * SharedCacheService — centralizes repeated getAll() API calls.
 *
 * Usage in components:
 *   constructor(private cache: SharedCacheService) {}
 *   ngOnInit(): void {
 *     this.cache.getEmployees().subscribe(employees => this.employees = employees);
 *   }
 *   // After creating/updating/deleting an employee:
 *   this.cache.invalidateEmployees();
 *
 * This prevents multiple components from each calling collaborateurService.getAll()
 * independently on the same page load.
 */
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { CollaborateurService } from './collaborateur.service';
import { DepartmentService } from './department.service';
import { StagiaireService } from './stagiaire.service';

@Injectable({ providedIn: 'root' })
export class SharedCacheService {

  private _employees$: Observable<any[]> | null = null;
  private _departments$: Observable<any[]> | null = null;
  private _activeDepartments$: Observable<any[]> | null = null;
  private _interns$: Observable<any[]> | null = null;

  constructor(
    private collaborateurService: CollaborateurService,
    private departmentService: DepartmentService,
    private stagiaireService: StagiaireService,
  ) {}

  /** Returns cached employee list. Call invalidateEmployees() after any mutation. */
  getEmployees(): Observable<any[]> {
    if (!this._employees$) {
      this._employees$ = this.collaborateurService.getAll().pipe(shareReplay(1));
    }
    return this._employees$;
  }

  invalidateEmployees(): void { this._employees$ = null; }

  /** Returns cached active departments list. */
  getActiveDepartments(): Observable<any[]> {
    if (!this._activeDepartments$) {
      this._activeDepartments$ = this.departmentService.getActiveDepartments().pipe(shareReplay(1));
    }
    return this._activeDepartments$;
  }

  invalidateDepartments(): void {
    this._departments$ = null;
    this._activeDepartments$ = null;
  }

  /** Returns cached interns list. */
  getInterns(): Observable<any[]> {
    if (!this._interns$) {
      this._interns$ = this.stagiaireService.getAll().pipe(shareReplay(1));
    }
    return this._interns$;
  }

  invalidateInterns(): void { this._interns$ = null; }

  /** Invalidate all caches (e.g., on logout or major data change). */
  invalidateAll(): void {
    this._employees$ = null;
    this._departments$ = null;
    this._activeDepartments$ = null;
    this._interns$ = null;
  }
}
