import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-confidence-intervals',
  templateUrl: './confidence-intervals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfidenceIntervalsComponent extends BasePageComponent {}
