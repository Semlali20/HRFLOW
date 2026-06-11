import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface RefOption {
  value: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  constructor(private translate: TranslateService) {}

  get contractTypes(): RefOption[] {
    return [
      { value: 'CDI',           label: 'CDI' },
      { value: 'CDD',           label: 'CDD' },
      { value: 'INTERIM',       label: this.translate.instant('EMPLOYEES.CONTRACT_INTERIM') },
      { value: 'STAGE',         label: this.translate.instant('EMPLOYEES.CONTRACT_STAGE') },
      { value: 'FREELANCE',     label: 'Freelance' },
      { value: 'PRESTATAIRE',   label: this.translate.instant('EMPLOYEES.CONTRACT_PRESTATAIRE') },
      { value: 'APPRENTISSAGE', label: this.translate.instant('EMPLOYEES.CONTRACT_APPRENTISSAGE') },
      { value: 'CIVP',          label: 'CIVP' },
    ];
  }

  get leaveTypes(): RefOption[] {
    return [
      { value: 'ANNUAL',      label: this.translate.instant('REF.LEAVE_ANNUAL') },
      { value: 'SICK',        label: this.translate.instant('REF.LEAVE_SICK') },
      { value: 'MATERNITY',   label: this.translate.instant('REF.LEAVE_MATERNITY') },
      { value: 'PATERNITY',   label: this.translate.instant('REF.LEAVE_PATERNITY') },
      { value: 'UNPAID',      label: this.translate.instant('REF.LEAVE_UNPAID') },
      { value: 'EXCEPTIONAL', label: this.translate.instant('REF.LEAVE_EXCEPTIONAL') },
    ];
  }

  get employeeStatuses(): RefOption[] {
    return [
      { value: 'ACTIVE',     label: this.translate.instant('REF.STATUS_ACTIVE') },
      { value: 'INACTIVE',   label: this.translate.instant('REF.STATUS_INACTIVE') },
      { value: 'ON_LEAVE',   label: this.translate.instant('REF.STATUS_ON_LEAVE') },
      { value: 'TERMINATED', label: this.translate.instant('REF.STATUS_TERMINATED') },
    ];
  }

  get leaveStatuses(): RefOption[] {
    return [
      { value: 'PENDING',   label: this.translate.instant('REF.LEAVE_STATUS_PENDING') },
      { value: 'APPROVED',  label: this.translate.instant('REF.LEAVE_STATUS_APPROVED') },
      { value: 'REJECTED',  label: this.translate.instant('REF.LEAVE_STATUS_REJECTED') },
      { value: 'CANCELLED', label: this.translate.instant('REF.LEAVE_STATUS_CANCELLED') },
    ];
  }

  get genders(): RefOption[] {
    return [
      { value: 'MALE',   label: this.translate.instant('EMPLOYEES.GENDER_MALE') },
      { value: 'FEMALE', label: this.translate.instant('EMPLOYEES.GENDER_FEMALE') },
    ];
  }

  get applicationStages(): RefOption[] {
    return [
      { value: 'NEW',                label: this.translate.instant('STATS.STAGE_NEW') },
      { value: 'REVIEWING',          label: this.translate.instant('STATS.STAGE_REVIEW') },
      { value: 'SHORTLISTED',        label: this.translate.instant('STATS.STAGE_SHORTLIST') },
      { value: 'INTERVIEW_SCHEDULED',label: this.translate.instant('STATS.STAGE_INTERVIEW') },
      { value: 'OFFERED',            label: this.translate.instant('STATS.STAGE_OFFER') },
      { value: 'REJECTED',           label: this.translate.instant('STATS.STAGE_REJECTED') },
    ];
  }

  get payslipPeriods(): RefOption[] {
    return [
      { value: 'MONTHLY', label: this.translate.instant('SALARY.PERIOD_MONTH') },
      { value: 'WEEKLY',  label: this.translate.instant('SALARY.PERIOD_WEEK') },
      { value: 'ANNUAL',  label: this.translate.instant('SALARY.PERIOD_YEAR') },
    ];
  }

  get maritalStatuses(): RefOption[] {
    return [
      { value: 'SINGLE',   label: this.translate.instant('REF.MARITAL_SINGLE') },
      { value: 'MARRIED',  label: this.translate.instant('REF.MARITAL_MARRIED') },
      { value: 'DIVORCED', label: this.translate.instant('REF.MARITAL_DIVORCED') },
      { value: 'WIDOWED',  label: this.translate.instant('REF.MARITAL_WIDOWED') },
    ];
  }

  get internStatuses(): RefOption[] {
    return [
      { value: 'PENDING',   label: this.translate.instant('INTERNS.STAT_PENDING') },
      { value: 'ACTIVE',    label: this.translate.instant('INTERNS.STAT_ACTIVE') },
      { value: 'COMPLETED', label: this.translate.instant('INTERNS.STAT_COMPLETED') },
      { value: 'CANCELLED', label: this.translate.instant('REF.INTERN_STATUS_CANCELLED') },
      { value: 'EXTENDED',  label: this.translate.instant('REF.INTERN_STATUS_EXTENDED') },
    ];
  }

  get internshipTypes(): RefOption[] {
    return [
      { value: 'PFE',        label: 'PFE' },
      { value: 'PFA',        label: 'PFA' },
      { value: 'DECOUVERTE', label: this.translate.instant('REF.INTERNSHIP_DECOUVERTE') },
      { value: 'IMMERSION',  label: this.translate.instant('REF.INTERNSHIP_IMMERSION') },
      { value: 'ALTERNANCE', label: this.translate.instant('REF.INTERNSHIP_ALTERNANCE') },
      { value: 'SUMMER',     label: this.translate.instant('REF.INTERNSHIP_SUMMER') },
      { value: 'OTHER',      label: this.translate.instant('REF.INTERNSHIP_OTHER') },
    ];
  }
}
