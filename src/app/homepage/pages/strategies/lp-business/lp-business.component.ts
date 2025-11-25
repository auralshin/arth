import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lp-business',
  templateUrl: './lp-business.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpBusinessComponent extends BasePageComponent {}
