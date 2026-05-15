import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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
  { path: 'dashboard', component: DefaultComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'filemanager', component: FilemanagerComponent },
  { path: 'collaborateur', component: CollaborateurComponent },
  { path: 'UploadsCv', component: UploadsComponent },
  { path: 'leave', component: LeaveListComponent },
  { path: 'leave/balance', component: LeaveBalanceComponent },
  { path: 'dayoff', component: DayoffComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'salary', component: SalaryComponent },
  { path: 'recruitment', component: RecruitmentComponent },
  { path: 'projects-hr', component: ProjectsHrComponent },
  { path: 'settings', component: SettingComponent },
  { path: 'planning', component: PlanningComponent },
  { path: 'audit', component: AuditLogComponent },
  { path: 'admin/users', component: UserManagementComponent },
  { path: 'admin/roles', component: RoleManagementComponent },
  { path: 'org', component: OrgComponent },
  { path: 'public-holidays', component: PublicHolidaysComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'meetings', component: MeetingsComponent },
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule) },
  { path: 'stagiaires', component: StagiairesComponent },
  { path: 'statistics', component: StatisticsComponent },
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
