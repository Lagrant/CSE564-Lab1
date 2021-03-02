var chooseX = function (ob) {
    xAxisChecked = ob.checked;
    justClicked['checked'] = xAxisChecked;
    justClicked['axis'] = 'x';
}

var chooseY = function (ob) {
    yAxisChecked = ob.checked;
    justClicked['checked'] = yAxisChecked;
    justClicked['axis'] = 'y';
}

function drawScatterPlot(xAxisName, yAxisName) {
    xLst = mtx[xAxisName];
    yLst = mtx[yAxisName];
    xType = xLst.type[xAxisName];
    yType = yLst.type[yAxisName];
    d3.select('#barchart').remove();
    d3.select('#histogram').remove();

    var svg = d3.select('#' + id).append('svg')
        .attr('id', 'scatterplot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    if (xType === 'numerical' && yType === 'numerical') {
        numScatterPlot();
    } else if (xType === 'categorical' && yType === 'categorical') {
        catScatterPlot();
    } else {
        numCatScatterPlot();
    }

    function numScatterPlot() {
        var data = [];
        xLst.forEach(function (d, i) {
            data.push([d, yLst[i]]);
        });

        var xMax = d3.max(xLst);
        var x = d3.scale.linear()
            .domain([0, xMax])
            .range([0, width]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
            .selectAll('text')
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        var yMax = d3.max(yLst);
        var y = d3.scale.linear()
            .domain([0, yMax])
            .range([height, 0]);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', width + 30)
            .attr('y', height + 35)
            .text(xAxisName);

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', 0)
            .attr('y', -5)
            .text(yAxisName)
            .attr('text-anchor', 'start');

        svg.append('g')
            .selectAll('dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', function (d) { return x(d[0]); })
            .attr('cy', function (d) { return y(d[1]); })
            .attr('r', 3)
            .style('fill', '#69b3a2')
    }

    function numCatScatterPlot() {
        if (xType === 'numerical') {
            var xMax = d3.max(xLst);
            var x = d3.scale.linear()
                .domain([0, xMax])
                .range([0, width]);

            var yCat = {};
            yLst.forEach(function (d) {
                if (yCat[d] === undefined) {
                    yCat[d] = 1;
                } else {
                    yCat[d]++;
                }
            });
            var y = d3.scale.ordinal()
                .domain(d3.keys(yCat))
                .rangeRoundBands([height, 0], 0.02);
        } else {
            var xCat = {};
            xLst.forEach(function (d) {
                if (xCat[d] === undefined) {
                    xCat[d] = 1;
                } else {
                    xCat[d]++;
                }
            });
            var x = d3.scale.ordinal()
                .domain(d3.keys(xCat))
                .rangeRoundBands([height, 0], 0.02);

            var yMax = d3.max(yLst);
            var y = d3.scale.linear()
                .domain([0, yMax])
                .range([0, width]);
        }

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
            .selectAll('text')
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', width + 30)
            .attr('y', height + 35)
            .text(xAxisName);

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', 0)
            .attr('y', -5)
            .text(yAxisName)
            .attr('text-anchor', 'start');

        var points = [];
        if (xType === 'numerical') {
            xLst.forEach(function (d, i) {
                points.push([x(d), y(yLst[i]) + y.rangeBand() / 2]);
            });
        } else {
            xLst.forEach(function (d, i) {
                points.push([x(d) + x.rangeBand() / 2, y(yLst[i])]);
            })
        }
        svg.append('g')
            .selectAll('dot')
            .data(points)
            .enter()
            .append('circle')
            .attr('cx', function (d) {
                return d[0];
            })
            .attr('cy', function (d) {
                return d[1];
            })
            .attr('r', function (d) {
                return 3;
            })
            .style('fill', '#69b3a2')
    }

    function catScatterPlot() {

        var nums = {};
        xLst.forEach(function (d, i) {
            if (nums[d] === undefined) {
                nums[d] = {};
            }
            if (nums[d][yLst[i]] === undefined) {
                nums[d][yLst[i]] = 1;
            } else {
                nums[d][yLst[i]]++;
            }
        });
        var points = [];
        var _max = 0;
        for (let i in nums) {
            for (let j in nums[i]) {
                if (nums[i][j] > _max) {
                    _max = nums[i][j];
                }
                points.push([i, j, nums[i][j]]);
            }
        }
        points.forEach(function (d) {
            d[2] /= _max;
            if (d[2] < 0.1) {
                d[2] = 0.1;
            }
        });
        
        var xCat = {}, yCat = {};
        xLst.forEach(function (d) {
            if (xCat[d] === undefined) {
                xCat[d] = 1;
            } else {
                xCat[d]++;
            }
        });
        yLst.forEach(function (d) {
            if (yCat[d] === undefined) {
                yCat[d] = 1;
            } else {
                yCat[d]++;
            }
        });

        
        var x = d3.scale.ordinal()
            .domain(d3.keys(xCat))
            .rangeRoundBands([0, width], 0.02);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
            .selectAll('text')
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        var y = d3.scale.ordinal()
            .domain(d3.keys(yCat))
            .rangeRoundBands([height, 0], 0.02);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', width + 30)
            .attr('y', height + 35)
            .text(xAxisName);

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', 0)
            .attr('y', -5)
            .text(yAxisName)
            .attr('text-anchor', 'start');

        svg.append('g')
            .selectAll('dot')
            .data(points)
            .enter()
            .append('circle')
            .attr('cx', function (d) {
                return x(d[0]) + x.rangeBand() / 2;
            })
            .attr('cy', function (d) {
                return y(d[1]) + y.rangeBand() / 2;
            })
            .attr('r', function (d) {
                return 30 * d[2];
            })
            .style('fill', '#69b3a2')
    }


}