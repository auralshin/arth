import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-vol-term-structure',
  templateUrl: './vol-term-structure.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolTermStructureComponent extends BasePageComponent {}
