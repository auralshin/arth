import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-losing-money',
  templateUrl: './losing-money.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LosingMoneyComponent extends BasePageComponent {}
