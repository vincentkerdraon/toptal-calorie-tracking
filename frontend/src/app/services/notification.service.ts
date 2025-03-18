import { Injectable } from '@angular/core';

export enum NotificationLevel {
  Info = "info",
  Warning = "warning",
  Danger = "danger"
}

@Injectable({ 
  providedIn: 'root'
})
export class NotificationService {
  public visible=false
  public message=""
  public level: NotificationLevel = NotificationLevel.Info;


  public showMessage(level: NotificationLevel,message: string): void {
    this.visible = true;
    this.level = level;
    this.message = message;

    console.log(`Notification(${level}):  ${message}`);
    setTimeout(() => {
      this.visible  = false;
    }, 10000);
  }
}
