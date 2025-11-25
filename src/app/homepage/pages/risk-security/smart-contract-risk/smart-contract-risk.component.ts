import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-smart-contract-risk',
  templateUrl: './smart-contract-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartContractRiskComponent extends BasePageComponent {}
