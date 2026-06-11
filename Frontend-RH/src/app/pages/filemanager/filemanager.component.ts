import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FileManagerService } from './filemanager.service';
import { ManagedFile } from 'src/app/core/models/hr.models';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CvService } from '../cv/cv.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

type ActiveTab   = 'cvs' | 'documents' | 'trash';
type FilterType  = 'all' | 'pdf' | 'word' | 'image' | 'other';
type FilterDate  = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
type FilterYear  = 'all' | string;
type FilterSize  = 'all' | 'small' | 'medium' | 'large';
type SortBy      = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest';

@Component({
    selector: 'app-filemanager',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit, OnDestroy {

    today = new Date();
    breadCrumbItems: Array<{}>;

    activeTab: ActiveTab = 'cvs';
    allFiles: ManagedFile[] = [];
    files: ManagedFile[] = [];
    trashedFiles: ManagedFile[] = [];
    isLoading = true;
    searchKeyword = '';

    // ── Filter state ──────────────────────────────────────────────────────────
    @ViewChild('filterBtn') filterBtnRef: ElementRef<HTMLElement>;
    filterOpen     = false;
    filterPanelTop  = 0;
    filterPanelLeft = 0;
    filterType: FilterType = 'all';
    filterDate: FilterDate = 'all';
    filterDateFrom = '';
    filterDateTo   = '';
    filterYear: FilterYear = 'all';
    filterName     = '';
    sortBy: SortBy = 'date-newest';

    readonly availableYears = ['2026', '2025', '2024', '2023'];

    get activeFiltersCount(): number {
        let n = 0;
        if (this.filterType !== 'all') n++;
        if (this.filterDate !== 'all') n++;
        if (this.filterYear !== 'all') n++;
        if (this.filterName.trim()) n++;
        if (this.sortBy !== 'date-newest') n++;
        return n;
    }

    get filterTypeLabel(): string {
        const map: Record<FilterType, string> = {
            all:   '',
            pdf:   'PDF',
            word:  'Word',
            image: 'Image',
            other: this.translate.instant('FILEMANAGER.FILTER_TYPE_OTHER'),
        };
        return map[this.filterType];
    }

    get filterDateLabel(): string {
        const map: Record<FilterDate, string> = {
            all: '',
            today: this.translate.instant('FILEMANAGER.FILTER_DATE_TODAY'),
            week:  this.translate.instant('FILEMANAGER.FILTER_DATE_WEEK'),
            month: this.translate.instant('FILEMANAGER.FILTER_DATE_MONTH'),
            year:  this.translate.instant('FILEMANAGER.FILTER_DATE_YEAR'),
            custom: this.translate.instant('FILEMANAGER.FILTER_DATE_RANGE'),
        };
        return map[this.filterDate];
    }

    get sortLabel(): string {
        const map: Record<SortBy, string> = {
            'name-asc':    this.translate.instant('FILEMANAGER.FILTER_SORT_AZ'),
            'name-desc':   this.translate.instant('FILEMANAGER.FILTER_SORT_ZA'),
            'date-newest': this.translate.instant('FILEMANAGER.FILTER_SORT_NEWEST'),
            'date-oldest': this.translate.instant('FILEMANAGER.FILTER_SORT_OLDEST'),
        };
        return map[this.sortBy];
    }

    private searchSubject = new Subject<string>();
    private searchSub: Subscription;

    constructor(
        private fileManagerService: FileManagerService,
        private confirmSvc: ConfirmService,
        private translate: TranslateService,
        private cvService: CvService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Apps' }, { label: 'File Manager', active: true }];
        this.loadFiles();

        this.searchSub = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => this.applyFilters());
    }

    ngOnDestroy(): void {
        this.searchSub?.unsubscribe();
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    setTab(tab: ActiveTab): void {
        if (tab === 'documents') { this.router.navigate(['/documents']); return; }
        this.activeTab = tab;
        this.searchKeyword = '';
        if (tab === 'cvs') this.loadFiles();
    }

    // ── My CVs ───────────────────────────────────────────────────────────────

    loadFiles(): void {
        this.isLoading = true;
        this.fileManagerService.getAll().subscribe({
            next: data => {
                this.allFiles = data;
                this.applyFilters();
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
        });
    }

    onSearchChange(value: string): void {
        this.searchSubject.next(value);
    }

    clearSearch(): void {
        this.searchKeyword = '';
        this.applyFilters();
    }

    // ── Advanced Filtering ───────────────────────────────────────────────────

    applyFilters(): void {
        const trashNames = new Set(this.trashedFiles.map(f => f.name));
        let result = this.allFiles.filter(f => !trashNames.has(f.name));

        // 1. Keyword search (main search bar)
        const kw = this.searchKeyword.trim().toLowerCase();
        if (kw) result = result.filter(f => f.name.toLowerCase().includes(kw));

        // 2. Candidate name fragment filter
        const nameKw = this.filterName.trim().toLowerCase();
        if (nameKw) result = result.filter(f => f.name.toLowerCase().includes(nameKw));

        // 3. File type
        if (this.filterType !== 'all') {
            result = result.filter(f => {
                const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
                if (this.filterType === 'pdf')   return ext === 'pdf';
                if (this.filterType === 'word')  return ['doc', 'docx'].includes(ext);
                if (this.filterType === 'image') return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                if (this.filterType === 'other') return !['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                return true;
            });
        }

        // 4. Date modified preset
        if (this.filterDate !== 'all') {
            const now = new Date();
            result = result.filter(f => {
                const d = new Date(f.dateModified);
                if (isNaN(d.getTime())) return true;
                if (this.filterDate === 'today') return d.toDateString() === now.toDateString();
                if (this.filterDate === 'week')  { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
                if (this.filterDate === 'month') { const m = new Date(now); m.setMonth(now.getMonth() - 1); return d >= m; }
                if (this.filterDate === 'year')  { const y = new Date(now); y.setFullYear(now.getFullYear() - 1); return d >= y; }
                if (this.filterDate === 'custom') {
                    if (this.filterDateFrom && d < new Date(this.filterDateFrom)) return false;
                    if (this.filterDateTo) { const to = new Date(this.filterDateTo); to.setHours(23,59,59); if (d > to) return false; }
                    return true;
                }
                return true;
            });
        }

        // 5. Year filter
        if (this.filterYear !== 'all') {
            result = result.filter(f => {
                const d = new Date(f.dateModified);
                return !isNaN(d.getTime()) && d.getFullYear().toString() === this.filterYear;
            });
        }

        // Sort
        result = [...result].sort((a, b) => {
            if (this.sortBy === 'name-asc')  return a.name.localeCompare(b.name);
            if (this.sortBy === 'name-desc') return b.name.localeCompare(a.name);
            const da = new Date(a.dateModified).getTime() || 0;
            const db = new Date(b.dateModified).getTime() || 0;
            return this.sortBy === 'date-newest' ? db - da : da - db;
        });

        this.files = result;
    }

    clearFilters(): void {
        this.filterType    = 'all';
        this.filterDate    = 'all';
        this.filterDateFrom = '';
        this.filterDateTo   = '';
        this.filterYear    = 'all';
        this.filterName    = '';
        this.sortBy        = 'date-newest';
        this.applyFilters();
    }

    toggleFilter(): void {
        this.filterOpen = !this.filterOpen;
        if (this.filterOpen && this.filterBtnRef) {
            const rect = this.filterBtnRef.nativeElement.getBoundingClientRect();
            const panelWidth = 320;
            this.filterPanelTop  = rect.bottom + 6;
            // align panel's right edge to button's right edge, clamped to viewport
            this.filterPanelLeft = Math.max(8, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 8));
        }
    }

    openFile(fileName: string): void {
        this.fileManagerService.getFileBlob(fileName).subscribe({
            next: blob => {
                const url = URL.createObjectURL(blob);
                const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
                const viewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
                if (viewable.includes(ext)) {
                    const tab = window.open(url, '_blank');
                    // revoke after browser has loaded the resource
                    if (tab) tab.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
                    setTimeout(() => URL.revokeObjectURL(url), 30000);
                } else {
                    // Word/Excel/other — trigger download
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            },
            error: () => alert('Could not open file. Please try again.')
        });
    }

    moveToTrash(file: ManagedFile): void {
        this.trashedFiles = [file, ...this.trashedFiles];
        this.applyFilters();
    }

    async deleteAllFiles(): Promise<void> {
        const confirmed = await this.confirmSvc.confirm(
            this.translate.instant('FILEMANAGER.CONFIRM_DELETE_ALL_MSG'),
            this.translate.instant('FILEMANAGER.CONFIRM_TITLE')
        );
        if (!confirmed) return;
        this.fileManagerService.deleteAll().subscribe({
            next: async () => {
                this.files = [];
                this.trashedFiles = [];
                await this.confirmSvc.alert(
                    this.translate.instant('FILEMANAGER.TOAST_ALL_DELETED'),
                    this.translate.instant('FILEMANAGER.TOAST_DELETED_TITLE'),
                    'success'
                );
            },
            error: async () => await this.confirmSvc.alert(
                this.translate.instant('FILEMANAGER.TOAST_DELETE_FAILED'),
                this.translate.instant('FILEMANAGER.TOAST_ERROR_TITLE'),
                'error'
            ),
        });
    }

    // ── Trash ────────────────────────────────────────────────────────────────

    restoreFile(file: ManagedFile): void {
        this.trashedFiles = this.trashedFiles.filter(f => f.name !== file.name);
        this.applyFilters();
    }

    async permanentlyDelete(file: ManagedFile): Promise<void> {
        const confirmed = await this.confirmSvc.confirm(
            this.translate.instant('FILEMANAGER.CONFIRM_DELETE_FILE_MSG', { name: file.name }),
            this.translate.instant('FILEMANAGER.CONFIRM_TITLE')
        );
        if (!confirmed) return;
        this.fileManagerService.delete(file.name).subscribe({
            next: async () => {
                this.trashedFiles = this.trashedFiles.filter(f => f.name !== file.name);
                await this.confirmSvc.alert(
                    this.translate.instant('FILEMANAGER.TOAST_FILE_DELETED'),
                    this.translate.instant('FILEMANAGER.TOAST_DELETED_TITLE'),
                    'success'
                );
            },
            error: async () => await this.confirmSvc.alert(
                this.translate.instant('FILEMANAGER.TOAST_DELETE_FAILED'),
                this.translate.instant('FILEMANAGER.TOAST_ERROR_TITLE'),
                'error'
            ),
        });
    }

    async emptyTrash(): Promise<void> {
        if (this.trashedFiles.length === 0) return;
        const confirmed = await this.confirmSvc.confirm(
            this.translate.instant('FILEMANAGER.TRASH_EMPTY_CONFIRM'),
            this.translate.instant('FILEMANAGER.CONFIRM_TITLE')
        );
        if (!confirmed) return;
        const deletions = this.trashedFiles.map(f =>
            this.fileManagerService.delete(f.name).subscribe()
        );
        this.trashedFiles = [];
        await this.confirmSvc.alert(
            this.translate.instant('FILEMANAGER.TRASH_EMPTIED'),
            this.translate.instant('FILEMANAGER.TOAST_DELETED_TITLE'),
            'success'
        );
    }

    // ── Forward to Recruitment ───────────────────────────────────────────────

    async forwardToRecruitment(file: ManagedFile): Promise<void> {
        const confirmed = await this.confirmSvc.confirm(
            this.translate.instant('FILEMANAGER.FORWARD_CONFIRM_MSG', { name: file.name }),
            this.translate.instant('FILEMANAGER.FORWARD_CONFIRM_TITLE')
        );
        if (!confirmed) return;

        this.fileManagerService.getFileBlob(file.name).subscribe({
            next: async blob => {
                const f = new File([blob], file.name, { type: blob.type || 'application/octet-stream' });
                this.cvService.uploadCv(f, '', '').subscribe({
                    next: async () => {
                        // remove from list and trash backend copy
                        this.fileManagerService.delete(file.name).subscribe();
                        this.files = this.files.filter(x => x.name !== file.name);
                        await this.confirmSvc.alert(
                            this.translate.instant('FILEMANAGER.FORWARD_SUCCESS_MSG', { name: file.name }),
                            this.translate.instant('FILEMANAGER.FORWARD_SUCCESS_TITLE'),
                            'success'
                        );
                        this.router.navigate(['/recruitment']);
                    },
                    error: async () => await this.confirmSvc.alert(
                        this.translate.instant('FILEMANAGER.FORWARD_ERROR'),
                        this.translate.instant('FILEMANAGER.TOAST_ERROR_TITLE'),
                        'error'
                    )
                });
            },
            error: async () => await this.confirmSvc.alert(
                this.translate.instant('FILEMANAGER.FORWARD_FETCH_ERROR'),
                this.translate.instant('FILEMANAGER.TOAST_ERROR_TITLE'),
                'error'
            )
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    getFileIcon(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'mdi mdi-file-pdf text-danger';
        if (ext === 'doc' || ext === 'docx') return 'mdi mdi-file-word text-primary';
        if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) return 'mdi mdi-file-image text-muted';
        return 'mdi mdi-file-document text-dark';
    }
}
