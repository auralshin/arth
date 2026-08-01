import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-regression-diagnostics',
  templateUrl: './regression-diagnostics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegressionDiagnosticsComponent extends BasePageComponent {}
