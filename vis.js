var mtx = {};
var id = 'vis';
var width = document.getElementById(id).clientWidth;
var height = document.getElementById(id).clientHeight;
var margin = { left: 40, right: 30, top: 20, bottom: 40 };
height = height - margin.top - margin.bottom;
width = width - margin.left - margin.right;
var bins = 20;

var readFile = function (ele) {
    try {
        var file = ele.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(file, 'utf-8');
        reader.onload = function (evt) {
            getContent(evt.target.result);
        };
        reader.onerror = function (evt) {
            alert('Error in reading file');
        }
    } catch (Exception) {
        var fallBack = ieReadFile(ele.value);
        if (fallBack) {
            getContent(fallBack);
        } else {
            alert('Unable to read file');
        }
    }
}

///Reading files with Internet Explorer
function ieReadFile(filename) {
    try {
        var fso = new ActiveXObject('Scripting.FileSystemObject');
        var fh = fso.OpenTextFile(filename, 1);
        var contents = fh.ReadAll();
        fh.Close();
        return contents;
    } catch (Exception) {
        alert(Exception);
        return false;
    }
}

var getContent = function (content) {

    function buildDataMatrix(data) {
        if (d3.keys(mtx).length === 0) {
            d3.keys(data).forEach(function (d) {
                mtx[d] = new Array();
            });
        }
        for (i in data) {
            k = parseFloat(data[i]);
            if (isNaN(k)) {
                mtx[i].push(data[i]);
            } else {
                mtx[i].push(k);
            }
        }
    }

    mtx = {};
    d3.csv.parse(content, buildDataMatrix);
    for (i in mtx) {
        if (mtx[i].__proto__.type === undefined) {
            mtx[i].__proto__.type = {};
        }
        if (isNaN(mtx[i][0])) {
            mtx[i].__proto__.type[i] = 'categorical';
        } else {
            mtx[i].__proto__.type[i] = 'numerical'
        }
    }
    initMenu(d3.keys(mtx));
}

function initMenu(headers) {
    sel = d3.select('#attrs');
    headers.forEach(function (d) {
        sel.append('option')
            .attr('value', d)
            .text(d);
    })
}

function drawChart(sel) {
    attr = sel.value;
    lst = mtx[attr];
    type = lst.type[attr];
    d3.select('#chart').remove();
    switch (type) {
        case 'categorical':
            drawBarChart(attr, lst);
            break;
        case 'numerical':
            drawHistogram(attr, lst);
            break;
        default:
            alert('Unknown data type');
            return;
    }
}
function forCity(cats, k) {
    if (k > 2) {
        return cats;
    }
    var ncats = {};
    var count = 0;
    for (let i in cats) {
        if (cats[i] > k) {
            ncats[i] = cats[i];
        } else {
            count++;
        }
    }
    ncats = forCity(ncats, k + 1);
    ncats['others' + count.toString()] = k;
    return ncats;
}

var drawBarChart = function (_attr, lst) {
    
    var color = d3.scale.category20();

    var cats = {};
    lst.forEach(function (d) {
        if (cats[d] === undefined) {
            cats[d] = 1;
        } else {
            cats[d]++;
        }
    });
    if (_attr === 'city') {
        cats = forCity(cats, 1);
    }
    var x = d3.scale.ordinal()
        .domain(d3.keys(cats))
        .rangeRoundBands([0, width], 0.02);

    var y = d3.scale.linear()
        .domain([0, d3.max(d3.values(cats))])
        .range([height, 0]);

    var svg = d3.select('#' + id).append('svg')
        .attr('id', 'histogram')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var catArray = [];
    for (let i in cats) {
        catArray.push({ 'cat': i, 'value':cats[i] });
    }
    var bar = svg.selectAll('.bar')
        .data(catArray)
        .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function (d, i) { return 'translate(' + x(d.cat) + ',' + y(d.value) + ')'; });

        bar.append('rect')
        .attr('class', 'bar')
        .attr('x', 1)
        .attr('width', x.rangeBand())
        .attr('height', function (d) { return height - y(d.value); })
        .attr('fill', function (d) { return color(d.cat) })
        .on('mouseover', function (d) {
            d3.select(this)
                .attr('fill', 'rgba(255,0,0,0.5)');
            barValue = this.parentElement.lastElementChild;
            d3.select(barValue)
                .style('display', 'block');
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('fill', function (d) { return color(d.cat) });
            barValue = this.parentElement.lastElementChild;
            d3.select(barValue)
                .style('display', 'none');
        });

    bar.append('text')
        .attr('class', 'bar-value')
        .attr('dy', '.75em')
        .attr('y', -15)
        .attr('x', x.rangeBand() / 2)
        .attr('text-anchor', 'middle')
        .style('display', 'none')
        .text(function (d) { return d.value });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start")
        //.text(function (d) {
        //    return d.length > 7 ? d.substring(0, 7) + "..." : d;
        //});

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width + 30)
        .attr('y', height + 35)
        .text(_attr);

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(yAxis);

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', 0)
        .attr('y', -5)
        .text('sum');
}

var drawHistogram = function (_attr, lst) {
    
    var color = 'steelblue';
    //var formatter = d3.format(',.00f');

    var max = d3.max(lst);
    var min = d3.min(lst);
    var x = d3.scale.linear()
        .domain([min, max])
        .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(bins))
        (lst);

    var yMax = d3.max(data, function (d) { return d.length });
    var yMin = d3.min(data, function (d) { return d.length });
    var colorScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

    var xTick = data.map(function (d) {
        return d.x + d.dx / 2;
    });

    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickValues(xTick)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var svg = d3.select('#' + id).append('svg')
        .attr('id', 'barchart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var bar = svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

    bar.append('rect')
        .attr('x', 1 )
        .attr('width', (x(data[0].dx) - x(0)) - 1)
        .attr('height', function (d) { return height - y(d.y); })
        .attr('fill', function (d) { return colorScale(d.y) })
        .on('mouseover', function (d) {
            d3.select(this)
                .attr('fill', 'red');
            barValue = this.parentElement.lastElementChild;
            d3.select(barValue)
                .style('display', 'block');
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('fill', function (d) { return colorScale(d.y) });
            barValue = this.parentElement.lastElementChild;
            d3.select(barValue)
                .style('display', 'none');
        });

    bar.append('text')
        .attr('class', 'bar-value')
        .attr('dy', '.75em')
        .attr('y', -15)
        .attr('x', (x(data[0].dx) - x(0)) / 2)
        .attr('text-anchor', 'middle')
        .style('display', 'none')
        .text(function (d) { return d.y });

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
        //.selectAll('text')
        //.style('text-anchor', 'middle');

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(yAxis);

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width + 30)
        .attr('y', height + 35)
        .text(_attr);

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', 0)
        .attr('y', -5)
        .text('sum')
        .attr('text-anchor', 'start');
}