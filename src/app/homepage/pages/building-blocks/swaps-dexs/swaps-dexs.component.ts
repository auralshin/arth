import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-swaps-dexs',
  templateUrl: './swaps-dexs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwapsDexsComponent extends BasePageComponent {}
