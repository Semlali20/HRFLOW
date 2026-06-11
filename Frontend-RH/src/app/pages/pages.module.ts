import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { NgApexchartsModule } from 'ng-apexcharts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LightboxModule } from 'ngx-lightbox';

import { WidgetModule } from '../shared/widget/widget.module';
import { UIModule } from '../shared/ui/ui.module';
// dropzone
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// FlatPicker
import { FlatpickrModule } from 'angularx-flatpickr';
// Emoji Picker
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { PagesRoutingModule } from './pages-routing.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { TranslateModule } from '@ngx-translate/core';

import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ContactsModule } from './contacts/contacts.module';

import { UtilityModule } from './utility/utility.module';
import { UiModule } from './ui/ui.module';
import { FormModule } from './form/form.module';
import { TablesModule } from './tables/tables.module';
import { IconsModule } from './icons/icons.module';
import { CalendarComponent } from './calendar/calendar.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChatComponent } from './chat/chat.component';
import { SharedModule } from '../shared/shared.module';
import { CollaborateurComponent } from './Collaborateur/collaborateur.component';
import { UploadsComponent } from './uploads/uploads.component';
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

@NgModule({
  declarations: [UploadsComponent],
  imports: [
    ChatComponent,
    CollaborateurComponent,
    DayoffComponent,
    AttendanceComponent,
    SalaryComponent,
    RecruitmentComponent,
    ProjectsHrComponent,
    SettingComponent,
    PlanningComponent,
    AuditLogComponent,
    UserManagementComponent,
    RoleManagementComponent,
    OrgComponent,
    PublicHolidaysComponent,
    DocumentsComponent,
    MeetingsComponent,
    StagiairesComponent,
    StatisticsComponent,

    SharedModule  , // import the SharedModule to use the CalendarComponent
    CommonModule,
    FormsModule,

    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PagesRoutingModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    DashboardsModule,
    NgxDropzoneModule,
    BsDatepickerModule,
    HttpClientModule,
    ProjectsModule,
    UIModule,
    TasksModule,
    ContactsModule,
    UtilityModule,
    UiModule,
    FormModule,
    TablesModule,
    IconsModule,

    WidgetModule,
    FullCalendarModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    SimplebarAngularModule,
    LightboxModule,
    PickerModule,
    TranslateModule
  ],

})
export class PagesModule {
  static LoginComponent1: any;
}
