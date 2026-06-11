import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { permissionGuard } from '../core/guards/permission.guard';
import { AuthGuard } from '../core/guards/auth.guard';

// Eagerly loaded (small / always needed)
import { DefaultComponent } from './dashboards/default/default.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import { DayoffComponent } from './dayoff/dayoff.component';
import { SettingComponent } from './setting/setting.component';

const routes: Routes = [

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DefaultComponent,  canActivate: [AuthGuard] },
  { path: 'calendar',  component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'chat',      component: ChatComponent,     canActivate: [AuthGuard] },
  { path: 'dayoff',    component: DayoffComponent,   canActivate: [AuthGuard] },
  { path: 'settings',  component: SettingComponent,  canActivate: [AuthGuard] },

  // ── Lazy-loaded feature routes ─────────────────────────────────────────────
  {
    path: 'my-dashboard',
    loadComponent: () => import('./dashboards/self-service/self-service.component').then(m => m.SelfServiceComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'collaborateur',
    loadComponent: () => import('./Collaborateur/collaborateur.component').then(m => m.CollaborateurComponent),
    canActivate: [permissionGuard('EMPLOYEE_READ')],
  },
  {
    path: 'UploadsCv',
    loadComponent: () => import('./uploads/uploads.component').then(m => m.UploadsComponent),
    canActivate: [permissionGuard('CV_READ')],
  },
  {
    path: 'stagiaires',
    loadComponent: () => import('./stagiaires/stagiaires.component').then(m => m.StagiairesComponent),
    canActivate: [permissionGuard('INTERN_READ')],
  },
  {
    path: 'leave',
    loadComponent: () => import('./leave/leave-list/leave-list.component').then(m => m.LeaveListComponent),
    canActivate: [permissionGuard('LEAVE_READ_ALL')],
  },
  {
    path: 'leave/balance',
    loadComponent: () => import('./leave/leave-balance/leave-balance.component').then(m => m.LeaveBalanceComponent),
    canActivate: [permissionGuard('LEAVE_READ_ALL')],
  },
  {
    path: 'leave/request',
    loadComponent: () => import('./leave/leave-request/leave-request.component').then(m => m.LeaveRequestComponent),
    canActivate: [permissionGuard('LEAVE_READ_ALL')],
  },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent),
    canActivate: [permissionGuard('EMPLOYEE_READ')],
  },
  {
    path: 'recruitment',
    loadComponent: () => import('./recruitment/recruitment.component').then(m => m.RecruitmentComponent),
    canActivate: [permissionGuard('CV_READ')],
  },
  {
    path: 'salary',
    loadComponent: () => import('./salary/salary.component').then(m => m.SalaryComponent),
    canActivate: [permissionGuard('SALARY_READ')],
  },
  {
    path: 'documents',
    loadComponent: () => import('./documents/documents.component').then(m => m.DocumentsComponent),
    canActivate: [permissionGuard('DOCUMENT_READ')],
  },
  {
    path: 'meetings',
    loadComponent: () => import('./meetings/meetings.component').then(m => m.MeetingsComponent),
    canActivate: [permissionGuard('MEETING_READ')],
  },
  {
    path: 'org',
    loadComponent: () => import('./org/org.component').then(m => m.OrgComponent),
    canActivate: [permissionGuard('DEPARTMENT_READ')],
  },
  {
    path: 'public-holidays',
    loadComponent: () => import('./public-holidays/public-holidays.component').then(m => m.PublicHolidaysComponent),
    canActivate: [permissionGuard('LEAVE_MANAGE_TYPES')],
  },
  {
    path: 'statistics',
    loadComponent: () => import('./statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [permissionGuard('REPORT_READ')],
  },
  {
    path: 'audit',
    loadComponent: () => import('./audit/audit-log.component').then(m => m.AuditLogComponent),
    canActivate: [permissionGuard('AUDIT_READ')],
  },
  {
    path: 'filemanager',
    loadComponent: () => import('./filemanager/filemanager.component').then(m => m.FilemanagerComponent),
    canActivate: [permissionGuard('DOCUMENT_READ')],
  },
  {
    path: 'projects-hr',
    loadComponent: () => import('./projects-hr/projects-hr.component').then(m => m.ProjectsHrComponent),
    canActivate: [permissionGuard('PLANNING_READ')],
  },
  {
    path: 'planning',
    loadComponent: () => import('./planning/planning.component').then(m => m.PlanningComponent),
    canActivate: [permissionGuard('PLANNING_READ')],
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [permissionGuard('USER_MANAGE')],
  },
  {
    path: 'admin/roles',
    loadComponent: () => import('./admin/role-management/role-management.component').then(m => m.RoleManagementComponent),
    canActivate: [permissionGuard('ROLE_MANAGE')],
  },
  {
    path: 'performance',
    loadComponent: () => import('./performance/performance.component').then(m => m.PerformanceComponent),
    canActivate: [permissionGuard('PERFORMANCE_READ')],
  },
  {
    path: 'training',
    loadComponent: () => import('./training/training.component').then(m => m.TrainingComponent),
    canActivate: [permissionGuard('TRAINING_READ')],
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [permissionGuard('EMPLOYEE_READ')],
  },

  // ── Legacy module-based lazy routes ───────────────────────────────────────
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule) },
  { path: 'tasks',      loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule) },
  { path: 'contacts',   loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule) },
  { path: 'pages',      loadChildren: () => import('./utility/utility.module').then(m => m.UtilityModule) },
  { path: 'ui',         loadChildren: () => import('./ui/ui.module').then(m => m.UiModule) },
  { path: 'form',       loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  { path: 'tables',     loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: 'icons',      loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
