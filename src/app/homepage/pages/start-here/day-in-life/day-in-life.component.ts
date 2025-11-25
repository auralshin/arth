import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-day-in-life',
  templateUrl: './day-in-life.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayInLifeComponent extends BasePageComponent {}
