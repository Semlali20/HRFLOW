import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';
import { FullCalendarModule } from '@fullcalendar/angular';  // step 1
import { WidgetModule } from './widget/widget.module';
import { CalendarComponent } from '../pages/calendar/calendar.component';
import { CollaborateurModalComponent } from '../pages/Collaborateur/modals/collaborateur-modal/collaborateur-modal.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
  declarations: [
    CalendarComponent,

  ],
  imports: [
    CommonModule,
    FullCalendarModule, // step 3
    UIModule,
    WidgetModule,
    ModalModule.forRoot(),  // Corrected import for ModalModule
    FormsModule
  ],
  exports: [
   CalendarComponent,
    // step 4
  ]
})

export class SharedModule { }
