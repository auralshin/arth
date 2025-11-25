import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-oracles',
  templateUrl: './oracles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OraclesComponent extends BasePageComponent {}
