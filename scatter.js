var chooseX = function (ob) {
    pickX = xAxisChecked = ob.checked;
}

var chooseY = function (ob) {
    pickY = yAxisChecked = ob.checked;
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
            .call(xAxis);

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

    function catScatterPlot() {

        var nums = {};
        data.forEach(function (d) {
            if (nums[d[0]] === undefined) {
                nums[d[0]] = {};
            }
            if (nums[d[0]][d[1]] === undefined) {
                nums[d[0]][d[1]] = 1;
            } else {
                nums[d[0]][d[1]]++;
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
        var data = [];
        xLst.forEach(function (d, i) {
            data.push([d, yLst[i]]);
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
        var xTick = d3.keys(xCat).map(function (d) {
            return x(d);
        })
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        var y = d3.scale.ordinal()
            .domain(d3.keys(yCat))
            .rangeRoundBands([height, 0], 0.02);
        var yTick = d3.keys(yCat).map(function (d) {
            return y(d);
        })
        var yAxis = d3.svg.axis()
            .scale(y)
            //.tickValues(yTick)
            .orient('left');
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

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