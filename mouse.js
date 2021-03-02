/*
var brush = d3.svg.brush()
    .x(xScale)
    .y(yScale)
    .extent([[0, 0], [0, 0]])
    .on("brushstart", brushstart)
    .on("brushend", brushend);

function brushstart() {
    e = brush.extent();
    d3.selectAll("circle").classed("selected", function (d) {
        return isBrushed(e, xScale(d.X), yScale(d.Y));
    });
}

function brushend() {
    e = brush.extent();
    var dataIndex = new Array();
    d3.selectAll("circle").classed("selected", function (d) {
        if (isBrushed(e, xScale(d.X), yScale(d.Y))) {
            dataIndex.push(d.id);
        }
    });
    var dataInRegion = new Array();
    for (var i = 0; i < dataIndex.length; i++) {
        if (dataIndex[i] < tempN) {
            dataInRegion[i] = DM[dataIndex[i]].Ovalues;
            dataInRegion[i].Name = DM[dataIndex[i]].Name;
        }
    }
    csv2table(VName, dataInRegion, "#draw-table");

}

function isBrushed(brush_coords, cx, cy) {
    var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
}

svg.append("g")
    .attr("id", "brush-tool")
    .call(brush)
    .selectAll("rect")
    .style("fill-opacity", 0.1);
*/

function onMouseAction(_attr, lst) {

    var x = d3.scale.linear()
        .domain([0, 100])
        .range([0, width]);
    var deltaBins = 0;
    var x1 = 0, x2 = 0;
    d3.select('#barchart').on('mousedown', function () {
        var div = d3.select(this).classed('active', true);
        var w = d3.select(window)
            .on('mousemove', mousemove)
            .on('mouseup', mouseup);
        d3.event.preventDefault();
        x1 = d3.mouse(div.node());

    });

    function mousemove() {
        //console.log(d3.mouse(div.node()));
    }
    function mouseup() {
        x2 = d3.mouse(div.node());
        deltaBins = x(x1) - x(x2);
        bins += deltaBins;
        bins = (bns > 100) ? 100 : bins;
        bins = (bins < 1) ? 1 : bins;
        div.classed('active', false);
        w.on('mousemove', null).on('mouseup', null);

    }

    function update(bins) {
        var color = 'steelblue';

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

}

