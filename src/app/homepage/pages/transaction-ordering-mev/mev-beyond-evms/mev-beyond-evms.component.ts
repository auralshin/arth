import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mev-beyond-evms',
  templateUrl: './mev-beyond-evms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MevBeyondEvmsComponent extends BasePageComponent {}
