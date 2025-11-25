import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-failed-strategy',
  templateUrl: './failed-strategy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FailedStrategyComponent extends BasePageComponent {}
