import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-obv',
  templateUrl: './obv.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObvComponent extends BasePageComponent {}
