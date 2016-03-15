google.charts.load('current', {'packages':['bar']});
google.charts.setOnLoadCallback(drawStuff);

function drawStuff() {
  var data = {{data|safe}};
  console.log(data);
  var dataTable = new google.visualization.arrayToDataTable(data);

  var options = {
    width: 600,
    chartArea: {width: '100%', height: '50%'},
    hAxis: {title: 'Age', titleTextStyle: {color: 'red'}},
    chart: {
      title: 'Animal Outcomes based on Age at Arrival',
      subtitle: 'distance on the left, brightness on the right'
    },
    series: {
      0: { axis: 'adopted' }, // Bind series 0 to an axis named 'distance'.
      1: { axis: 'euthanized' } // Bind series 1 to an axis named 'brightness'.
    },
    axes: {
      y: {
        adopted: {label: 'number of animals'}, // Left y-axis.
        euthanized: {side: 'right', label: 'number of animals'} // Right y-axis.
      }
    }
  };

var chart = new google.charts.Bar(document.getElementById('dual_y_div'));
chart.draw(dataTable, options);
};