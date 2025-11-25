import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stability-and-systemic-risk',
  templateUrl: './stability-and-systemic-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StabilityAndSystemicRiskComponent extends BasePageComponent {}
