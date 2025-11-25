import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-operational-risk',
  templateUrl: './operational-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalRiskComponent extends BasePageComponent {}
