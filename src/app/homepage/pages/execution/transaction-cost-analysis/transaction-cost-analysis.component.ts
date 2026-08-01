import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-transaction-cost-analysis',
  templateUrl: './transaction-cost-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCostAnalysisComponent extends BasePageComponent {}
