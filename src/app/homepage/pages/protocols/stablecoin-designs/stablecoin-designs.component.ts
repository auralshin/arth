import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stablecoin-designs',
  templateUrl: './stablecoin-designs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StablecoinDesignsComponent extends BasePageComponent {}
