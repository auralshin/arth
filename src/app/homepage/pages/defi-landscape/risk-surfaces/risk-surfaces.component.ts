import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-risk-surfaces',
  templateUrl: './risk-surfaces.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskSurfacesComponent extends BasePageComponent {}
