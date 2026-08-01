import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-options-101',
  templateUrl: './options-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Options101Component extends BasePageComponent {}
