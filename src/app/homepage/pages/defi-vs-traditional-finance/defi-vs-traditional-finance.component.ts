import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-defi-vs-traditional-finance',
  templateUrl: './defi-vs-traditional-finance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefiVsTraditionalFinanceComponent extends BasePageComponent {}
