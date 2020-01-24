import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { Events } from '@ionic/angular';

import { Plugins, PluginListenerHandle } from '@capacitor/core';
const { Network } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  networkListener: PluginListenerHandle;
  networkStatus: boolean;

  mensaList: any;
  keys: String[];
  networkPlugin: any;

  constructor(private dataService: DataService, public events: Events) {
    // When this event is fired, then the language was changed --> reload data.
    this.events.subscribe('language:changed', () => {
      if (this.networkStatus)
        this.loadData();
    });
  }

  /**
   * gets triggered, every time the page gets initialized.
   */
  async ngOnInit() {
    this.networkPlugin = Network;
    this.networkStatus = (await Network.getStatus()).connected

    if (this.networkStatus)
      this.loadData();

    this.networkListener = Network.addListener('networkStatusChange', status => {
      this.networkStatus = status.connected
      if (status.connected)
        this.loadData()
    })
  }

  /**
   * gets the basedata from the api to set the list with all mensas 
   */
  loadData() {
    this.dataService.getBaseData().subscribe(data => {
      this.mensaList = data["locations"]
      this.keys = Object.keys(this.mensaList)
    });
  }

  /**
   * reloads the data if the user clicks the "try again" button after internet connection problems
   */
  async tryAgain() {
    this.networkStatus = (await Network.getStatus()).connected
    if (this.networkStatus)
      this.loadData()
  }
}
