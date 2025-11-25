import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-why-this-matters',
  templateUrl: './why-this-matters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyThisMattersComponent extends BasePageComponent {}
