import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-aave',
  templateUrl: './aave.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AaveComponent extends BasePageComponent {}
