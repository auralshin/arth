import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-autocorrelation',
  templateUrl: './autocorrelation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocorrelationComponent extends BasePageComponent {}
