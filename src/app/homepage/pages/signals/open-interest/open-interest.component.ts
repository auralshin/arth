import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-open-interest',
  templateUrl: './open-interest.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenInterestComponent extends BasePageComponent {}
