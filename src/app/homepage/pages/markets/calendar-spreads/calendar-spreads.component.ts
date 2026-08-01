import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-calendar-spreads',
  templateUrl: './calendar-spreads.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarSpreadsComponent extends BasePageComponent {}
