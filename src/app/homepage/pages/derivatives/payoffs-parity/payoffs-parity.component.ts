import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-payoffs-parity',
  templateUrl: './payoffs-parity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoffsParityComponent extends BasePageComponent {}
