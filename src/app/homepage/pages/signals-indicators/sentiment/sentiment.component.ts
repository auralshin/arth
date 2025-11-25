import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sentiment',
  templateUrl: './sentiment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SentimentComponent extends BasePageComponent {}
