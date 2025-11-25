import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lp-returns',
  templateUrl: './lp-returns.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpReturnsComponent extends BasePageComponent {}
