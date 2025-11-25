import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-expected-value',
  templateUrl: './expected-value.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpectedValueComponent extends BasePageComponent {}
