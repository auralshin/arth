import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-transaction-ordering-mev',
  templateUrl: './transaction-ordering-mev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionOrderingMevComponent extends BasePageComponent {}
