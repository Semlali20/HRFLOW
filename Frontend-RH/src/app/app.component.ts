import { Component , OnInit} from '@angular/core';
import { NotificationService } from './core/services/notification-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribe to notification stream on init
    this.notificationService.notifications$.subscribe(() => {});
  }

}
