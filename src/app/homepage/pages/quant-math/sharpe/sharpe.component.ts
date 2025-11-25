import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sharpe',
  templateUrl: './sharpe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharpeComponent extends BasePageComponent {}
