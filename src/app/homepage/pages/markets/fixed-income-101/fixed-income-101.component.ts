import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-fixed-income-101',
  templateUrl: './fixed-income-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedIncome101Component extends BasePageComponent {}
