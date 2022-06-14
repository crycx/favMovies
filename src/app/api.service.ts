import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiBaseUrl: string
  getFavMoviesUrl: string;
  createFavMoviesUrl: string;
  typeArray = []
  deleteFavMoviesUrl: string;


  constructor(private http: HttpClient ) {
    // määrame erinevad urlid
    this.apiBaseUrl = "https://sinpal.ee/favapi/"
    this.getFavMoviesUrl = "get_favmovies.php"
    this.createFavMoviesUrl = "create_favmovies.php"
    this.deleteFavMoviesUrl = "delete_favmovies.php"
  }

  getFavMovies(userName:string, idArray?:[], filters?:[{}]){
    let data = {userName: userName, idArray: idArray ?? null, filters: filters ?? null}
    //määrame päringu urli
    let url = this.apiBaseUrl + this.getFavMoviesUrl

    //pärime info andmebaasist
    let response = this.http.post(url, data)

    // tagastame päringu subscriptionina
    return response
  }

  getFromOmdbApi(search:string, id?:string|null, page?:number|null, type?:string|null){
    let url = "https://www.omdbapi.com/"
    let params = new HttpParams()

    // kui id määratud otsime id järgi, muidu pealkirja järgi
    params = params.set("apikey", "94818d58")
    params = id ? params.set("i", id) : params.set("s", search)
    page ? params = params.set("page", page) : ""
    type ? params = params.set("type", type) : ""

    // teeme get päringu vastavate parameetritega
    let response = this.http.get(url+"?"+params)
    // tagastame päringu subscriptionina
    return response
  }

  addToFavorite(title:string, year:number, imdbID:string, object:[]|{}, type:string,  userName:string, img:string){
    let data = {title: title, year: year, imdbID: imdbID, object: object, userName: userName, type: type, img: img}
    let url = this.apiBaseUrl + this.createFavMoviesUrl

    let response = this.http.post(url, data)
    return response
  }

  removeFromFavorite(id:number, userName:string){
    let data = {id: id, userName: userName}
    let url = this.apiBaseUrl + this.deleteFavMoviesUrl

    let response = this.http.post(url, data)
    return response
  }

}
