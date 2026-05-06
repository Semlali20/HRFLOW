// ─── Collaborateur (Employee) ───────────────────────────────────────────────
// Matches backend entity: Collaborateurs.java

export interface Collaborateur {
    readonly matricule: number;
    readonly nom: string;
    readonly prenom: string;
    readonly email: string;
    readonly sexe?: string;
    readonly CIN?: string;
    readonly Nationalité?: string;
    readonly CATEGORIE?: string;
    readonly age?: number;
    readonly date_naissance?: string;
    readonly FILIALE?: string;
    readonly Type?: string;
    readonly Département?: string;
    readonly Fonction?: string;
    readonly date_entree?: string;
    readonly Ancienneté?: number;
    readonly deleted?: boolean;
}

export interface CollaborateurCreateDto {
    readonly nom: string;
    readonly prenom: string;
    readonly email: string;
    readonly sexe?: string;
    readonly CIN?: string;
    readonly Nationalité?: string;
    readonly CATEGORIE?: string;
    readonly age?: number;
    readonly date_naissance?: string;
    readonly FILIALE?: string;
    readonly Type?: string;
    readonly Département?: string;
    readonly Fonction?: string;
    readonly date_entree?: string;
    readonly Ancienneté?: number;
}

// ─── Stagiaire (Intern) ──────────────────────────────────────────────────────
// Matches backend entity: Stagiaires.java

export interface Stagiaire {
    readonly matricule: number;
    readonly nom: string;
    readonly prenom: string;
    readonly CIN?: string;
    readonly département?: string;
    readonly sujetDeStage?: string;
    readonly ecoleUniversité?: string;
    readonly typeDeStage?: string;
    readonly dateDébutStage?: any;
    readonly dateFinStage?: any;
    readonly dateDeNaissance?: any;
    readonly durée?: number;
    readonly status?: string;
    readonly nomEncadrant?: string;
    readonly photo?: string;
    readonly accueilRhDate?: string;
    readonly pointStagiaires7DaysDate?: string;
    readonly pointStagiaires1MonthDate?: string;
    readonly pointStagiaires3MonthsDate?: string;
    readonly attestationAssurance?: boolean;
    readonly carteNationale?: boolean;
    readonly ficheAnthropométrique?: boolean;
    readonly copieCertifiéeDiplômes?: boolean;
    readonly relevéIdentitéBancaire?: boolean;
    readonly cv?: boolean;
    readonly conventionStage?: boolean;
    readonly ficheÉvaluation?: boolean;
    readonly charteEngagement?: boolean;
    readonly attestationStage?: boolean;
    readonly totalValidDocuments?: number;
    readonly totalNotValidDocuments?: number;
}

