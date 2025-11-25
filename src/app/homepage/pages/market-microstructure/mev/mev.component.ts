import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mev',
  templateUrl: './mev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MevComponent extends BasePageComponent {}
