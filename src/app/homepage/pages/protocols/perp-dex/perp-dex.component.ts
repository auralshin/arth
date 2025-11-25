import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-perp-dex',
  templateUrl: './perp-dex.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerpDexComponent extends BasePageComponent {}
