import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotebooksComponent extends BasePageComponent {}
