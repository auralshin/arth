import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-regulatory-risk',
  templateUrl: './regulatory-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegulatoryRiskComponent extends BasePageComponent {}
