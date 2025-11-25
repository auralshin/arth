import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sharpe-ratio',
  templateUrl: './sharpe-ratio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharpeRatioComponent extends BasePageComponent {}
