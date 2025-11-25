import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-flash-loan',
  templateUrl: './flash-loan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashLoanComponent extends BasePageComponent {}
