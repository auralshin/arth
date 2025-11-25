import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-python-setup',
  templateUrl: './python-setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonSetupComponent extends BasePageComponent {}
