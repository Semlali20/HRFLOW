import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { Usergrid } from './usergrid.model';

import { userGridData } from './data';

@Component({
  selector: 'app-usergrid',
  templateUrl: './usergrid.component.html',
  styleUrls: ['./usergrid.component.scss']
})

/**
 * Contacts user grid component
 */
export class UsergridComponent  {
  showSettingsCard = false;
  title = '';
  resp = '';
  newResp = '';
  dateOverture = '';
  dateCloture = '';
  respList = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown'];  // Fake data for responsibilities

  toggleSettingsCard() {
    this.showSettingsCard = !this.showSettingsCard;
  }

  clearResp() {
    this.resp = '';
  }

  addNewResp() {
    if (this.newResp && !this.respList.includes(this.newResp)) {
      this.respList.push(this.newResp);
      this.resp = this.newResp;
      this.newResp = '';
    }
  }

  onSubmit() {
    console.log('Title:', this.title);
    console.log('Responsibility:', this.resp);
    console.log('Date d\'ouverture:', this.dateOverture);
    console.log('Date cloture:', this.dateCloture);
    // Implement further submission logic here
  }
}
