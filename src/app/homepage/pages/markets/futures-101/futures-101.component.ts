import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-futures-101',
  templateUrl: './futures-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Futures101Component extends BasePageComponent {}
