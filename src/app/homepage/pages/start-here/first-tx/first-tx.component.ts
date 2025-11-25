import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-first-tx',
  templateUrl: './first-tx.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstTxComponent extends BasePageComponent {}
