import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-restaking-economics',
  templateUrl: './restaking-economics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestakingEconomicsComponent extends BasePageComponent {}
