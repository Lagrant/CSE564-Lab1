var mtx = {};
var id = 'vis';
var bins = 20;
var xAxisChecked = false, yAxisChecked = false;
var justClicked = {};
var xAxisName, yAxisName;
var margin = { left: 90, right: 30, top: 20, bottom: 90 };
var width;
var height;
window.onload = function () {
    width = document.getElementById(id).clientWidth;
    height = document.getElementById(id).clientHeight;
    height = height - margin.top - margin.bottom;
    width = width - margin.left - margin.right;
}

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
    if (justClicked['checked']) {
        switch (justClicked['axis']) {
            case 'x':
                xAxisName = document.getElementById('attrs').value;
                break;
            case 'y':
                yAxisName = document.getElementById('attrs').value;
                break;
        }
    } else if (xAxisChecked || yAxisChecked) {
        switch (justClicked['axis']) {
            case 'x':
                yAxisName = document.getElementById('attrs').value;
                return;
            case 'y':
                xAxisName = document.getElementById('attrs').value;
                return;
        }
    }
    if (xAxisChecked && yAxisChecked) {
        d3.select('#barchart').remove();
        d3.select('#histogram').remove();
        d3.select('#scatterplot').remove();
        drawScatterPlot(xAxisName, yAxisName);
        return;
    } else if (xAxisChecked || yAxisChecked) {
        return;
    }
    attr = sel.value;
    lst = mtx[attr];
    type = lst.type[attr];
    d3.select('#barchart').remove();
    d3.select('#histogram').remove();
    d3.select('#scatterplot').remove();
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