import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})

/* 
* Loads the base and meal data from the api
*/
export class DataService {

  baseUrl = 'https://mensaar.de/api/2/TFtD8CTykAXXwrW4WBU4/1/';

  constructor(private http: HttpClient, private languageService: LanguageService) { }


  /**
   * Gets the BaseData, containing the mensaList, allergenes and general informations
   * @returns: The BaseData request
   */
  getBaseData() {
    // check language and use respective api call
    var languageCode = this.languageService.getLanguage();
    if (!languageCode)
      languageCode = "en"
    var htmlString = this.baseUrl + languageCode + "/getBaseData"
    return this.http.get(
      htmlString
    )
  }

  /**
   * Gets the Data to a specific mensa, containing all meals etc.
   * @param mensa: Specific mensa the data is requested for
   * @returns: The MensaData request
   */
  getMensaData(mensa) {
    // check language and use respective api call
    var languageCode = this.languageService.getLanguage();
    if (!languageCode)
      languageCode = "en"
    var htmlString = this.baseUrl + languageCode + "/getMenu/" + mensa;
    return this.http.get(
      htmlString
    )

  }

  /**
 * 
 * @param language: language determines the post url
 * @param postData: data to be send
 * @param callbackSuccess: function which is executed on success
 * @param callbackError: function which is executed on error
 */
  postRequest(language: string, postData: any, callbackSuccess: any, callbackError: any) {
    // create header specifying the data format (form-urlencoded)
    const headersOptions = { 'Content-Type': 'application/x-www-form-urlencoded' };

    // convert data into urlencoded format
    let body = new URLSearchParams();
    for (const key of Object.keys(postData)) {
      body.set(key, postData[key]);
    }

    // send post request
    this.http.post(this.baseUrl + language + '/submitFeedback', body.toString(), { headers: headersOptions })
      .subscribe(callbackSuccess, callbackError);
  }

}
