function adjustNumStitchesRow(n) {
    $("#numStitchesRow").val(parseInt($("#numStitchesRow").val()) + n);
    draw();
}

function chunkArray(array, chunk) {
    var i,j;
    var chunkList = [];
    for (i=0,j=array.length; i<j; i+=chunk) {
        chunkList.push(array.slice(i,i+chunk));
    }
    return chunkList;
}

function backAndForthIfy(array, rowLength) {
    var chunkList = chunkArray(array, rowLength);
    var newChunkList = d3.range(chunkList.length).map(function(i) {
        if (i % 2 == 0) {return chunkList[i];}
        else {return chunkList[i].reverse();}
    })
    return [].concat.apply([], newChunkList);
}

function rep(arr, count) {
    var ln = arr.length;
    var b = new Array();
    for (i = 0; i < count; i++) {
        b.push(arr[i % ln]);
    }

    return b;
}

//http://stackoverflow.com/questions/6798715/create-a-square-of-colors-with-jquery-or-javascript
function draw() {
    $("#canvas").remove()

    var bigWidthInPixels = 500;
    var unitsWide = parseInt($("#numStitchesRow").val());
    state.unitsWide = unitsWide
    var unitsTall = unitsWide;

    var totalSize = unitsWide * unitsTall;

    var colorChoices = d3.range(1,state.nColors+1).map(function(i) {return "#" + $("#color"+i).val();})
    var numStitchesChoices = d3.range(1,state.nColors+1).map(function(i) {return parseInt($("#numStitches" + i).val());})
    state.colorChoices = colorChoices
    state.numStitchesChoices = numStitchesChoices

    var colorsList = d3.range(state.nColors).map(function(i) {return rep([colorChoices[i]], numStitchesChoices[i]);});
    var colors = rep([].concat.apply([], colorsList), totalSize);

    if ($("#typeOfKnitting").val() == "flat") {
        colors = backAndForthIfy(colors, unitsWide);
    }

    saveState()
    makeRectanglesCanvas(colors, unitsWide, unitsTall, bigWidthInPixels);
};

function makeRectanglesCanvas(colors, unitsWide, unitsTall, bigWidthInPixels) {
    var unitSizeInPixels = bigWidthInPixels/unitsWide;
    var canvas = document.createElement('canvas');
    canvas.id = "canvas";
    canvas.width = bigWidthInPixels;
    canvas.height = bigWidthInPixels;
    $("#canvasDiv").append(canvas);
    var ctx = $("#canvas")[0].getContext('2d');

    var colors2d = chunkArray(colors, unitsWide);

    for (var i=0; i<unitsTall; i++){
      for (var j=0; j<unitsWide; j++){
        ctx.fillStyle = colors2d[i][j];
        ctx.strokeStyle = colors2d[i][j];

        ctx.fillRect( j*unitSizeInPixels, i*unitSizeInPixels, unitSizeInPixels + .5, unitSizeInPixels + .5);
      }
    }
}

function removeAColor() {
    $("#trColor" + state.nColors).remove();
    state.nColors -= 1;
    draw();
    if (state.nColors==1) $("#removeAColor").removeAttr('href');
}

function addAColor() {
    state.nColors += 1;
    addColorN(state.nColors, "F4D2C3", 5)
    $('input').change(draw);
    draw();
}

function addColorN(n, color, numStitches) {
    $("#colorChooser").append( ' \
    <tr id="trColor' + n + '">\
        <td>\
            <div>\
                <label>Color ' + n + '</label>:\
                <input id="color' + n + '" type="color {pickerPosition:&#39;right&#39;}" class="color {pickerPosition:&#39;right&#39;}" value="' + color + '" />\
            </div>\
        </td>\
        <td>\
            <div>\
                <label>Stitches in color ' + n + '</label>:\
                <input type="text" value="' + numStitches + '" id="numStitches' + n + '" />\
            </div>\
        </td>\
    </tr>\
        ' );
    var col = new jscolor.color($("#color" + n)[0]);
    $("#removeAColor").attr("href", "javascript: removeAColor()")
    $('input').change(draw);

}

function saveState() {
    window.location.hash = JSON.stringify(state)
}

if (window.location.hash) {
    state = JSON.parse(decodeURI(window.location.hash.slice(1)))
} else {
    state = {nColors: 2, colorChoices: ["#F1D1C3", "#A6F4C0"], numStitchesChoices: [19, 10], unitsWide: 18}
}

$("#numStitchesRow").val(state.unitsWide)

for(var iii=0;iii<state.nColors;iii++){
  addColorN(iii+1, state.colorChoices[iii], state.numStitchesChoices[iii]);
}

$( document ).ready(draw);
$('input').change(draw);
$('select').change(draw);

setTimeout(draw, 10) // hack: in Chrome the imnage wasn't showing on initial page load until double clicking or scrolling. this seems to fix
