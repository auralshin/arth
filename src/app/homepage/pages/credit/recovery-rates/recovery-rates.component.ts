import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-recovery-rates',
  templateUrl: './recovery-rates.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryRatesComponent extends BasePageComponent {}
