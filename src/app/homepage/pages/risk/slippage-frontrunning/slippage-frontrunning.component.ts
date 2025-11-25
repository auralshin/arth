import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-slippage-frontrunning',
  templateUrl: './slippage-frontrunning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlippageFrontrunningComponent extends BasePageComponent {}
