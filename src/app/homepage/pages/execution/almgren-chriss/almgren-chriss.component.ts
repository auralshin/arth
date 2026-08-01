import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-almgren-chriss',
  templateUrl: './almgren-chriss.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlmgrenChrissComponent extends BasePageComponent {}
