import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-equity-indices',
  templateUrl: './equity-indices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquityIndicesComponent extends BasePageComponent {}