export interface StagiaireCreateDto {
    readonly nom: string;
    readonly prenom: string;
    readonly CIN?: string;
    readonly département?: string;
    readonly sujetDeStage?: string;
    readonly ecoleUniversité?: string;
    readonly typeDeStage?: string;
    readonly dateDébutStage?: string;
    readonly dateFinStage?: string;
    readonly status?: string;
    readonly nomEncadrant?: string;
    readonly photo?: string;
    readonly attestationAssurance?: boolean;
    readonly carteNationale?: boolean;
    readonly ficheAnthropométrique?: boolean;
    readonly copieCertifiéeDiplômes?: boolean;
    readonly relevéIdentitéBancaire?: boolean;
    readonly cv?: boolean;
    readonly conventionStage?: boolean;
    readonly ficheÉvaluation?: boolean;
    readonly charteEngagement?: boolean;
    readonly attestationStage?: boolean;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'REMOTE';

export interface AttendanceRecord {
    readonly id: number;
    readonly collaborateurId: number;
    readonly collaborateurNom: string;
    readonly collaborateurPrenom: string;
    readonly date: string;
    readonly checkIn?: string;
    readonly checkOut?: string;
    readonly status: AttendanceStatus;
    readonly device?: string;
    readonly notes?: string;
}

export interface AttendanceSummary {
    readonly totalPresent: number;
    readonly totalAbsent: number;
    readonly totalLate: number;
    readonly attendanceRate: number;
    readonly period: string;
}

export interface AttendanceMarkDto {
    readonly collaborateurId: number;
    readonly date: string;
    readonly checkIn?: string;
    readonly checkOut?: string;
    readonly status: AttendanceStatus;
    readonly device?: string;
    readonly notes?: string;
}

// ─── Salary / Payslip ────────────────────────────────────────────────────────

export type SalaryStatus = 'DRAFT' | 'VALIDATED' | 'PAID';

export interface Payslip {
    readonly id: number;
    readonly collaborateurId: number;
    readonly collaborateurNom: string;
    readonly collaborateurPrenom: string;
    readonly period: string;
    readonly baseSalary: number;
    readonly bonuses: number;
    readonly deductions: number;
    readonly netSalary: number;
    readonly status: SalaryStatus;
    readonly paymentDate?: string;
    readonly fileName?: string;
}

export interface PayslipCreateDto {
    readonly collaborateurId: number;
    readonly period: string;
    readonly baseSalary: number;
    readonly bonuses: number;
    readonly deductions: number;
    readonly paymentDate?: string;
}

export interface SalarySummary {
    readonly totalPayroll: number;
    readonly totalBonuses: number;
    readonly totalDeductions: number;
    readonly headcount: number;
    readonly avgSalary: number;
    readonly period: string;
}

// ─── Recruitment ─────────────────────────────────────────────────────────────

export type CandidateStatus = 'NEW' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'REJECTED';
export type JobOfferStatus = 'OPEN' | 'CLOSED' | 'FILLED';

export interface JobOffer {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly department: string;
    readonly requiredSkills: string;
    readonly contractType?: string;
    readonly location?: string;
    readonly postedAt?: string;
    readonly deadline?: string;
    readonly status: JobOfferStatus;
}

export interface JobOfferCreateDto {
    readonly title: string;
    readonly description: string;
    readonly department: string;
    readonly requiredSkills: string;
    readonly contractType?: string;
    readonly location?: string;
    readonly deadline?: string;
}

export interface Candidate {
    readonly id: number;
    readonly offerId: number;
    readonly offerTitle?: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly cvFileName?: string;
    readonly coverLetter?: string;
    readonly status: CandidateStatus;
    readonly notes?: string;
    readonly appliedAt: string;
    readonly interviewDate?: string;
}

export interface CandidateUpdateDto {
    readonly status: CandidateStatus;
    readonly notes?: string;
    readonly interviewDate?: string;
}

export interface RecruitmentStats {
    readonly totalApplications: number;
    readonly newThisWeek: number;
    readonly shortlisted: number;
    readonly interviewed: number;
    readonly offered: number;
    readonly rejected: number;
}

// ─── Day Off ─────────────────────────────────────────────────────────────────

export type DayOffType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'OTHER';
export type DayOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface DayOffRequest {
    readonly id: number;
    readonly collaborateurId: number;
    readonly collaborateurNom: string;
    readonly collaborateurPrenom: string;
    readonly type: DayOffType;
    readonly startDate: string;
    readonly endDate: string;
    readonly durationDays: number;
    readonly reason: string;
    readonly status: DayOffStatus;
    readonly approverComment?: string;
    readonly createdAt: string;
    readonly decidedAt?: string;
}

export interface DayOffRequestCreateDto {
    readonly collaborateurId: number;
    readonly type: DayOffType;
    readonly startDate: string;
    readonly endDate: string;
    readonly reason: string;
}

export interface DayOffBalance {
    readonly collaborateurId: number;
    readonly year: number;
    readonly annualTotal: number;
    readonly annualUsed: number;
    readonly annualRemaining: number;
    readonly sickUsed: number;
    readonly otherUsed: number;
}

export interface DayOffStats {
    readonly totalRequests: number;
    readonly approved: number;
    readonly pending: number;
    readonly rejected: number;
}

// ─── Leave ───────────────────────────────────────────────────────────────────

export interface LeaveType {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly maxDaysPerYear: number;
    readonly active: boolean;
}

export interface LeaveRequest {
    readonly id: number;
    readonly requester: { readonly id: number; readonly firstname: string; readonly lastname: string; readonly email: string };
    readonly leaveType: LeaveType;
    readonly startDate: string;
    readonly endDate: string;
    readonly durationDays: number;
    readonly reason: string;
    readonly status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    readonly approverComment: string;
    readonly createdAt: string;
    readonly decidedAt: string;
}

export interface LeaveBalance {
    readonly leaveType: LeaveType;
    readonly year: number;
    readonly totalDays: number;
    readonly usedDays: number;
    readonly remainingDays: number;
}

export interface LeaveSubmitRequest {
    readonly leaveTypeId: number;
    readonly startDate: string;
    readonly endDate: string;
    readonly reason: string;
}

// ─── Planning ────────────────────────────────────────────────────────────────

export type PlanningEventType = 'MEETING' | 'INTERVIEW' | 'TRAINING' | 'HOLIDAY' | 'DEADLINE' | 'OTHER';

export interface PlanningEvent {
    readonly id?: number;
    readonly title: string;
    readonly description?: string;
    readonly startDateTime: string;
    readonly endDateTime?: string;
    readonly location?: string;
    readonly type: PlanningEventType;
    readonly createdBy?: { readonly id: number; readonly firstname: string; readonly lastname: string };
}

// ─── File Manager ────────────────────────────────────────────────────────────

export interface ManagedFile {
    readonly name: string;
    readonly dateModified: string;
    readonly size: string;
}

// ─── Reports / KPI ───────────────────────────────────────────────────────────
// Matches GET /reports/kpi response

export interface KpiData {
    readonly totalEmployees: number;
    readonly totalInterns: number;
    readonly pendingLeaves: number;
    /** May also be returned as totalUsers by the backend */
    readonly totalUsers?: number;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface Permission {
    readonly id: number;
    readonly name: string;
    readonly module: string;
    readonly description: string;
}

export interface Role {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly permissions: readonly Permission[];
}

export interface AdminUser {
    readonly id: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly title: string;
    readonly roles: readonly Role[];
}

// ─── CV / Stage Offers (Recruitment Kanban) ──────────────────────────────────

export type KanbanStage = 'NEW' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'REJECTED';

export interface StageOffer {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly department: string;
    readonly requiredSkills: string;
    readonly durationMonths: number;
    readonly startDate: string;
    readonly status: JobOfferStatus;
}

export interface CvApplication {
    readonly id: number;
    readonly offer?: StageOffer;
    readonly candidateName: string;
    readonly candidateEmail: string;
    readonly cvFileName: string;
    readonly stage: KanbanStage;
    readonly notes: string;
    readonly submittedAt: string;
}

export const KANBAN_STAGES: readonly KanbanStage[] = [
    'NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'
] as const;
