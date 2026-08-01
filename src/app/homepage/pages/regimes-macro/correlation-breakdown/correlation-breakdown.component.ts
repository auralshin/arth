import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-correlation-breakdown',
  templateUrl: './correlation-breakdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorrelationBreakdownComponent extends BasePageComponent {}
