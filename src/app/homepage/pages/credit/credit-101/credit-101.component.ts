import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-credit-101',
  templateUrl: './credit-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Credit101Component extends BasePageComponent {}
