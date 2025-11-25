import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-reproducible',
  templateUrl: './reproducible.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReproducibleComponent extends BasePageComponent {}
