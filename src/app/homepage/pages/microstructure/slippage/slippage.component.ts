import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-slippage',
  templateUrl: './slippage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlippageComponent extends BasePageComponent {}
