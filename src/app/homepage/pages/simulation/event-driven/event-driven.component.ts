import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-event-driven',
  templateUrl: './event-driven.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDrivenComponent extends BasePageComponent {}
