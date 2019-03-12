var DEFAULT_ID = '__default';
angular.module('dataTableDirective', [])
    /**
     * @ngdoc object
     * @name colresizer
     * @description colresizer directive implements column resize of the HTML table.
     */

    // windowResize directive currently not working 
    .directive('windowResize', function($window) {
        return {
            restrict: 'AC',
            scope: {},
            link: function(scope, element, attrs) {

                var w = angular.element(element);
                scope.getWindowDimensions = function() {
                    return {
                        'h': w.height(),
                        'w': w.width()
                    };
                };
                scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
                    scope.windowHeight = newValue.h;
                    scope.windowWidth = newValue.w;

                    scope.style = function() {
                        return {
                            'height': (newValue.h - 100) + 'px',
                            'width': (newValue.w - 100) + 'px'
                        };
                    };

                }, true);

                w.bind('resize', function() {
                    scope.$apply();
                });
            }
        }
    })
    // Custom Order by for sorting
    .filter('arcOrderBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function(a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    })
    // searchfilter for searching in DataTable
    .filter('searchfilter', function() {
        return function(items, search) {
            if (!search) {
                return items;
            }
            var searchArry = "";
            if (search.indexOf(',') > 0) {
                searchArry = search.split(','); // for comma separated search 
            }
            return items.filter(function(element, index, array) {

                if (searchArry.length > 0) {  // if search text has comma
                    if (searchArry[searchArry.length - 1] != "") {
                        for (var i = 0; i < Object.values(element).length; i++) {
                            for (var j = 0; j < searchArry.length; j++) {
                                if (typeof(Object.values(element)[i]) != 'boolean' && typeof(Object.values(element)[i]) != 'object') {
                                    if (Object.values(element)[i].toString().toLowerCase().indexOf(Object.values(searchArry)[j].toLowerCase()) != -1) {
                                        return true;
                                    };
                                }
                            }
                        }
                    } else {
                        for (var i = 0; i < Object.values(element).length; i++) {
                            for (var j = 0; j < searchArry.length - 1; j++) { // removing las comma from seach text , using (-1) for the same
                                if (typeof(Object.values(element)[i]) != 'boolean' && typeof(Object.values(element)[i]) != 'object') {
                                    if (Object.values(element)[i].toString().toLowerCase().indexOf(Object.values(searchArry)[j].toLowerCase()) != -1) {
                                        return true;
                                    };
                                }
                            }
                        }
                    }

                } else {
                    for (var i = 0; i < Object.values(element).length; i++) {  // search text without comma
                        //console.log(i);
                        if (typeof(Object.values(element)[i]) != 'boolean' && typeof(Object.values(element)[i]) != 'object') {
                            if (Object.values(element)[i].toString().toLowerCase().indexOf(search.toLowerCase()) != -1) {
                                return true;
                            };
                        }
                    }
                }

            });
        }

    })
    .constant('colResizerConfig', {
        COL_RESIZER_MIN_COL_WIDTH: 70, // minimun column resizing width
        ELEMENT_NODE_NAMES: ['TH', 'TD'],
        EXTRA_COLUMN_WIDTH:100 // minimun column with for extra column for fixed column
    })
    .directive('colResizer', ['$compile', '$document', '$timeout', 'colResizerConfig', function($compile, $document, $timeout, colResizerConfig) {
        return {
            restrict: 'AC',
            scope: {},
            link: function(scope, element, attrs) {
                var resizerStyle = 'position:absolute;border:1px solid transparent;background-color:transparent;top:0;bottom:0;right:0;width:6px;cursor:col-resize;';
                var startPos = 0,
                    nextElem = 0,
                    currWidth = 0,
                    nextWidth = 0,
                    headerWidth = 0,
                    table = "";

                function onResizeStart(event) {
                    event.preventDefault();
                    startPos = event.clientX;
                    nextElem = element.next();
                    table = element.closest('table');
                    readElementWidths();

                    // Register events
                    $document.on('mousemove', onResizeMove);
                    $document.on('mouseup', onResizeEnd);
                    setCursor('col-resize');
                }

                function onResizeMove(event) {
                    // if newPos > 0 move id forward - if newPos < 0 move is backward
                    var newPos = event.clientX - startPos;
                    var newCurrWidth = currWidth + newPos;
                    var newNextWidth = nextWidth - newPos;
                    if (newPos > 0 && newNextWidth < colResizerConfig.COL_RESIZER_MIN_COL_WIDTH ||
                        newPos < 0 && newCurrWidth < colResizerConfig.COL_RESIZER_MIN_COL_WIDTH) {
                        return;
                    }
                    // Change to the percent value
                    element.css('width', (newCurrWidth / headerWidth * 100) + '%');
                    nextElem.css('width', (newNextWidth / headerWidth * 100) + '%');
                }

                function onResizeEnd() {
                    // Deregister events
                    $document.off('mousemove', onResizeMove);
                    $document.off('mouseup', onResizeEnd);
                    setCursor('default');
                }

                function readElementWidths() {
                    currWidth = element.prop('offsetWidth');
                    nextWidth = nextElem.prop('offsetWidth');
                    headerWidth = element.parent().prop('offsetWidth');
                }

                function setCursor(type) {
                    $document.prop('body').style.cursor = type;
                }

                function isRightElement() {
                    // Next element must by TH or TD element
                    var node = element.next().prop('nodeName');
                    if (angular.isUndefined(node)) {
                        return false;
                    }
                    if (!angular.equals(colResizerConfig.ELEMENT_NODE_NAMES[0].toUpperCase(), node.toUpperCase()) &&
                        !angular.equals(colResizerConfig.ELEMENT_NODE_NAMES[1].toUpperCase(), node.toUpperCase())) {
                        return false;
                    }
                    return true;
                }

                function init() {
                    if (isRightElement()) {
                        var colResizer = angular.element('<div class="colresizer" ng-click="$event.stopPropagation()" style="' + resizerStyle + '"></div>');
                        colResizer.on('mousedown', onResizeStart);
                        element.css('background-clip', 'padding-box');
                        element.css('position', 'relative');
                        element.css('min-width', '7.5%'); // Min-width added for truncation 
                        element.append(colResizer);
                        $compile(colResizer)(scope);
                    }
                }

                scope.$on('$destroy', function() {
                    var colResizer = element[0].querySelector('.colresizer');
                    angular.element(colResizer).off('mousedown', onResizeStart);
                });

                $timeout(init);
            }
        };
    }])
    .directive('fixedColumnTable', ['$timeout','colResizerConfig', function($timeout,colResizerConfig) {
        return {
            restrict: 'AC',
            scope: {
                fixedColumns: "=",
                numberOfDisplayedColumns: "="
            },
            link: function(scope, element) {
                var container = element[0];
                var numberOfDisplayedColumns = scope.numberOfDisplayedColumns || 10;

                function activate() {
                    applyClasses('thead tr', 'cross', 'th');
                    applyClasses('tbody tr', 'fixed-cell', 'td');

                    applyTableWidth('thead tr th', 'table');

                    var leftHeaders = [].concat.apply([], container.querySelectorAll('tbody td.fixed-cell'));
                    var topHeaders = [].concat.apply([], container.querySelectorAll('thead th'));
                    var crossHeaders = [].concat.apply([], container.querySelectorAll('thead th.cross'));

                    //console.log('line before setting up event handler');

                    container.addEventListener('scroll', function() {
                        //console.log('scroll event handler hit');
                        var x = container.scrollLeft;
                        var y = container.scrollTop;

                        //Update the left header positions when the container is scrolled
                        leftHeaders.forEach(function(leftHeader) {
                            leftHeader.style.transform = translate(x, 0);
                        });

                        //Update the top header positions when the container is scrolled
                        topHeaders.forEach(function(topHeader) {
                            topHeader.style.transform = translate(0, y);
                        });

                        //Update headers that are part of the header and the left column
                        crossHeaders.forEach(function(crossHeader) {
                            crossHeader.style.transform = translate(x, y);
                        });

                    });

                    function translate(x, y) {
                        return 'translate(' + x + 'px, ' + (y - 1) + 'px)';
                    }
                    // function for changing Table with for fixed column 
                    function applyTableWidth(selector, table) {
                        var arrayItems = [].concat.apply([], container.querySelectorAll(selector));

                        if (arrayItems.length > numberOfDisplayedColumns) {
                            // addition of extra width 100 px for numbers of extra displayed columns
                            container.querySelectorAll(table)[0].style.width = "calc(100% + " + (arrayItems.length - numberOfDisplayedColumns) * colResizerConfig.EXTRA_COLUMN_WIDTH + "px)"
                        } else {
                            container.querySelectorAll(table)[0].style.width = "100%";
                        }
                    }

                    function applyClasses(selector, newClass, cell) {
                        var arrayItems = [].concat.apply([], container.querySelectorAll(selector));
                        var currentElement;
                        var colspan;

                        arrayItems.forEach(function(row, i) {
                            var numFixedColumns = scope.fixedColumns;
                            
                            for (var j = 0; j < numFixedColumns; j++) {
                                currentElement = angular.element(row).find(cell)[j];
                                currentElement.classList.add(newClass);

                                if (currentElement.hasAttribute('colspan')) {
                                    colspan = currentElement.getAttribute('colspan');
                                    numFixedColumns -= (parseInt(colspan) - 1);
                                }
                            }
                        });
                    }
                }

                $timeout(function() {
                    activate();
                }, 0);

                scope.$on('refreshFixedColumns', function() {
                    $timeout(function() {
                        activate();
                        container.scrollLeft = 0;
                    }, 0);
                });
            }
        };
    }])

    .directive('dirPaginate', ['$compile', '$parse', 'paginationService', dirPaginateDirective])
    .directive('dirPaginateNoCompile', noCompileDirective)
    .directive('dirPaginationControls', ['paginationService', 'paginationTemplate', '$rootScope', dirPaginationControlsDirective])
    .filter('itemsPerPage', ['paginationService', itemsPerPageFilter])
    .service('paginationService', paginationService)
    .provider('paginationTemplate', paginationTemplateProvider)
    .run(['$templateCache', dirPaginationControlsTemplateInstaller]);

function dirPaginateDirective($compile, $parse, paginationService) {

    return {
        terminal: true,
        multiElement: true,
        compile: dirPaginationCompileFn
    };

    function dirPaginationCompileFn(tElement, tAttrs) {

        var expression = tAttrs.dirPaginate;
        // regex taken directly from https://github.com/angular/angular.js/blob/master/src/ng/directive/ngRepeat.js#L211
        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

        var filterPattern = /\|\s*itemsPerPage\s*:[^|]*/;
        if (match[2].match(filterPattern) === null) {
            throw 'pagination directive: the \'itemsPerPage\' filter must be set.';
        }
        var itemsPerPageFilterRemoved = match[2].replace(filterPattern, '');
        var collectionGetter = $parse(itemsPerPageFilterRemoved);

        addNoCompileAttributes(tElement);

        // If any value is specified for paginationId, we register the un-evaluated expression at this stage for the benefit of any
        // dir-pagination-controls directives that may be looking for this ID.
        var rawId = tAttrs.paginationId || DEFAULT_ID;
        paginationService.registerInstance(rawId);

        return function dirPaginationLinkFn(scope, element, attrs) {

            // Now that we have access to the `scope` we can interpolate any expression given in the paginationId attribute and
            // potentially register a new ID if it evaluates to a different value than the rawId.
            var paginationId = $parse(attrs.paginationId)(scope) || attrs.paginationId || DEFAULT_ID;
            paginationService.registerInstance(paginationId);

            var repeatExpression = getRepeatExpression(expression, paginationId);
            addNgRepeatToElement(element, attrs, repeatExpression);

            removeTemporaryAttributes(element);
            var compiled = $compile(element);

            var currentPageGetter = makeCurrentPageGetterFn(scope, attrs, paginationId);
            paginationService.setCurrentPageParser(paginationId, currentPageGetter, scope);

            if (typeof attrs.totalItems !== 'undefined') {
                paginationService.setAsyncModeTrue(paginationId);
                scope.$watch(function() {
                    return $parse(attrs.totalItems)(scope);
                }, function(result) {
                    if (0 <= result) {
                        paginationService.setCollectionLength(paginationId, result);
                    }
                });
            } else {
                scope.$watchCollection(function() {
                    return collectionGetter(scope);
                }, function(collection) {
                    if (collection) {
                        paginationService.setCollectionLength(paginationId, collection.length);
                    }
                });
            }

            // Delegate to the link function returned by the new compilation of the ng-repeat
            compiled(scope);
        };
    }

    /**
     * If a pagination id has been specified, we need to check that it is present as the second argument passed to
     * the itemsPerPage filter. If it is not there, we add it and return the modified expression.
     *
     * @param expression
     * @param paginationId
     * @returns {*}
     */
    function getRepeatExpression(expression, paginationId) {
        var repeatExpression,
            idDefinedInFilter = !!expression.match(/(\|\s*itemsPerPage\s*:[^|]*:[^|]*)/);

        if (paginationId !== DEFAULT_ID && !idDefinedInFilter) {
            repeatExpression = expression.replace(/(\|\s*itemsPerPage\s*:[^|]*)/, "$1 : '" + paginationId + "'");
        } else {
            repeatExpression = expression;
        }

        return repeatExpression;
    }

    /**
     * Adds the ng-repeat directive to the element. In the case of multi-element (-start, -end) it adds the
     * appropriate multi-element ng-repeat to the first and last element in the range.
     * @param element
     * @param attrs
     * @param repeatExpression
     */
    function addNgRepeatToElement(element, attrs, repeatExpression) {
        if (element[0].hasAttribute('dir-paginate-start') || element[0].hasAttribute('data-dir-paginate-start')) {
            // using multiElement mode (dir-paginate-start, dir-paginate-end)
            attrs.$set('ngRepeatStart', repeatExpression);
            element.eq(element.length - 1).attr('ng-repeat-end', true);
        } else {
            attrs.$set('ngRepeat', repeatExpression);
        }
    }

    /**
     * Adds the dir-paginate-no-compile directive to each element in the tElement range.
     * @param tElement
     */
    function addNoCompileAttributes(tElement) {
        angular.forEach(tElement, function(el) {
            if (el.nodeType === Node.ELEMENT_NODE) {
                angular.element(el).attr('dir-paginate-no-compile', true);
            }
        });
    }

    /**
     * Removes the variations on dir-paginate (data-, -start, -end) and the dir-paginate-no-compile directives.
     * @param element
     */
    function removeTemporaryAttributes(element) {
        angular.forEach(element, function(el) {
            if (el.nodeType === Node.ELEMENT_NODE) {
                angular.element(el).removeAttr('dir-paginate-no-compile');
            }
        });
        element.eq(0).removeAttr('dir-paginate-start').removeAttr('dir-paginate').removeAttr('data-dir-paginate-start').removeAttr('data-dir-paginate');
        element.eq(element.length - 1).removeAttr('dir-paginate-end').removeAttr('data-dir-paginate-end');
    }

    /**
     * Creates a getter function for the current-page attribute, using the expression provided or a default value if
     * no current-page expression was specified.
     *
     * @param scope
     * @param attrs
     * @param paginationId
     * @returns {*}
     */
    function makeCurrentPageGetterFn(scope, attrs, paginationId) {
        var currentPageGetter;
        if (attrs.currentPage) {
            currentPageGetter = $parse(attrs.currentPage);
        } else {
            // if the current-page attribute was not set, we'll make our own
            var defaultCurrentPage = paginationId + '__currentPage';
            scope[defaultCurrentPage] = 1;
            currentPageGetter = $parse(defaultCurrentPage);
        }
        return currentPageGetter;
    }
}

/**
 * This is a helper directive that allows correct compilation when in multi-element mode (ie dir-paginate-start, dir-paginate-end).
 * It is dynamically added to all elements in the dir-paginate compile function, and it prevents further compilation of
 * any inner directives. It is then removed in the link function, and all inner directives are then manually compiled.
 */
function noCompileDirective() {
    return {
        priority: 5000,
        terminal: true
    };
}

function dirPaginationControlsTemplateInstaller($templateCache) {
    $templateCache.put('angularUtils.directives.dirPagination.template', '<div class="detailedInformationControl slds-float_left">Showing {{(range.upper==0)?range.upper:range.lower}} to {{range.upper}} of {{range.total}} entries.</div><div class="paginationControl slds-float_right"><ul class="pagination" ng-if="1 < pages.length"><li style="text-decoration:none" ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }"><a  href="" ng-click="setCurrent(pagination.current - 1)">Prev</a></li><li ng-repeat="pageNumber in pages track by $index" ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == \'...\' }"><a href=""  ng-click="setCurrent(pageNumber)">{{ pageNumber }}</a></li><li ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }"><a href="" ng-click="setCurrent(pagination.current + 1)">Next</a></li></ul></div>');
}

function dirPaginationControlsDirective(paginationService, paginationTemplate, $rootScope) {

    var numberRegex = /^\d+$/;

    return {
        restrict: 'AE',
        templateUrl: function(elem, attrs) {
            return attrs.templateUrl || paginationTemplate.getPath();
        },
        scope: {
            maxSize: '=?',
            onPageChange: '&?',
            paginationId: '=?'
        },
        link: dirPaginationControlsLinkFn
    };

    function dirPaginationControlsLinkFn(scope, element, attrs) {

        // rawId is the un-interpolated value of the pagination-id attribute. This is only important when the corresponding dir-paginate directive has
        // not yet been linked (e.g. if it is inside an ng-if block), and in that case it prevents this controls directive from assuming that there is
        // no corresponding dir-paginate directive and wrongly throwing an exception.
        var rawId = attrs.paginationId || DEFAULT_ID;
        var paginationId = scope.paginationId || attrs.paginationId || DEFAULT_ID;

        if (!paginationService.isRegistered(paginationId) && !paginationService.isRegistered(rawId)) {
            var idMessage = (paginationId !== DEFAULT_ID) ? ' (id: ' + paginationId + ') ' : ' ';
            throw 'pagination directive: the pagination controls' + idMessage + 'cannot be used without the corresponding pagination directive.';
        }

        if (!scope.maxSize) {
            scope.maxSize = 9;
        }
        scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : true;
        scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : false;
        
        //scope.totalData = angular.isDefined(attrs.totalData) ? scope.$parent.$eval(attrs.totalData) : '';
        //scope.searchedData = angular.isDefined(attrs.searchedData) ? scope.$parent.$eval(attrs.searchedData) : false;

        var paginationRange = Math.max(scope.maxSize, 5);
        scope.pages = [];
        scope.pagination = {
            last: 1,
            current: 1
        };
        scope.range = {
            lower: 1,
            upper: 1,
            total: 1
        };

        scope.$watch(function() {
            return (paginationService.getCollectionLength(paginationId) + 1) * paginationService.getItemsPerPage(paginationId);
        }, function(length) {
            if (0 < length) {
                generatePagination();
            }
        });

        scope.$watch(function() {
            return (paginationService.getItemsPerPage(paginationId));
        }, function(current, previous) {
            if (current != previous && typeof previous !== 'undefined') {
                goToPage(scope.pagination.current);
            }
        });

        scope.$watch(function() {
            return paginationService.getCurrentPage(paginationId);
        }, function(currentPage, previousPage) {
            if (currentPage != previousPage) {
                goToPage(currentPage);
            }
        });

        scope.setCurrent = function(num) {
            $rootScope.$broadcast('refreshFixedColumns', {});
            if (isValidPageNumber(num)) {
                num = parseInt(num, 10);
                paginationService.setCurrentPage(paginationId, num);
            }
        };

        function goToPage(num) {
            $rootScope.$broadcast('refreshFixedColumns', {});
            if (isValidPageNumber(num)) {
                scope.pages = generatePagesArray(num, paginationService.getCollectionLength(paginationId), paginationService.getItemsPerPage(paginationId), paginationRange);
                scope.pagination.current = num;
                updateRangeValues();

                // if a callback has been set, then call it with the page number as an argument
                if (scope.onPageChange) {
                    scope.onPageChange({
                        newPageNumber: num
                    });
                }
            }
        }

        function generatePagination() {
            $rootScope.$broadcast('refreshFixedColumns', {});
            var page = parseInt(paginationService.getCurrentPage(paginationId)) || 1;

            scope.pages = generatePagesArray(page, paginationService.getCollectionLength(paginationId), paginationService.getItemsPerPage(paginationId), paginationRange);
            scope.pagination.current = page;
            scope.pagination.last = scope.pages[scope.pages.length - 1];
            if (scope.pagination.last < scope.pagination.current) {
                scope.setCurrent(scope.pagination.last);
            } else {
                updateRangeValues();
            }
        }

        /**
         * This function updates the values (lower, upper, total) of the `scope.range` object, which can be used in the pagination
         * template to display the current page range, e.g. "showing 21 - 40 of 144 results";
         */
        function updateRangeValues() {
            $rootScope.$broadcast('refreshFixedColumns', {});
            var currentPage = paginationService.getCurrentPage(paginationId),
                itemsPerPage = paginationService.getItemsPerPage(paginationId),
                totalItems = paginationService.getCollectionLength(paginationId);

            scope.range.lower = (currentPage - 1) * itemsPerPage + 1;
            scope.range.upper = Math.min(currentPage * itemsPerPage, totalItems);
            scope.range.total = totalItems;
        }

        function isValidPageNumber(num) {
            return (numberRegex.test(num) && (0 < num && num <= scope.pagination.last));
        }
    }

    /**
     * Generate an array of page numbers (or the '...' string) which is used in an ng-repeat to generate the
     * links used in pagination
     *
     * @param currentPage
     * @param rowsPerPage
     * @param paginationRange
     * @param collectionLength
     * @returns {Array}
     */
    function generatePagesArray(currentPage, collectionLength, rowsPerPage, paginationRange) {
        var pages = [];
        var totalPages = Math.ceil(collectionLength / rowsPerPage);
        var halfWay = Math.ceil(paginationRange / 2);
        var position;

        if (currentPage <= halfWay) {
            position = 'start';
        } else if (totalPages - halfWay < currentPage) {
            position = 'end';
        } else {
            position = 'middle';
        }

        var ellipsesNeeded = paginationRange < totalPages;
        var i = 1;
        while (i <= totalPages && i <= paginationRange) {
            var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

            var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
            var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
            if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                pages.push('...');
            } else {
                pages.push(pageNumber);
            }
            i++;
        }
        return pages;
    }

    /**
     * Given the position in the sequence of pagination links [i], figure out what page number corresponds to that position.
     *
     * @param i
     * @param currentPage
     * @param paginationRange
     * @param totalPages
     * @returns {*}
     */
    function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
        var halfWay = Math.ceil(paginationRange / 2);
        if (i === paginationRange) {
            return totalPages;
        } else if (i === 1) {
            return i;
        } else if (paginationRange < totalPages) {
            if (totalPages - halfWay < currentPage) {
                return totalPages - paginationRange + i;
            } else if (halfWay < currentPage) {
                return currentPage - halfWay + i;
            } else {
                return i;
            }
        } else {
            return i;
        }
    }
}

