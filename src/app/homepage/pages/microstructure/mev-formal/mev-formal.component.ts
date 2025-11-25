import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mev-formal',
  templateUrl: './mev-formal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MevFormalComponent extends BasePageComponent {}
