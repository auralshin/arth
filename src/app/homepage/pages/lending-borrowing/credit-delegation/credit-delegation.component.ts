import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-credit-delegation',
  templateUrl: './credit-delegation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditDelegationComponent extends BasePageComponent {}
