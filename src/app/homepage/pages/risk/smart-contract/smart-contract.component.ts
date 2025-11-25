import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-smart-contract',
  templateUrl: './smart-contract.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartContractComponent extends BasePageComponent {}
