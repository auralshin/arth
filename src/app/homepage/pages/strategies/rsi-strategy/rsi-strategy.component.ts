import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rsi-strategy',
  templateUrl: './rsi-strategy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RsiStrategyComponent extends BasePageComponent {}
