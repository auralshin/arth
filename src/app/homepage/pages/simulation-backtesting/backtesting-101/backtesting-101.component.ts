import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-backtesting-101',
  templateUrl: './backtesting-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Backtesting101Component extends BasePageComponent {}
