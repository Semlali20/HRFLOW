import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { ReportService } from 'src/app/pages/reports/report.service';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

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

  // Attendance (no backend yet — kept as informational placeholder)
  attendancePct   = 0;
  attendanceTrend = 0;

  // KPI score display (static UI — no backend endpoint)
  kpiScore = 0;

  // Projects (static UI — no backend endpoint)
  projectsOnProgress = 0;
  projectsDone       = 0;

  // Table
  tableTabs  = ['Attendance', 'Projects', 'Performance', 'Day-Off Request'];
  activeTab  = 'Attendance';
  tableRows: any[] = [];

  // Today Used Devices (static UI element — no backend)
  showDevicesModal = false;
  devicesTab: 'activity' | 'history' = 'activity';
  totalDeviceUsers = 0;
  deviceBreakdown = [
    { label: 'Mobile',  icon: 'bx-mobile',      users: 0 },
    { label: 'Desktop', icon: 'bx-desktop',      users: 0 },
    { label: 'NFC Card',icon: 'bx-credit-card',  users: 0 },
  ];
  deviceActivity: any[] = [];

  // Heatmap
  heatmapHours = ['19:00','17:00','15:00','13:00','11:00','09:00','07:00'];
  dayLabels    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  heatmapData: number[][] = [];

  // Charts
  kpiBarChart: any = {};
  projBarChart: any = {};

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    public themeService: ThemeService,
    private collaborateurService: CollaborateurService,
    private reportService: ReportService,
    private stagiaireService: StagiaireService
  ) {}

  ngOnInit(): void {
    this.buildHeatmap();
    this.buildKpiChart([1]);
    this.buildProjChart([0]);
    this.fetchData();
  }

  goAddEmployee(): void {
    this.router.navigate(['/collaborateur']);
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  getHeatColor(val: number): string {
    const alpha = (val / 10).toFixed(2);
    if (this.themeService.isDark()) {
      const light = Math.round(20 + (val / 10) * 45);
      return `hsl(177,${Math.round(35 + val * 5)}%,${light}%)`;
    }
    return `rgba(47,168,160,${alpha})`;
  }

  private fetchData(): void {
    // Load employees from /Collaborateurs
    this.collaborateurService.getAll().subscribe({
      next: data => {
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
      },
      error: () => {}
    });

    // Load KPIs from /reports/kpi
    this.reportService.getKpis().subscribe({
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
    this.stagiaireService.getAll().subscribe({
      next: data => { if (data.length > 0) this.totalInterns = data.length; },
      error: () => {}
    });
  }

  private buildHeatmap(): void {
    // Heatmap seeded from current date for determinism (no random)
    const seed = new Date().getDate();
    this.heatmapData = Array.from({ length: 7 }, (_, row) =>
      Array.from({ length: 7 }, (__, col) => {
        const base = ((seed * (row + 1) * (col + 1)) % 9) + 1;
        return (col >= 5) ? Math.floor(base * 0.3) : base;   // weekends lighter
      })
    );
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
}
