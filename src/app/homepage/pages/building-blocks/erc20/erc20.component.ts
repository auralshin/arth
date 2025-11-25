import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-erc20',
  templateUrl: './erc20.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Erc20Component extends BasePageComponent {}
