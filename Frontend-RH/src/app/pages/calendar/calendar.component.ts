import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Subject, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SharedCacheService } from 'src/app/core/services/shared-cache.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  modalRef?: BsModalRef;
  breadCrumbItems: Array<{}>;

  @ViewChild('showEventModal') showEventModal: TemplateRef<any>;
  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;

  eventDetails: { title: string, message?: string, done?: boolean } = { title: '' };
  calendarEvents: any[] = [];
  currentEvents: EventApi[] = [];
  category: any[];
  userRole: string;

  private refreshEvents$ = new Subject<void>();

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timeGridDay',
      center: 'title',
      right: 'prevYear,prev,next,nextYear'
    },
    initialView: 'dayGridMonth',
    themeSystem: 'bootstrap',
    initialEvents: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleShowEvent.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false, hour12: true }
  };

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private authService: AuthenticationService,
    private sharedCacheService: SharedCacheService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: this.translate.instant('CALENDAR.BREADCRUMB_HOME') }, { label: this.translate.instant('CALENDAR.BREADCRUMB_TITLE'), active: true }];
    this.userRole = this.authService.getUserRole();
    this._fetchData();

    this.refreshEvents$.pipe(
      switchMap(() => this.fetchAllEvents())
    ).subscribe(events => {
      this.calendarEvents = this.filterEventsByRole(events);
      this.updateCalendarEvents();
    });

    this.refreshEvents$.next();
  }

  ngAfterViewInit(): void {}

  async fetchAllEvents(): Promise<any[]> {
    try {
      const [collaborateurs, stagiaires] = await Promise.all([
        this.fetchCollaborateurs(),
        this.fetchAllStagiaireMeetings()
      ]);
      return [...collaborateurs, ...stagiaires];
    } catch (error) {
      console.error('Error fetching events data:', error);
      return [];
    }
  }

  async fetchCollaborateurs(): Promise<any[]> {
    try {
      const collaborateurs = await firstValueFrom(this.sharedCacheService.getEmployees());
      const currentYear = new Date().getFullYear();
      return collaborateurs.filter(c => c.date_naissance).map(collaborateur => {
        const { date_naissance, nom, prenom } = collaborateur;
        const parts = date_naissance!.split('-');
        let month: number, day: number;
        if (parts.length === 3 && parts[0].length === 4) {
          // ISO format: YYYY-MM-DD
          month = parseInt(parts[1]);
          day   = parseInt(parts[2]);
        } else {
          // Legacy format: DD-MM-YYYY
          day   = parseInt(parts[0]);
          month = parseInt(parts[1]);
        }
        const birthday = new Date(currentYear, month - 1, day);
        return {
          id: `${nom}-${prenom}-birthday`,
          title: this.translate.instant('CALENDAR.BIRTHDAY_EVENT', { name: `${nom} ${prenom}` }),
          start: this.formatDate(birthday),
          allDay: true,
          className: 'bg-primary text-white',
          extendedProps: { message: this.getBirthdayMessage(nom, prenom), nom, prenom, type: 'birthday' }
        };
      });
    } catch (error) {
      console.error('Error fetching collaborateurs data:', error);
      return [];
    }
  }

  async fetchAllStagiaireMeetings(): Promise<any[]> {
    try {
      const stagiaires = await firstValueFrom(this.sharedCacheService.getInterns());
      return stagiaires.flatMap(stagiaire => [
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - ${this.translate.instant('CALENDAR.ONBOARDING_EVENT')}`,
          start: stagiaire.accueilRhDate, allDay: true,
          className: this.isDateValid(stagiaire.accueilRhDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        },
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - ${this.translate.instant('CALENDAR.INTERN_CHECKIN_7D')}`,
          start: stagiaire.pointStagiaires7DaysDate, allDay: true,
          className: this.isDateValid(stagiaire.pointStagiaires7DaysDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        },
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - ${this.translate.instant('CALENDAR.INTERN_CHECKIN_1M')}`,
          start: stagiaire.pointStagiaires1MonthDate, allDay: true,
          className: this.isDateValid(stagiaire.pointStagiaires1MonthDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        },
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - ${this.translate.instant('CALENDAR.INTERN_CHECKIN_3M')}`,
          start: stagiaire.pointStagiaires3MonthsDate, allDay: true,
          className: this.isDateValid(stagiaire.pointStagiaires3MonthsDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        }
      ]);
    } catch (error) {
      console.error('Error fetching stagiaire data:', error);
      return [];
    }
  }

  isDateValid(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  updateCalendarEvents() {
    const calendarApi = this.fullCalendar.getApi();
    calendarApi.removeAllEvents();
    this.calendarEvents.forEach(event => calendarApi.addEvent(event));
  }

  handleShowEvent(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    const type = event.extendedProps.type;
    if (type === 'birthday') {
      this.eventDetails = {
        title: this.translate.instant('CALENDAR.BIRTHDAY_EVENT', { name: `${event.extendedProps.nom} ${event.extendedProps.prenom}` }),
        message: event.extendedProps.message
      };
    } else if (type === 'meeting') {
      this.eventDetails = { title: event.title, done: event.extendedProps.done };
    }
    this.modalRef = this.modalService.show(this.showEventModal);
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  private _fetchData() {
    this.category = [
      { value: 'bg-primary', name: this.translate.instant('CALENDAR.CAT_BIRTHDAY') },
      { value: 'bg-warning', name: this.translate.instant('CALENDAR.CAT_WARNING') },
      { value: 'bg-success', name: this.translate.instant('CALENDAR.CAT_SUCCESS') }
    ];
  }

  getBirthdayMessage(nom: string, prenom: string): string {
    return this.translate.instant('CALENDAR.BIRTHDAY_MESSAGE', { name: `${nom} ${prenom}` });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  filterEventsByRole(events: any[]): any[] {
    const role = this.userRole ? String(this.userRole).trim() : '';
    if (role === 'ADMIN') return events;
    if (role === 'STAGIAIRE_RH') return events.filter(e => e.extendedProps?.type === 'meeting');
    if (role === 'COLLABORATEUR_RH') return events.filter(e => e.extendedProps?.type === 'birthday');
    return [];
  }
}
