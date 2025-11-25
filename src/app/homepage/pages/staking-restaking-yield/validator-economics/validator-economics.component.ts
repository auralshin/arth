import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-validator-economics',
  templateUrl: './validator-economics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidatorEconomicsComponent extends BasePageComponent {}
