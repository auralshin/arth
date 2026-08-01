import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-credit-spreads',
  templateUrl: './credit-spreads.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditSpreadsComponent extends BasePageComponent {}
