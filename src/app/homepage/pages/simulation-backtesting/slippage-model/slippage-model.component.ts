import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-slippage-model',
  templateUrl: './slippage-model.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlippageModelComponent extends BasePageComponent {}
