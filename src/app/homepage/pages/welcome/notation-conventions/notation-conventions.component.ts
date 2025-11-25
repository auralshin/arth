import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-notation-conventions',
  templateUrl: './notation-conventions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotationConventionsComponent extends BasePageComponent {}
