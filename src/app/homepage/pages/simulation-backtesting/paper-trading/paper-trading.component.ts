import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-paper-trading',
  templateUrl: './paper-trading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperTradingComponent extends BasePageComponent {}
