import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { LeaveService } from 'src/app/pages/leave/leave.service';
import { SalaryService } from 'src/app/pages/salary/salary.service';
import { RecruitmentService } from 'src/app/pages/recruitment/recruitment.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgApexchartsModule, WallClockComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  isLoading = true;
  hasError = false;
  today = new Date();

  // ── KPIs ──────────────────────────────────────────────────────────────────
  totalEmployees = 0;
  totalInterns = 0;
  pendingLeaves = 0;
  totalPayroll = 0;
  openOffers = 0;
  newApplications = 0;

  // ── Charts ────────────────────────────────────────────────────────────────
  genderChart: any = {};
  contractChart: any = {};
  departmentChart: any = {};
  seniorityChart: any = {};
  leaveStatusChart: any = {};
  leaveTypeChart: any = {};
  salaryStatusChart: any = {};
  internTypeChart: any = {};
  internStatusChart: any = {};
  recruitmentChart: any = {};

  constructor(
    private collaborateurService: CollaborateurService,
    private stagiaireService: StagiaireService,
    private leaveService: LeaveService,
    private salaryService: SalaryService,
    private recruitmentService: RecruitmentService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      employees:    this.collaborateurService.getAll().pipe(catchError(() => of([]))),
      interns:      this.stagiaireService.getAll().pipe(catchError(() => of([]))),
      leaves:       this.leaveService.getAllRequests().pipe(catchError(() => of([]))),
      payslips:     this.salaryService.getAll().pipe(catchError(() => of([]))),
      offers:       this.recruitmentService.getAllOffers().pipe(catchError(() => of([]))),
      applications: this.recruitmentService.getAllApplications().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ employees, interns, leaves, payslips, offers, applications }) => {
        this.isLoading = false;

        // KPIs
        this.totalEmployees   = employees.length;
        this.totalInterns     = interns.length;
        this.pendingLeaves    = leaves.filter((l: any) => l.status === 'PENDING').length;
        this.totalPayroll     = (payslips as any[]).reduce((s: number, p: any) => s + (p.netSalary ?? 0), 0);
        this.openOffers       = offers.filter((o: any) => o.status === 'OPEN').length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        this.newApplications = applications.filter(
          (a: any) => a.createdAt && new Date(a.createdAt) >= weekAgo
        ).length;

        // Charts
        this.buildGenderChart(employees);
        this.buildContractChart(employees);
        this.buildDepartmentChart(employees);
        this.buildSeniorityChart(employees);
        this.buildLeaveStatusChart(leaves);
        this.buildLeaveTypeChart(leaves);
        this.buildSalaryStatusChart(payslips);
        this.buildInternTypeChart(interns);
        this.buildInternStatusChart(interns);
        this.buildRecruitmentChart(applications);
      },
      error: () => { this.isLoading = false; this.hasError = true; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private count(arr: any[], keyFn: (item: any) => string): { labels: string[]; values: number[] } {
    const map: Record<string, number> = {};
    for (const item of arr) {
      const key = keyFn(item) || 'Autre';
      map[key] = (map[key] || 0) + 1;
    }
    return { labels: Object.keys(map), values: Object.values(map) };
  }

  private donutOpts(labels: string[], series: number[], colors: string[]): any {
    return {
      series,
      labels,
      chart: { type: 'donut', height: 280, fontFamily: 'Inter, sans-serif' },
      colors,
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: true, style: { fontSize: '12px' } },
      plotOptions: { pie: { donut: { size: '60%' } } },
      tooltip: { y: { formatter: (v: number) => `${v} pers.` } },
    };
  }

  private barOpts(categories: string[], series: number[], color: string, label: string): any {
    return {
      series: [{ name: label, data: series }],
      chart: { type: 'bar', height: 280, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
      colors: [color],
      xaxis: { categories, labels: { style: { fontSize: '11px' } } },
      yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 5, columnWidth: '55%' } },
      grid: { borderColor: '#F1F5F9' },
      tooltip: { y: { formatter: (v: number) => `${v} pers.` } },
    };
  }

  // ── Chart builders ─────────────────────────────────────────────────────────

  private buildGenderChart(employees: any[]): void {
    const { labels, values } = this.count(employees,
      e => e.sexe === 'M' ? 'Hommes' : e.sexe === 'F' ? 'Femmes' : 'Autre');
    this.genderChart = this.donutOpts(labels, values, ['#2FA8A0', '#F472B6', '#94A3B8']);
  }

  private buildContractChart(employees: any[]): void {
    const { labels, values } = this.count(employees, e => e.Type || 'Non défini');
    this.contractChart = this.donutOpts(labels, values, ['#2FA8A0', '#818CF8', '#FB923C', '#34D399']);
  }

  private buildDepartmentChart(employees: any[]): void {
    const { labels, values } = this.count(employees, e => e.Département || 'Non défini');
    this.departmentChart = this.barOpts(labels, values, '#2FA8A0', 'Employés');
  }

  private buildSeniorityChart(employees: any[]): void {
    const buckets = ['0–1 an', '2–3 ans', '4–5 ans', '6–10 ans', '10+ ans'];
    const values = [0, 0, 0, 0, 0];
    for (const e of employees) {
      const s = e.Ancienneté ?? 0;
      if      (s <= 1)  values[0]++;
      else if (s <= 3)  values[1]++;
      else if (s <= 5)  values[2]++;
      else if (s <= 10) values[3]++;
      else              values[4]++;
    }
    this.seniorityChart = this.barOpts(buckets, values, '#818CF8', 'Employés');
  }

  private buildLeaveStatusChart(leaves: any[]): void {
    const map: Record<string, string> = {
      PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté', CANCELLED: 'Annulé'
    };
    const { labels, values } = this.count(leaves, l => map[l.status] || l.status);
    this.leaveStatusChart = this.donutOpts(labels, values, ['#FBBF24', '#34D399', '#F87171', '#94A3B8']);
  }

  private buildLeaveTypeChart(leaves: any[]): void {
    const { labels, values } = this.count(leaves, l => l.leaveType?.name || 'Autre');
    this.leaveTypeChart = this.barOpts(labels, values, '#FBBF24', 'Demandes');
  }

  private buildSalaryStatusChart(payslips: any[]): void {
    const map: Record<string, string> = { DRAFT: 'Brouillon', VALIDATED: 'Validé', PAID: 'Payé' };
    const { labels, values } = this.count(payslips, p => map[p.status] || p.status);
    this.salaryStatusChart = this.barOpts(labels, values, '#34D399', 'Bulletins');
  }

  private buildInternTypeChart(interns: any[]): void {
    const { labels, values } = this.count(interns, i => i.typeDeStage || 'Non défini');
    this.internTypeChart = this.donutOpts(labels, values, ['#2FA8A0', '#818CF8', '#FB923C', '#34D399', '#F472B6']);
  }

  private buildInternStatusChart(interns: any[]): void {
    const map: Record<string, string> = { ACTIVE: 'En cours', COMPLETED: 'Terminé', CANCELLED: 'Annulé' };
    const { labels, values } = this.count(interns, i => map[i.status] || i.status || 'Autre');
    this.internStatusChart = this.donutOpts(labels, values, ['#34D399', '#818CF8', '#94A3B8']);
  }

  private buildRecruitmentChart(applications: any[]): void {
    const labelMap: Record<string, string> = {
      NEW: 'Nouveau', REVIEWING: 'Examen', SHORTLISTED: 'Présélection',
      INTERVIEW_SCHEDULED: 'Entretien', OFFERED: 'Offre', REJECTED: 'Rejeté'
    };
    const stages = ['NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'];
    const labels = stages.map(s => labelMap[s]);
    const values = stages.map(s => applications.filter((a: any) => a.stage === s).length);
    this.recruitmentChart = this.barOpts(labels, values, '#818CF8', 'Candidatures');
  }
}
