import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-max-drawdown',
  templateUrl: './max-drawdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaxDrawdownComponent extends BasePageComponent {}
