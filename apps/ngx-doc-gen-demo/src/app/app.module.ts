import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { SingleEntrypointComponent } from './components/single-entrypoint/single-entrypoint.component';
import { HomeComponent } from './components/home/home.component';
import { MultiEntrypointComponent } from './components/multi-entrypoint/multi-entrypoint.component';
import { MultiOneComponent } from './components/multi-one/multi-one.component';
import { MultiTwoComponent } from './components/multi-two/multi-two.component';
import { MultiThreeComponent } from './components/multi-three/multi-three.component';
import { StandaloneApiComponent } from './components/standalone-api/standalone-api.component';

const matModules = [
  MatButtonModule,
  MatExpansionModule,
  MatIconModule,
  MatToolbarModule,
];

const ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'single-entrypoint',
    component: SingleEntrypointComponent,
  },
  {
    path: 'multi-entrypoint',
    component: MultiEntrypointComponent,
  },
  {
    path: 'standalone-api',
    component: StandaloneApiComponent,
  },
  {
    path: 'template-builder',
    loadComponent: () =>
      import('ngx-doc-gen/builder/template').then(
        (resolved) => resolved.TemplateListComponent
      ),
  },
];

@NgModule({
  declarations: [
    AppComponent,
    SingleEntrypointComponent,
    HomeComponent,
    MultiEntrypointComponent,
    MultiOneComponent,
    MultiTwoComponent,
    MultiThreeComponent,
    StandaloneApiComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(ROUTES),

    matModules,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
