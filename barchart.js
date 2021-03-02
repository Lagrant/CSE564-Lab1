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
        .attr('id', 'barchart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var catArray = [];
    for (let i in cats) {
        catArray.push({ 'cat': i, 'value': cats[i] });
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
