import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { ReportService } from 'src/app/core/services/report.service';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { TranslateService } from '@ngx-translate/core';
import { AttendanceService } from 'src/app/pages/attendance/attendance.service';
import { LeaveRequest } from 'src/app/core/models/hr.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  today: Date = new Date();

  // Employee stats (from real API)
  totalCollaborateurs = 0;
  maleCount   = 0;
  femaleCount = 0;
  malePct     = 0;
  femalePct   = 0;

  // KPI (from /reports/kpi)
  totalInterns   = 0;
  pendingLeaves  = 0;
  totalUsers     = 0;

  // Attendance (dynamic — from /leaves)
  attendancePct    = 0;
  attendanceTrend  = 0;
  selectedPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'monthly';
  showPeriodDropdown = false;
  private cachedLeaves: LeaveRequest[] = [];

  // KPI score display (static UI — no backend endpoint)
  kpiScore = 0;

  // Projects (static UI — no backend endpoint)
  projectsOnProgress = 0;
  projectsDone       = 0;

  // Table
  tableTabs  = ['DASHBOARD.TAB_ATTENDANCE', 'DASHBOARD.TAB_PROJECTS', 'DASHBOARD.TAB_PERFORMANCE', 'DASHBOARD.TAB_DAYOFF'];
  activeTab  = 'DASHBOARD.TAB_ATTENDANCE';
  tableRows: any[] = [];
  private allEmployees: any[] = [];

  // Today Used Devices (static UI element — no backend)
  showDevicesModal = false;
  devicesTab: 'activity' | 'history' = 'activity';
  totalDeviceUsers = 0;
  deviceBreakdown = [
    { label: 'DASHBOARD.DEVICE_MOBILE',  icon: 'bx-mobile',      users: 0 },
    { label: 'DASHBOARD.DEVICE_DESKTOP', icon: 'bx-desktop',      users: 0 },
    { label: 'DASHBOARD.DEVICE_NFC',     icon: 'bx-credit-card',  users: 0 },
  ];
  deviceActivity: any[] = [];

  // Expiring Contracts widget
  expiringContracts: any[] = [];
  expiringContractsLoading = false;

  // Heatmap
  heatmapWeekLabels: string[]  = ['W1','W2','W3','W4','W5','',''];
  heatmapColLabels:  string[]  = ['DASHBOARD.DAY_MON','DASHBOARD.DAY_TUE','DASHBOARD.DAY_WED','DASHBOARD.DAY_THU','DASHBOARD.DAY_FRI','DASHBOARD.DAY_SAT','DASHBOARD.DAY_SUN'];
  heatmapColIsI18n = true;
  heatmapData: number[][] = [];

  get periodLabel(): string {
    const map: Record<string, string> = { monthly: 'DASHBOARD.MONTHLY', weekly: 'DASHBOARD.WEEKLY', daily: 'DASHBOARD.DAILY', hourly: 'DASHBOARD.HOURLY' };
    return map[this.selectedPeriod];
  }

  get attendanceLabel(): string {
    const map: Record<string, string> = { monthly: 'DASHBOARD.ATTENDANCE_LABEL_MONTHLY', weekly: 'DASHBOARD.ATTENDANCE_LABEL_WEEKLY', daily: 'DASHBOARD.ATTENDANCE_LABEL_DAILY', hourly: 'DASHBOARD.ATTENDANCE_LABEL_HOURLY' };
    return map[this.selectedPeriod];
  }

  // Charts
  kpiBarChart: any = {};
  projBarChart: any = {};
  genderDonutChart: any = {};

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    public themeService: ThemeService,
    private collaborateurService: CollaborateurService,
    private reportService: ReportService,
    private stagiaireService: StagiaireService,
    private translate: TranslateService,
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildSeedHeatmap();
    this.buildKpiChart([1]);
    this.buildProjChart([0]);
    this.buildGenderChart(0, 0);
    this.fetchData();
    this.fetchAttendance();
    this.loadExpiringContracts();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  trackById(_: number, item: any): any { return item.id ?? item._backendId ?? item.matricule ?? _; }
  trackByIndex(index: number): number { return index; }

  goAddEmployee(): void {
    this.router.navigate(['/collaborateur']);
  }

  navigateToEmployees(filter?: string): void {
    this.router.navigate(['/collaborateur'], filter ? { queryParams: { status: filter } } : {});
  }

  navigateToLeaves(filter?: string): void {
    this.router.navigate(['/dayoff'], filter ? { queryParams: { status: filter } } : {});
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.loadTableRows();
  }

  getHeatColor(val: number): string {
    const alpha = (val / 10).toFixed(2);
    if (this.themeService.isDark()) {
      const light = Math.round(20 + (val / 10) * 45);
      return `hsl(177,${Math.round(35 + val * 5)}%,${light}%)`;
    }
    return `rgba(47,168,160,${alpha})`;
  }

  loadExpiringContracts(): void {
    this.expiringContractsLoading = true;
    this.collaborateurService.getExpiringContracts(30).pipe(takeUntil(this.destroy$)).subscribe({
      next: data => { this.expiringContracts = data; this.expiringContractsLoading = false; },
      error: () => { this.expiringContractsLoading = false; }
    });
  }

  contractAlertClass(daysLeft: number): string {
    if (daysLeft <= 7)  return 'exp-chip--danger';
    if (daysLeft <= 14) return 'exp-chip--warn';
    return 'exp-chip--ok';
  }

  private fetchData(): void {
    // Load employees from /Collaborateurs
    this.collaborateurService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.allEmployees = data;
        this.totalCollaborateurs = data.length;
        this.maleCount = data.filter(e => {
          const s = ((e as any).Sexe ?? (e as any).sexe ?? '').toUpperCase();
          return s === 'M' || s === 'MASCULIN' || s === 'HOMME' || s === 'MALE';
        }).length;
        this.femaleCount = this.totalCollaborateurs - this.maleCount;
        if (this.totalCollaborateurs > 0) {
          this.malePct   = Math.round(this.maleCount   / this.totalCollaborateurs * 100);
          this.femalePct = 100 - this.malePct;
        }
        // Use department distribution to drive the project chart
        const deptMap = new Map<string, number>();
        data.forEach(e => {
          const dept = ((e as any).Département ?? (e as any).département ?? 'Other').trim();
          deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
        });
        const deptCounts = Array.from(deptMap.values()).slice(0, 12);
        this.projectsDone = this.totalCollaborateurs;
        this.buildProjChart(deptCounts.length > 0 ? deptCounts : [0]);
        this.buildGenderChart(this.malePct, this.femalePct);
        this.loadTableRows();
      },
      error: () => {}
    });

    // Load KPIs from /reports/kpi
    this.reportService.getKpis().pipe(takeUntil(this.destroy$)).subscribe({
      next: kpi => {
        this.totalInterns  = kpi.totalInterns  ?? 0;
        this.pendingLeaves = kpi.pendingLeaves ?? 0;
        this.totalUsers    = kpi.totalUsers    ?? 0;
        this.projectsOnProgress = this.pendingLeaves;
        if (kpi.totalEmployees > 0 && this.totalCollaborateurs === 0) {
          this.totalCollaborateurs = kpi.totalEmployees;
          this.projectsDone        = kpi.totalEmployees;
        }
        // KPI chart: employees / interns / pending leaves as 3 bars, padded to 12
        const kpiValues = [
          kpi.totalEmployees, this.totalInterns, this.pendingLeaves,
          kpi.totalEmployees, this.totalInterns, this.pendingLeaves,
          kpi.totalEmployees, this.totalInterns, this.pendingLeaves,
          kpi.totalEmployees, this.totalInterns, this.pendingLeaves,
        ];
        const maxVal = Math.max(1, ...kpiValues);
        const normalized = kpiValues.map(v => Math.round((v / maxVal) * 9) + 1);
        this.kpiScore = Math.round((this.totalUsers > 0 ? Math.min(10, this.totalCollaborateurs / this.totalUsers * 10) : 0) * 10) / 10;
        this.buildKpiChart(normalized);
      },
      error: () => {}
    });

    // Load interns from /stagiares
    this.stagiaireService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => { if (data.length > 0) this.totalInterns = data.length; },
      error: () => {}
    });
  }

  private loadTableRows(): void {
    const today = this.localDateKey(new Date());
    const deptPalette = ['marketing', 'technology', 'hr', 'finance', 'default'];
    const deptColorMap = new Map<string, string>();
    let colorIdx = 0;
    const deptClass = (dept: string): string => {
      const key = dept.toLowerCase().trim();
      if (key.includes('tech') || key.includes('it') || key.includes('info')) return 'technology';
      if (key.includes('hr') || key.includes('human') || key.includes('rh')) return 'hr';
      if (key.includes('fin') || key.includes('compt') || key.includes('account')) return 'finance';
      if (key.includes('market') || key.includes('comm') || key.includes('vente')) return 'marketing';
      if (!deptColorMap.has(dept)) deptColorMap.set(dept, deptPalette[colorIdx++ % deptPalette.length]);
      return deptColorMap.get(dept)!;
    };
    const statusClass = (s: string): string =>
      s === 'APPROVED' || s === 'PRESENT' ? 'attend' : s === 'PENDING' || s === 'ON LEAVE' ? 'dayoff' : 'sick';

    if (this.activeTab === 'DASHBOARD.TAB_DAYOFF') {
      this.tableRows = this.cachedLeaves.map(lv => ({
        id: String(lv.id ?? '—'),
        name: lv.requester?.name ?? '—',
        dept: lv.leaveType?.name ?? '—',
        deptClass: 'technology',
        status: lv.status,
        statusClass: statusClass(lv.status),
        checkIn: lv.startDate ?? '—',
        checkOut: lv.endDate ?? '—',
      }));
    } else {
      const onLeaveToday = new Set<number>();
      const todayDate = new Date(today + 'T00:00:00');
      for (const lv of this.cachedLeaves.filter(l => l.status === 'APPROVED')) {
        const start = new Date(lv.startDate + 'T00:00:00');
        const end   = new Date(lv.endDate   + 'T00:00:00');
        if (todayDate >= start && todayDate <= end && lv.requester?.id != null) {
          onLeaveToday.add(lv.requester.id);
        }
      }
      this.tableRows = this.allEmployees.map(e => {
        const dept = ((e.Département ?? e.département ?? '') as string).trim() || '—';
        const empId = e._backendId ?? e.matricule;
        const isOnLeave = onLeaveToday.has(empId);
        return {
          id: String(e.matricule ?? '—'),
          name: `${e.prenom ?? ''} ${e.nom ?? ''}`.trim() || '—',
          dept,
          deptClass: deptClass(dept),
          status: isOnLeave ? 'ON LEAVE' : 'PRESENT',
          statusClass: isOnLeave ? 'dayoff' : 'attend',
          checkIn: isOnLeave ? '—' : '09:00',
          checkOut: isOnLeave ? '—' : '17:00',
        };
      });
    }
  }

  private buildSeedHeatmap(): void {
    const seed = new Date().getDate();
    this.heatmapData = Array.from({ length: 7 }, (_, row) =>
      Array.from({ length: 7 }, (__, col) => {
        const base = ((seed * (row + 1) * (col + 1)) % 9) + 1;
        return (col >= 5) ? Math.floor(base * 0.3) : base;
      })
    );
  }

  @HostListener('document:click')
  closeDropdowns(): void { this.showPeriodDropdown = false; }

  setPeriod(period: 'hourly' | 'daily' | 'weekly' | 'monthly'): void {
    this.selectedPeriod     = period;
    this.showPeriodDropdown = false;
    this.heatmapData        = [];           // force grid teardown
    this.computeAttendance(this.cachedLeaves);
    this.buildHeatmapForPeriod(this.cachedLeaves);
    this.cdr.detectChanges();
  }

  private fetchAttendance(): void {
    this.attendanceService.getAllLeaves().pipe(takeUntil(this.destroy$)).subscribe({
      next: leaves => {
        this.cachedLeaves = leaves;
        this.computeAttendance(leaves);
        this.buildHeatmapForPeriod(leaves);
        this.loadTableRows();
      },
      error: () => {}
    });
  }

  private computeAttendance(leaves: LeaveRequest[]): void {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth();
    const total = Math.max(1, this.totalCollaborateurs);
    const absMap = this.buildAbsenceMap(leaves);

    const workingDays = (y: number, m: number): number => {
      const days = new Date(y, m + 1, 0).getDate();
      let n = 0;
      for (let d = 1; d <= days; d++) { const dow = new Date(y, m, d).getDay(); if (dow !== 0 && dow !== 6) n++; }
      return n;
    };

    const absentInRange = (start: Date, end: Date): number => {
      let n = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const dow = cur.getDay();
        if (dow !== 0 && dow !== 6) n += absMap.get(this.localDateKey(cur)) ?? 0;
        cur.setDate(cur.getDate() + 1);
      }
      return n;
    };

    let curPct = 100, prevPct = 100;

    if (this.selectedPeriod === 'monthly') {
      const curWork = workingDays(year, month);
      const curAbs  = absentInRange(new Date(year, month, 1), new Date(year, month + 1, 0));
      curPct = curWork > 0 ? Math.round(((total * curWork - curAbs) / (total * curWork)) * 100) : 100;
      const pm = month === 0 ? 11 : month - 1, py = month === 0 ? year - 1 : year;
      const prevWork = workingDays(py, pm);
      const prevAbs  = absentInRange(new Date(py, pm, 1), new Date(py, pm + 1, 0));
      prevPct = prevWork > 0 ? Math.round(((total * prevWork - prevAbs) / (total * prevWork)) * 100) : 100;

    } else if (this.selectedPeriod === 'weekly') {
      const mon = new Date(now); mon.setDate(now.getDate() - (now.getDay() + 6) % 7);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 4); // Mon–Fri
      const days = 5;
      const abs  = absentInRange(mon, sun);
      curPct  = Math.round(((total * days - abs) / (total * days)) * 100);
      const prevMon = new Date(mon); prevMon.setDate(mon.getDate() - 7);
      const prevSun = new Date(prevMon); prevSun.setDate(prevMon.getDate() + 4);
      const prevAbs = absentInRange(prevMon, prevSun);
      prevPct = Math.round(((total * days - prevAbs) / (total * days)) * 100);

    } else if (this.selectedPeriod === 'daily') {
      const today = this.localDateKey(now);
      const todayAbs = absMap.get(today) ?? 0;
      curPct = Math.round(((total - todayAbs) / total) * 100);
      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      const yAbs = absMap.get(this.localDateKey(yesterday)) ?? 0;
      prevPct = Math.round(((total - yAbs) / total) * 100);

    } else { // hourly — use today's data
      const today = this.localDateKey(now);
      const todayAbs = absMap.get(today) ?? 0;
      curPct  = Math.round(((total - todayAbs) / total) * 100);
      prevPct = curPct;
    }

    this.attendancePct   = curPct;
    this.attendanceTrend = curPct - prevPct;
  }

  private buildHeatmapForPeriod(leaves: LeaveRequest[]): void {
    switch (this.selectedPeriod) {
      case 'monthly': this.buildMonthlyHeatmap(leaves); break;
      case 'weekly':  this.buildWeeklyHeatmap(leaves);  break;
      case 'daily':   this.buildDailyHeatmap(leaves);   break;
      case 'hourly':  this.buildHourlyHeatmap(leaves);  break;
    }
  }

  // ── Monthly: weeks of current month × Mon-Sun ──────────────────────────────
  private buildMonthlyHeatmap(leaves: LeaveRequest[]): void {
    const now = new Date(), year = now.getFullYear(), month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
    const absMap = this.buildAbsenceMap(leaves);
    const total  = Math.max(1, this.totalCollaborateurs);
    const labels: string[] = [], grid: number[][] = [];

    for (let w = 0; w < 6; w++) {
      const row: number[] = []; let weekLabel = '';
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d - firstDow + 1;
        if (dayNum < 1 || dayNum > daysInMonth) { row.push(0); continue; }
        if (!weekLabel) weekLabel = `${dayNum}/${month + 1}`;
        const absent = absMap.get(this.localDateKey(new Date(year, month, dayNum))) ?? 0;
        row.push(Math.round(Math.max(1, Math.min(10, ((total - absent) / total) * 10))));
      }
      if (row.every(v => v === 0) && w >= 4) break;
      grid.push(row); labels.push(weekLabel);
    }
    while (grid.length < 7) { grid.push(Array(7).fill(0)); labels.push(''); }

    this.heatmapColLabels  = ['DASHBOARD.DAY_MON','DASHBOARD.DAY_TUE','DASHBOARD.DAY_WED','DASHBOARD.DAY_THU','DASHBOARD.DAY_FRI','DASHBOARD.DAY_SAT','DASHBOARD.DAY_SUN'];
    this.heatmapColIsI18n  = true;
    this.heatmapWeekLabels = labels;
    this.heatmapData       = [...grid];
  }

  // ── Weekly: Mon-Sun of each of the last 7 weeks ──────────────────────────
  private buildWeeklyHeatmap(leaves: LeaveRequest[]): void {
    const now    = new Date();
    const absMap = this.buildAbsenceMap(leaves);
    const total  = Math.max(1, this.totalCollaborateurs);
    // Monday of current week
    const curMon = new Date(now);
    curMon.setHours(0, 0, 0, 0);
    curMon.setDate(now.getDate() - (now.getDay() + 6) % 7);

    const labels: string[] = [], grid: number[][] = [];
    // Each row = one of the last 7 weeks (oldest first)
    for (let w = 6; w >= 0; w--) {
      const weekMon = new Date(curMon);
      weekMon.setDate(curMon.getDate() - w * 7);
      const row: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekMon); date.setDate(weekMon.getDate() + d);
        const dow = date.getDay();
        if (dow === 0 || dow === 6) { row.push(0); continue; }
        const absent = absMap.get(this.localDateKey(date)) ?? 0;
        row.push(Math.round(Math.max(1, Math.min(10, ((total - absent) / total) * 10))));
      }
      grid.push(row);
      labels.push(`${weekMon.getDate()}/${weekMon.getMonth() + 1}`);
    }

    this.heatmapColLabels  = ['DASHBOARD.DAY_MON','DASHBOARD.DAY_TUE','DASHBOARD.DAY_WED','DASHBOARD.DAY_THU','DASHBOARD.DAY_FRI','DASHBOARD.DAY_SAT','DASHBOARD.DAY_SUN'];
    this.heatmapColIsI18n  = true;
    this.heatmapWeekLabels = labels;
    this.heatmapData       = [...grid];
  }

  // ── Daily: last 7 days (rows) × time-of-day slots (cols) ────────────────
  private buildDailyHeatmap(leaves: LeaveRequest[]): void {
    const now    = new Date();
    const absMap = this.buildAbsenceMap(leaves);
    const total  = Math.max(1, this.totalCollaborateurs);
    // Typical office presence curve across 7 two-hour blocks
    const slotW  = [0.50, 0.87, 0.97, 0.82, 0.95, 0.78, 0.40];
    const labels: string[] = [], grid: number[][] = [];

    for (let d = 6; d >= 0; d--) {
      const date = new Date(now); date.setDate(now.getDate() - d);
      const dow  = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const absent   = absMap.get(this.localDateKey(date)) ?? 0;
      const rate     = isWeekend ? 0 : (total - absent) / total;
      grid.push(slotW.map(w => Math.round(Math.min(10, rate * w * 10))));
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
    }

    this.heatmapColLabels  = ['07:00','09:00','11:00','13:00','15:00','17:00','19:00'];
    this.heatmapColIsI18n  = false;
    this.heatmapWeekLabels = labels;
    this.heatmapData       = [...grid];
  }

  // ── Hourly: hour slots of TODAY (rows) × last 7 days (cols) ─────────────
  private buildHourlyHeatmap(leaves: LeaveRequest[]): void {
    const now    = new Date();
    const absMap = this.buildAbsenceMap(leaves);
    const total  = Math.max(1, this.totalCollaborateurs);
    const curH   = now.getHours();
    // 7 hourly slots starting at 07:00
    const hours  = [7, 8, 9, 10, 11, 12, 13];
    const slotW  = [0.38, 0.72, 0.96, 0.99, 0.95, 0.80, 0.75];

    // Build last-7-days rates to use as column values
    const dayRates: number[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now); date.setDate(now.getDate() - d);
      const dow  = date.getDay();
      const absent = (dow === 0 || dow === 6) ? total : (absMap.get(this.localDateKey(date)) ?? 0);
      dayRates.push((total - absent) / total);
    }

    // Each ROW = one hour slot; each COL = one of the last 7 days
    const grid: number[][] = [], labels: string[] = [];
    for (let h = 0; h < 7; h++) {
      const isPastHour = hours[h] <= curH;
      const row = dayRates.map((rate, di) => {
        const isTodayCol = di === 6;
        if (isTodayCol && !isPastHour) return 0; // future hours of today = empty
        return Math.round(Math.min(10, rate * slotW[h] * 10));
      });
      grid.push(row);
      labels.push(`${hours[h]}:00`);
    }

    // Columns = last 7 days labels (Mon 12/5, etc.)
    const colLabels: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now); date.setDate(now.getDate() - d);
      colLabels.push(`${date.getDate()}/${date.getMonth() + 1}`);
    }

    this.heatmapColLabels  = colLabels;
    this.heatmapColIsI18n  = false;
    this.heatmapWeekLabels = labels;
    this.heatmapData       = [...grid];
  }

  private buildAbsenceMap(leaves: LeaveRequest[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const lv of leaves.filter(l => l.status === 'APPROVED')) {
      const start = new Date(lv.startDate + 'T00:00:00');
      const end   = new Date(lv.endDate   + 'T00:00:00');
      const cur   = new Date(start);
      while (cur <= end) {
        const k = this.localDateKey(cur);
        map.set(k, (map.get(k) ?? 0) + 1);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }

  private localDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildKpiChart(data: number[]): void {
    this.kpiBarChart = {
      series: [{ name: 'KPI', data }],
      chart: { type: 'bar', height: 110, toolbar: { show: false }, sparkline: { enabled: false }, fontFamily: 'Archivo,sans-serif' },
      colors: ['#2FA8A0'],
      plotOptions: { bar: { columnWidth: '60%', borderRadius: 3, distributed: false } },
      dataLabels: { enabled: false },
      xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { show: false },
      grid: { show: false, padding: { left: 0, right: 0 } },
    };
  }

  private buildProjChart(data: number[]): void {
    // Pad/trim to 12 bars
    const padded = Array.from({ length: 12 }, (_, i) => data[i % data.length] ?? 0);
    this.projBarChart = {
      series: [{ name: 'Employees per Dept.', data: padded }],
      chart: { type: 'bar', height: 90, toolbar: { show: false }, sparkline: { enabled: false }, fontFamily: 'Archivo,sans-serif' },
      colors: ['#F87171'],
      plotOptions: { bar: { columnWidth: '60%', borderRadius: 3 } },
      dataLabels: { enabled: false },
      xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { show: false },
      grid: { show: false, padding: { left: 0, right: 0 } },
    };
  }

  private buildGenderChart(malePct: number, femalePct: number): void {
    const m = malePct || 0;
    const f = femalePct || 0;
    this.genderDonutChart = {
      series: [m, f],
      chart: { type: 'donut', height: 160, toolbar: { show: false }, fontFamily: 'Archivo,sans-serif' },
      labels: [
        this.translate.instant('DASHBOARD.GENDER_MALE'),
        this.translate.instant('DASHBOARD.GENDER_FEMALE'),
      ],
      colors: ['#2FA8A0', '#F472B6'],
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: this.translate.instant('DASHBOARD.GENDER_TOTAL'),
                fontSize: '11px',
                color: '#8FA3B8',
                formatter: () => String(this.totalCollaborateurs),
              },
            },
          },
        },
      },
      stroke: { width: 2, colors: ['#fff'] },
      tooltip: { y: { formatter: (v: number) => v + '%' } },
    };
  }
}
