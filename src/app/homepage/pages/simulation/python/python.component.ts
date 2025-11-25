import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-python',
  templateUrl: './python.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonComponent extends BasePageComponent {}
