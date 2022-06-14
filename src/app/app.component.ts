import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    // trigger('detailExpand', [
    //   state('collapsed', style({height: '0px', minHeight: '0'})),
    //   state('expanded', style({height: '*'})),
    //   transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    // ]),
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ],
})
export class AppComponent {

  movieTitle:string | any = null
  avaliableTypes = ['movie', 'episodes', 'series']
  selectedType: string|any

  title = 'favMovies';
  movieList: any = null

  columnsToDisplay = ['Title', 'Year', 'Type'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: any | null;
  dataSource:any
  pageSize = 10
  pageSizeOptions = [10]
  length:number|any = null
  pageEvent: PageEvent|any;
  userName :any
  favoriteList = []
  showingFavoriteList!:boolean
  hideTable:boolean = true
  lastPageIndex = 0
  oldLastIndex!: number|any;

  constructor(private api: ApiService, public dialog: MatDialog){
    if(localStorage.getItem("FavMoviesUsername")){
      this.userName = localStorage.getItem("FavMoviesUsername")
      this.getFavMovies()
    }else{
      this.dialog.open(UsernameDialog, {
        width: "90%",
        maxWidth: "600px",
        data: {userName: null}
      }).afterClosed().subscribe(res => {
        if(res){
          this.userName = res
          localStorage.setItem("FavMoviesUsername", this.userName)
          setTimeout(() => {
            console.log("Checking if movies exist")
            this.getFavMovies()
          }, 1000);
        }
      })
    }
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  getFavMovies(){
    this.api.getFavMovies(this.userName).subscribe((res:any) => {
      this.favoriteList = res?.['records'] ?? []
      console.log("users fav movies", res, this.favoriteList)
      if(this.movieList?.["Search"]?.length > 0 && this.favoriteList.length > 0){
        console.log("Checking if favorite in list")
        this.movieList["Search"].map((movie:any) => {
          let index = this.favoriteList.findIndex((e:any) => e.imdbId == movie.imdbID)
          if(index  > -1){
            movie.favorite = index > -1
            movie.favoriteId = this.favoriteList[index]?.["id"]
          }else{
            movie.favorite = false
          }
        })
      }
      if(this.showingFavoriteList){
        if(this.favoriteList.length > 0){
          this.favoriteList.map((movie:any) => {
            movie.favorite = true
            movie.favoriteId = movie.id
          })
          this.dataSource = new MatTableDataSource(this.favoriteList)
        }else{
          this.hideTable = true
        }
      }
    })
  }

  searchMovies(page?:number|null){
    this.showingFavoriteList = false
    this.api.getFromOmdbApi(this.movieTitle, null, !page ? 1 : page, this.selectedType).subscribe((res:any) => {
      // console.log("searced movies",res)
      if(res?.["Response"] == "True"){
        this.movieList = res
        this.dataSource = new MatTableDataSource(this.movieList["Search"])
        this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
        this.length = this.movieList["totalResults"]
        this.hideTable = false
        this.getFavMovies()
      }else{
        this.movieList = []
      }
    })
  }

  getMoreInfo(element:any){
    // console.log("Element", element)
    this.api.getFromOmdbApi(this.movieTitle, element.imdbID).subscribe((res:any) => {
      if(res?.["Response"] == "True"){
        element.moreInfo = res
      }
    })
  }

  setType(event:any, type?:string){
    // console.log("event", event, type)
    this.selectedType = event.checked ? type : null
    // console.log("selectedType", this.selectedType)
  }

  getNewData(event:any){
    this.lastPageIndex = event.pageIndex
    this.searchMovies((event.pageIndex+1))
  }

  addToFavorite(element:any){
    console.log("Add to favorite element", element)
    if(element.favorite){
      this.api.removeFromFavorite(element.favoriteId, this.userName).subscribe((delRes:any) => {
        console.log("del res", delRes)
        if(delRes) {
          this.getFavMovies()
        }
        return
      })
    }else{
      this.api.addToFavorite(element.Title, element.Year, element.imdbID, element.moreInfo ?? null,element.Type, this.userName, element.Poster).subscribe((res:any) => {
        console.log("add to favorite", res)
        if(res){
          this.getFavMovies()
        }
        return
      })
    }
  }

  showFavoriteList(){
    if(!this.showingFavoriteList){
      this.favoriteList.map((movie:any) => {
        movie.favorite = true
        movie.favoriteId = movie.id
      })
      this.oldLastIndex = this.lastPageIndex
      this.dataSource = new MatTableDataSource(this.favoriteList)
      this.length = this.favoriteList.length
      this.dataSource.sort = this.sort;
      this.showingFavoriteList = true
      this.lastPageIndex = 0
      this.hideTable = false
    }else{
      if(this.movieList){
        this.dataSource = new MatTableDataSource(this.movieList["Search"])
        this.length = this.movieList["totalResults"]
        this.lastPageIndex = this.oldLastIndex
        this.oldLastIndex = null
      }else{
        this.hideTable = true
      }
      this.showingFavoriteList = false
    }
  }

}


export interface DialogData {
 userName: string;
}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'userName-dialog.html',
})
export class UsernameDialog {
  constructor(
    public dialogRef: MatDialogRef<UsernameDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
