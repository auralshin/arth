import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-cash-carry',
  templateUrl: './cash-carry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCarryComponent extends BasePageComponent {}
