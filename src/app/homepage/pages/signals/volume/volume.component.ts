import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeComponent extends BasePageComponent {}
