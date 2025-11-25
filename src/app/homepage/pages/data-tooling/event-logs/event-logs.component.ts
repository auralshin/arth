import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-event-logs',
  templateUrl: './event-logs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLogsComponent extends BasePageComponent {}
