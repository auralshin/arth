import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-types',
  templateUrl: './types.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesComponent extends BasePageComponent {}
