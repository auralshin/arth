import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-macd-strategy',
  templateUrl: './macd-strategy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacdStrategyComponent extends BasePageComponent {}
