import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { AuthenticationService } from 'src/app/core/services/auth.service';

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
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Innovx' }, { label: 'Calendar', active: true }];
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
      const collaborateurs = await firstValueFrom(
        this.http.get<any[]>('http://localhost:8090/api/v1/Collaborateurs')
      );
      const currentYear = new Date().getFullYear();
      return collaborateurs.map(collaborateur => {
        const { date_naissance, nom, prenom } = collaborateur;
        const [day, month] = date_naissance.split('-');
        const birthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        return {
          id: `${nom}-${prenom}-birthday`,
          title: `Anniversaire de ${nom} ${prenom}`,
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
      const stagiaires = await firstValueFrom(
        this.http.get<any[]>('http://localhost:8090/api/v1/stagiares')
      );
      return stagiaires.flatMap(stagiaire => [
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - Accueil RH`,
          start: stagiaire.accueilRhDate, allDay: true,
          className: this.isDateValid(stagiaire.accueilRhDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        },
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - Point stagiaires (7 jours)`,
          start: stagiaire.pointStagiaires7DaysDate, allDay: true,
          className: this.isDateValid(stagiaire.pointStagiaires7DaysDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        },
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - Point stagiaires (1 mois)`,
          start: stagiaire.pointStagiaires1MonthDate, allDay: true,
          className: this.isDateValid(stagiaire.pointStagiaires1MonthDate) ? 'bg-success text-white' : 'bg-danger text-white',
          extendedProps: { done: false, type: 'meeting' }
        },
        {
          title: `${stagiaire.nom} ${stagiaire.prenom} - Point stagiaires (3 mois)`,
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
        title: `Anniversaire de ${event.extendedProps.nom} ${event.extendedProps.prenom}`,
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
      { value: 'bg-primary', name: 'Birthday' },
      { value: 'bg-warning', name: 'Warning' },
      { value: 'bg-success', name: 'Success' }
    ];
  }

  getBirthdayMessage(nom: string, prenom: string): string {
    return `Cher(e) ${nom} ${prenom},\n\nÀ l'occasion de votre anniversaire, toute l'équipe se joint à moi pour vous souhaiter une journée pleine de joie et de succès.\n\nJoyeux anniversaire !\n\nCordialement,`;
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
