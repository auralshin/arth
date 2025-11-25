import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-bollinger-bands',
  templateUrl: './bollinger-bands.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BollingerBandsComponent extends BasePageComponent {}
