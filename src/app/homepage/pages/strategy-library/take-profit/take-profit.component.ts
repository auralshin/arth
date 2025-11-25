import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-take-profit',
  templateUrl: './take-profit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TakeProfitComponent extends BasePageComponent {}
