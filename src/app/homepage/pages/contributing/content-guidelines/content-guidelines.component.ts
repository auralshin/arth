import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-content-guidelines',
  templateUrl: './content-guidelines.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentGuidelinesComponent extends BasePageComponent {}
