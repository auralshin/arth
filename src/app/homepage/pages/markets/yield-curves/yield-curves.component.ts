import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-yield-curves',
  templateUrl: './yield-curves.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YieldCurvesComponent extends BasePageComponent {}