/**
 * This filter slices the collection into pages based on the current page number and number of items per page.
 * @param paginationService
 * @returns {Function}
 */
function itemsPerPageFilter(paginationService) {

    return function(collection, itemsPerPage, paginationId) {
        if (typeof(paginationId) === 'undefined') {
            paginationId = DEFAULT_ID;
        }
        if (!paginationService.isRegistered(paginationId)) {
            throw 'pagination directive: the itemsPerPage id argument (id: ' + paginationId + ') does not match a registered pagination-id.';
        }
        var end;
        var start;
        if (collection instanceof Array) {
            itemsPerPage = parseInt(itemsPerPage) || 9999999999;
            if (paginationService.isAsyncMode(paginationId)) {
                start = 0;
            } else {
                start = (paginationService.getCurrentPage(paginationId) - 1) * itemsPerPage;
            }
            end = start + itemsPerPage;
            paginationService.setItemsPerPage(paginationId, itemsPerPage);

            return collection.slice(start, end);
        } else {
            return collection;
        }
    };
}

/**
 * This service allows the various parts of the module to communicate and stay in sync.
 */
function paginationService() {

    var instances = {};
    var lastRegisteredInstance;

    this.registerInstance = function(instanceId) {
        if (typeof instances[instanceId] === 'undefined') {
            instances[instanceId] = {
                asyncMode: false
            };
            lastRegisteredInstance = instanceId;
        }
    };

    this.isRegistered = function(instanceId) {
        return (typeof instances[instanceId] !== 'undefined');
    };

    this.getLastInstanceId = function() {
        return lastRegisteredInstance;
    };

    this.setCurrentPageParser = function(instanceId, val, scope) {
        instances[instanceId].currentPageParser = val;
        instances[instanceId].context = scope;
    };
    this.setCurrentPage = function(instanceId, val) {
        instances[instanceId].currentPageParser.assign(instances[instanceId].context, val);
    };
    this.getCurrentPage = function(instanceId) {
        var parser = instances[instanceId].currentPageParser;
        return parser ? parser(instances[instanceId].context) : 1;
    };

    this.setItemsPerPage = function(instanceId, val) {
        instances[instanceId].itemsPerPage = val;
    };
    this.getItemsPerPage = function(instanceId) {
        return instances[instanceId].itemsPerPage;
    };

    this.setCollectionLength = function(instanceId, val) {
        instances[instanceId].collectionLength = val;
    };
    this.getCollectionLength = function(instanceId) {
        return instances[instanceId].collectionLength;
    };

    this.setAsyncModeTrue = function(instanceId) {
        instances[instanceId].asyncMode = true;
    };

    this.isAsyncMode = function(instanceId) {
        return instances[instanceId].asyncMode;
    };
}

/**
 * This provider allows global configuration of the template path used by the dir-pagination-controls directive.
 */
function paginationTemplateProvider() {

    var templatePath = 'angularUtils.directives.dirPagination.template';

    this.setPath = function(path) {
        templatePath = path;
    };

    this.$get = function() {
        return {
            getPath: function() {
                return templatePath;
            }
        };
    };
}