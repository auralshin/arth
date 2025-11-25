import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-quant-engineering',
  templateUrl: './quant-engineering.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantEngineeringComponent extends BasePageComponent {}
