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
 // Call sendNotifications once when the layout component initializes
 this.notificationService.sendNotifications()
 .then(() => {
   console.log('Notifications checked/sent on layout load');
 })
 .catch((error) => {
   console.error('Error checking/sending notifications:', error);
 });
  }

}
