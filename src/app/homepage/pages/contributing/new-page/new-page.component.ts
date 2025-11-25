import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPageComponent extends BasePageComponent {}
