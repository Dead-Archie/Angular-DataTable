# Angular-DataTable
Datatable created with angular version 1.X.X with features like comma separated search, column resize, fixed column, fixed header, pagination, sorting, pagination details.


**Demo** : [angular DataTable](https://embed.plnkr.co/brqceXoHLjwIqKXe/)


# **__Features__**
Data have multiple features like , 

* Comma separated Search
* Fixed Header
* Fixed Column
* Column Reszing
* pagination
* Pagination Information
* Sorting

### Comma separated Search 
  For this features, add `searchfilter` in __ng-repeat__ as filter. 
### Fixed Header & Fixed Column 
  * For this features, add `fixed-column-table` class in container `Div`
  
  * `fixed-columns` to display number for the fixed column in dataTable. Value should be integer. 
  
  * `number-of-displayed-columns` to display column according to the numbers of columns.

  suppose you have 15 cloumns in your Table and 3 fixed-columns, and you mentioned `number-of-displayed-columns='6'` : For this case,
  
  * for 6 columns(`number-of-displayed-columns`) *table* will have 100% width. 
  * for rest of the column i.e. `15-6 = 9` it will take extra 100px of each column , so remaining width become 900px. 
  * now the total *table* width become `width:(calc(100% + 900 px));`
  
### Column Reszing
  Add `col-resizer` class in table headers.
  
### pagination & Pagination Information 
  Add `dir-pagination-controls` directive for displaying pagination and pagination information. 
  
  * `max-size` : **integer** //to show pagintion node, e.g. `5` it will show like ` 1 ... 3 ... 100 `, for `7` it will show like `1 ... 2 3 4 ... 100`
  * `direction-links` : **true** // to show _previous_ _next_ , to hide make it `false`.
   
