import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-combining-signals',
  templateUrl: './combining-signals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombiningSignalsComponent extends BasePageComponent {}
