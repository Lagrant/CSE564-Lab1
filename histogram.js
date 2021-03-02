var drawHistogram = function (_attr, lst) {

    var color = 'steelblue';

    var xMax = d3.max(lst);
    var xMin = d3.min(lst);
    var x = d3.scale.linear()
        .domain([xMin, xMax])
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
        .attr('id', 'histogram')
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
        .attr('x', 1)
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
        .call(xAxis)
        .selectAll('text')
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");
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
        .text('freq')
        .attr('text-anchor', 'start');

    d3.select('#histogram').on('mousedown', function () {
        var x1 = 0, x2 = 0;
        var div = d3.select(this).classed('active', true);
        var w = d3.select(window)
            .on('mouseup', mouseup);
        d3.event.preventDefault();
        x1 = d3.mouse(div.node());

        function mouseup() {
            div.classed('active', false);
            w.on('mousemove', null).on('mouseup', null);
            x2 = d3.mouse(div.node());
            updateHis([x1[0], x2[0]]);
        }
    });



    var idleTimeout
    function idled() { idleTimeout = null; }

    var candiBins = [3, 7, 15, 37, 74]
    var pivot = 2;
    function updateHis(extent) {
        var maxBins = 80;

        pivot = (extent[1] - extent[0] > 0) ? pivot + 1 : pivot - 1;
        pivot = (pivot >= candiBins.length) ? candiBins.length - 1 : pivot;
        pivot = (pivot < 0) ? 0 : pivot;
        bins = candiBins[pivot];
       
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

        svg.selectAll('.bar').remove();

        var bar = svg.selectAll('.bar')
            .data(data)
            .enter().append('g')
            .attr('class', 'bar')
            .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

        bar.append('rect')
            .attr('x', 1)
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
        
        svg.selectAll(".x")
            .transition().duration(1000)
            .call(d3.svg.axis()
                .scale(x)
                .tickValues(xTick)
                .orient("bottom"))
            .selectAll('text')
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        svg.selectAll(".y")
            .transition().duration(1000)
            .call(d3.svg.axis()
                .scale(y)
                .orient("left"));

        bar.selectAll("rect")
            .transition().duration(1000)
            .attr('x', 1)
            .attr('width', (x(data[0].dx) - x(0)) - 1)
            .attr('height', function (d) { return height - y(d.y); })
            .attr('fill', function (d) { return colorScale(d.y) });

        bar.selectAll('text')
            .transition().duration(1000)
            .attr('x', (x(data[0].dx) - x(0)) / 2);
    }


}