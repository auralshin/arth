import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-bridges',
  templateUrl: './bridges.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BridgesComponent extends BasePageComponent {}
