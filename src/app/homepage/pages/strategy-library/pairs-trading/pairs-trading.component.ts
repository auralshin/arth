import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pairs-trading',
  templateUrl: './pairs-trading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairsTradingComponent extends BasePageComponent {}
