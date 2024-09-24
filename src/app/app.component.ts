import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'GymBro';
  language: string = '';

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
    // Get the browser default language and translate the app
    this.language = this.getBrowserLanguage();
    if (this.language !== 'hu' && this.language !== 'en') {
      this.language = 'en';
    }
    this.translate.setDefaultLang(this.language);
  }

  // Get the browser primary language 
  getBrowserLanguage(): string {
    const language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator['userLanguage']);
    return language.split('-')[0];
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
