import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-transaction-costs',
  templateUrl: './transaction-costs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCostsComponent extends BasePageComponent {}
