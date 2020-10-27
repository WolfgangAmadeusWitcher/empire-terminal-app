import { SignalRService } from './services/signal-r.service';
import { TerminalService } from './services/terminal.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TerminalComponent } from './terminal/terminal.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';

@NgModule({
  declarations: [
    AppComponent,
    TerminalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  providers: [HttpClientModule, TerminalService, SignalRService],
  bootstrap: [AppComponent]
})
export class AppModule { }
