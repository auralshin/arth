import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-equity-curves',
  templateUrl: './equity-curves.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquityCurvesComponent extends BasePageComponent {}
