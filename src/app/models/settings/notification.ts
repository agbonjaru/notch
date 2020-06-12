export class NotificationModel {
     _id: string;
     displayName: string;
     name: string;
     selected: boolean = false;
     constructor(displayName: string, name: string, _id: string, selected: boolean = false) {
          this.displayName = displayName;
          this.name = name;
          this._id = _id;
          this.selected = selected;
     }
}

export class NotificationListModel {
     email: NotificationModel[]
     inApp: NotificationModel[]
}


export class NotificationSettings {
     inApp: boolean;
     email: boolean;
}

export class NotificationPayload {
     orgId: number;
     role: string;
     email_list: string[]
     events:any
}


export class NotificationResponse {
     success: boolean;
     payload: NotificationPayload[];
}
