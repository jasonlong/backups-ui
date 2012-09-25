var COLORS             = [ "#171717", // background
                           "#2cbc26", // good - green
                           "#fbbe16", // warning - yellow
                           "#fe3a15", // critical - red
                         ],
    WARNING_THRESHOLD  = 90,
    CRITICAL_THRESHOLD = 95;

$(document).ready(function() {
  renderOverviewChart();
  renderDonutCharts();
});

$(window).resize(function() {
  renderDonutCharts();
});

function renderOverviewChart() {
  var totalFillPercentage = $('#space-overview .bar').data('fill-percentage');
  if (totalFillPercentage >= CRITICAL_THRESHOLD) {
    $('#space-overview').addClass('critical');
  }
  else if (totalFillPercentage >= WARNING_THRESHOLD) {
    $('#space-overview').addClass('warning');
  }
  $('#space-overview .bar').width(totalFillPercentage + '%');
  $('#space-overview .details').css('right', 100 - totalFillPercentage + '%');
}

function renderDonutCharts() {
  $('svg').remove(); // start clean on redraws

  var totalServers         = $('ul#servers>li').length,
      chartContainerWidth  = $('ul#servers').width(),
      chartSize            = calculateChartSize(),
      chartRadius          = chartSize / 2;

  setServerColumnSize(totalServers);

  $('ul#servers ul li').each(function(){

    var partitionName = $(this).data('partition-name'),
        percentFull   = $(this).data('fill-percentage'),
        donut         = d3.layout.pie().sort(null),
        arc           = d3.svg.arc().innerRadius(chartRadius - (chartRadius * .4))
                                    .outerRadius(chartRadius - (chartRadius * .01));

    var svg = d3.select(this).append("svg:svg")
                .attr("width", chartSize)
                .attr("height", chartSize)
                .append("svg:g")
                .attr("transform",
                      "translate(" + (chartSize / 2) + "," + chartSize / 2 + ")");

    var arcs = svg.selectAll("path")
                  .data(donut([percentFull, 100 - percentFull]))
                  .enter().append("svg:path")
                  .attr("fill", function(d, i) {
                    if (i === 1) {
                      color = COLORS[0];
                    }
                    else if (percentFull >= CRITICAL_THRESHOLD) {
                      color = COLORS[3];
                    }
                    else if (percentFull >= WARNING_THRESHOLD) {
                      color = COLORS[2];
                    }
                    else color = COLORS[1];
                    return color; })
                  .attr("d", arc);

    var label = svg.selectAll("text")
                    .data(donut([percentFull, 100 - percentFull]))
                    .enter().append("text")
                    .attr("y", function(d) {
                      return chartRadius - (chartRadius * .85);
                    })
                    .attr("font-size", function(d) {
                      return chartRadius - (chartRadius * .5);
                    })
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .text(partitionName);
  });
}

function setServerColumnSize(numServers) {
  $('ul#servers>li').each(function(){
    $(this).css('width', (100 / numServers) + '%');
  });
}

function calculateChartSize() {
  var maxNumberOfPartitions = getMaxNumberOfPartitions(),
      viewportHeight        = $(document).height(),
      chartContainerHeight  = viewportHeight
                                - $('ul#servers li:first-child ul').offset().top
                                - (viewportHeight * 0.02),
      usableVerticalHeight  = chartContainerHeight
                                - ((maxNumberOfPartitions) * 0.05 * chartContainerHeight);


  return Math.min(
            (usableVerticalHeight / maxNumberOfPartitions),
            $('ul#servers>li:first-child').width()
         );
}

function getMaxNumberOfPartitions() {
  var maxNumberOfPartitions = 0;

  $('ul#servers>li').each(function(){
    var numPartitions = $(this).find('ul li').length;
    if (numPartitions > maxNumberOfPartitions) {
      maxNumberOfPartitions = numPartitions;
    }
  });
  return maxNumberOfPartitions;
}