import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { permissionGuard } from '../core/guards/permission.guard';

import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import { DefaultComponent } from './dashboards/default/default.component';
import { FilemanagerComponent } from './filemanager/filemanager.component';
import { CollaborateurComponent } from './Collaborateur/collaborateur.component';
import { UploadsComponent } from './uploads/uploads.component';
import { LeaveListComponent } from './leave/leave-list/leave-list.component';
import { LeaveBalanceComponent } from './leave/leave-balance/leave-balance.component';
import { DayoffComponent } from './dayoff/dayoff.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { SalaryComponent } from './salary/salary.component';
import { RecruitmentComponent } from './recruitment/recruitment.component';
import { ProjectsHrComponent } from './projects-hr/projects-hr.component';
import { SettingComponent } from './setting/setting.component';
import { PlanningComponent } from './planning/planning.component';
import { AuditLogComponent } from './audit/audit-log.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { RoleManagementComponent } from './admin/role-management/role-management.component';
import { OrgComponent } from './org/org.component';
import { PublicHolidaysComponent } from './public-holidays/public-holidays.component';
import { DocumentsComponent } from './documents/documents.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { StagiairesComponent } from './stagiaires/stagiaires.component';
import { StatisticsComponent } from './statistics/statistics.component';


const routes: Routes = [

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',     component: DefaultComponent },
  { path: 'calendar',      component: CalendarComponent },
  { path: 'chat',          component: ChatComponent },
  { path: 'dayoff',        component: DayoffComponent },
  { path: 'settings',      component: SettingComponent },

  // ── Permission-protected routes ────────────────────────────────────────────
  { path: 'planning',      component: PlanningComponent,        canActivate: [permissionGuard('PLANNING_READ')]      },
  { path: 'collaborateur', component: CollaborateurComponent,   canActivate: [permissionGuard('EMPLOYEE_READ')]     },
  { path: 'UploadsCv',     component: UploadsComponent,         canActivate: [permissionGuard('CV_READ')]           },
  { path: 'stagiaires',    component: StagiairesComponent,      canActivate: [permissionGuard('INTERN_READ')]       },
  { path: 'leave',         component: LeaveListComponent,       canActivate: [permissionGuard('LEAVE_READ_ALL')]    },
  { path: 'leave/balance', component: LeaveBalanceComponent,    canActivate: [permissionGuard('LEAVE_READ_ALL')]    },
  { path: 'attendance',    component: AttendanceComponent,      canActivate: [permissionGuard('EMPLOYEE_READ')]     },
  { path: 'recruitment',   component: RecruitmentComponent,     canActivate: [permissionGuard('CV_READ')]           },
  { path: 'salary',        component: SalaryComponent,          canActivate: [permissionGuard('SALARY_READ')]       },
  { path: 'documents',     component: DocumentsComponent,       canActivate: [permissionGuard('DOCUMENT_READ')]     },
  { path: 'meetings',      component: MeetingsComponent,        canActivate: [permissionGuard('MEETING_READ')]      },
  { path: 'org',           component: OrgComponent,             canActivate: [permissionGuard('DEPARTMENT_READ')]   },
  { path: 'public-holidays', component: PublicHolidaysComponent, canActivate: [permissionGuard('LEAVE_MANAGE_TYPES')] },
  { path: 'statistics',    component: StatisticsComponent,      canActivate: [permissionGuard('REPORT_READ')]       },
  { path: 'audit',         component: AuditLogComponent,        canActivate: [permissionGuard('AUDIT_READ')]        },
  { path: 'filemanager',   component: FilemanagerComponent,     canActivate: [permissionGuard('DOCUMENT_READ')]     },
  { path: 'projects-hr',   component: ProjectsHrComponent,      canActivate: [permissionGuard('PLANNING_READ')]     },
  { path: 'admin/users',   component: UserManagementComponent,  canActivate: [permissionGuard('USER_MANAGE')]       },
  { path: 'admin/roles',   component: RoleManagementComponent,  canActivate: [permissionGuard('ROLE_MANAGE')]       },

  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule) },
  { path: 'tasks', loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule) },
  { path: 'contacts', loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule) },
  { path: 'pages', loadChildren: () => import('./utility/utility.module').then(m => m.UtilityModule) },
  { path: 'ui', loadChildren: () => import('./ui/ui.module').then(m => m.UiModule) },
  { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
