import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { NotificationService, HrNotification } from '../../core/services/notification-service.service';

interface UINotif {
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {

  activeTab: 'employee' | 'hr' = 'employee';
  private sub: Subscription;

  employeeNotifs: UINotif[] = [
    { title: 'Attendance Check-in Alert', message: 'Employee John has checked in today at 08:00 AM. Please ensure accurate attendance records.', time: '09:00 AM', read: false, icon: 'bx-time-five', iconBg: '#E8F7F6', iconColor: '#2FA8A0' },
    { title: 'Attendance Check-Out Alert', message: 'Employee John has checked out today at 17:00 PM. Ensure all attendance records are up-to-date.', time: '05:00 PM', read: false, icon: 'bx-log-out', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { title: 'Daily Attendance Summary', message: 'Summary: 95% attendance rate today. Please review the attendance and address any issues.', time: '06:00 PM', read: true, icon: 'bxs-report', iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { title: 'Monthly Attendance Summary', message: 'Summary: 93% attendance rate for the month. Please review attendance and address any discrepancies.', time: '08:00 AM', read: true, icon: 'bxs-calendar', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { title: 'New Day Off Request Submitted', message: 'Employee Sam has submitted a day off request for next Monday. Please review and approve.', time: '08:00 AM', read: true, icon: 'bxs-calendar-check', iconBg: '#DCFCE7', iconColor: '#15803D' },
    { title: 'Day Off Request Approved', message: 'Your day off request for Friday has been approved. Please ensure coverage during your absence.', time: '08:00 AM', read: true, icon: 'bxs-check-circle', iconBg: '#DCFCE7', iconColor: '#15803D' },
    { title: 'Day Off Request Reminder', message: 'Pending: Day off requests awaiting approval. Take action to ensure timely processing.', time: '08:00 AM', read: true, icon: 'bxs-bell', iconBg: '#FFE4E6', iconColor: '#BE123C' },
    { title: 'Project Deadline Reminder', message: 'Reminder: Project XYZ deadline approaching in 3 days. Ensure timely completion.', time: '08:00 AM', read: true, icon: 'bxs-briefcase', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { title: 'Project Update Notification', message: 'Project ABC has reached 75% completion. Review and provide feedback if needed.', time: '08:00 AM', read: true, icon: 'bxs-bar-chart-alt-2', iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { title: 'Task Assigned', message: 'New task assigned to employee "Dave" for project PDF. Ensure task completion within deadline.', time: '08:00 AM', read: true, icon: 'bxs-task', iconBg: '#E8F7F6', iconColor: '#2FA8A0' },
  ];

  hrNotifs: UINotif[] = [
    { title: 'New Job Application Received', message: 'Job application received for the position of "Sales Associate". Review and proceed with screening.', time: '09:00 AM', read: false, icon: 'bxs-user-plus', iconBg: '#E8F7F6', iconColor: '#2FA8A0' },
    { title: 'Interview Invitation', message: 'Interview scheduled for Emily for the "Customer Service Representative" position. Confirm availability.', time: '09:00 AM', read: false, icon: 'bxs-video', iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { title: 'Candidate Assessment Deadline', message: 'Deadline approaching for candidate assessments for "Financial Analyst" candidates. Ensure timely evaluation.', time: '08:00 AM', read: true, icon: 'bxs-time', iconBg: '#FFE4E6', iconColor: '#BE123C' },
    { title: 'Background Check Results Received', message: 'Background check results for all candidates are available. Review and proceed with hiring decision.', time: '08:00 AM', read: true, icon: 'bxs-shield-check', iconBg: '#DCFCE7', iconColor: '#15803D' },
    { title: 'Offer Letter Prepared', message: 'Offer letter prepared for the "Marketing Manager" position. Review and send to the candidate.', time: '08:00 AM', read: true, icon: 'bxs-envelope', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { title: 'New Employee Onboarding Reminder', message: 'New employee John starts next Monday. Prepare onboarding schedule and materials.', time: '08:00 AM', read: true, icon: 'bxs-graduation', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { title: 'Probation Period End', message: 'Probation period for employee Alex ends next week. Schedule performance review meeting.', time: '08:00 AM', read: true, icon: 'bxs-calendar-event', iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { title: 'Salary Disbursement Notification', message: 'Salary for the month has been disbursed. Confirm successful payment transactions.', time: '08:00 AM', read: true, icon: 'bxs-wallet', iconBg: '#DCFCE7', iconColor: '#15803D' },
    { title: 'Pay Approval Request', message: 'Salary payment for employees required approval. Review and authorise as needed.', time: '08:00 AM', read: true, icon: 'bxs-check-square', iconBg: '#E8F7F6', iconColor: '#2FA8A0' },
    { title: 'Salary Disbursement Notification', message: 'Salary for the month has been disbursed. Confirm successful payment transactions.', time: '08:00 AM', read: true, icon: 'bxs-wallet', iconBg: '#DCFCE7', iconColor: '#15803D' },
  ];

  get activeNotifs(): UINotif[] {
    return this.activeTab === 'employee' ? this.employeeNotifs : this.hrNotifs;
  }

  constructor(
    private authService: AuthenticationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.sub = this.notificationService.notifications$.subscribe(() => {});
    this.notificationService.loadUnread();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  markAllRead(): void {
    this.activeNotifs.forEach(n => n.read = true);
  }
}

