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
* Items per Page

### Comma separated Search 
  For this feature, `searchfilter` is using . `searchListView` is the ng-model of input search box. SeachFIlter is added of dataTableDirective. Resource page.
  
### Fixed Header & Fixed Column
  For this features, add `fixed-column-table` class in container Div. We are using class type directive. For fixed Column developer has to mention 2 attributes..
  *	`fixed-columns="2"` //This number will indicate the number of column to be fixed from left. Fixed column is only possible from left to Right.
  * `number-of-displayed-columns="4"`  // This number indicated the number of column to be shown on a data Table. suppose you have 15 columns in your Table and 3 are fixed-columns(`fixed-columns="3"`), and you mentioned `number-of-displayed-columns="6"` : For this case,
	for __6 columns__ ,table width will be __100%.__
	for rest of the columns i.e. __15-6 = 9__ it will take __extra 100px of each column__ , so remaining width become __900px.__
	now the total table width become __width:(calc(100% + 900 px));__

  
### Column Reszing
   For this features, Add `Class="col-resizer"`> in table headers. After adding class Column resize will work.(for desktop Only , for Ipad it will not Work)
       
 
 __columns have some default configuration.__ 

  __COL_RESIZER_MIN_COL_WIDTH: 70,__ // minimum column resizing width
  __ELEMENT_NODE_NAMES: ['TH', 'TD'],__
  __EXTRA_COLUMN_WIDTH:100__ // minimum column width for extra column is used for fixed column(extra Column Width is required for fixed-column features )

  
### pagination & Pagination Information 
  `dir-pagination-controls` directive for displaying pagination and pagination information. It has 4 attributes 
	* `max-size="7"` // it indicates number of nodes. E.g. for max-size=”7” .
		Total nodes including (…) is 7. By default max-size is set by 5. If developer write max-size<5, then by default it will take max-size=”5” .
	* `direction-links="true"` // to show “Prev” & “next” button. For hide make it false.
	* `boundary-links="false"` // It indicates anchor tag for current page number.
	* `pagination-id="tableView"` // Pagination-id is unique Id for every dataTable. It is an optional field It’s 			map with the pagination with dataTable. Developer has to mention pagination-id 2 times, In dir-pagination-controls & dir-paginate.
	
	
### Sorting
   For this feature `arcOrderBy` is using . For every sorting we are passing column-name in sortKey as a Boolean `true/false` value.

### Items Per Page
  This attribute is used for the __number of rows__ to display in a page. E.g. For above snippet  it is deafalutly set by 5 (5 rows per page).
