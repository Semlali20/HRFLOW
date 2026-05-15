import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProjectsRoutingModule } from './projects-routing.module';
import { UIModule } from '../../shared/ui/ui.module';

// dropzone
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FormsModule } from '@angular/forms';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectgridComponent } from './projectgrid/projectgrid.component';
import { ProjectlistComponent } from './projectlist/projectlist.component';
import { OverviewComponent } from './overview/overview.component';
import { CreateComponent } from './create/create.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ProjectgridComponent, ProjectlistComponent, OverviewComponent, CreateComponent],
  imports: [
    NgxPaginationModule,
    CommonModule,
    ReactiveFormsModule  ,
    NgSelectModule,
    ProjectsRoutingModule,
    UIModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    NgApexchartsModule,
    NgxDropzoneModule,

    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TranslateModule,
  ]
})

export class ProjectsModule { }
