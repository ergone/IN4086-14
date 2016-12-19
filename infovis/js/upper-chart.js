google.charts.load('current', {'packages':['corechart'], 'language': 'en'});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {  
  stackedbar_data = [];
  stackedbar_data.length = 0;
  stackedbar_data.push(['Sex', 'Male', 'Female']);  
  ActiveYear = $('#selectable2').val();  
  AuxIndexTable = [];
  AuxIndexTable.length = 0; 
  AuxIndex = 0;

  if ($('#selectable option:selected').text().includes("total")) {    
    for (AuxIndex; AuxIndex < AvailablePercentageSeries.length; AuxIndex++) {
      if (AvailablePercentageSeries[AuxIndex]["series_name"] === $('#selectable option:selected').text()) {
        AuxIndexTable.push(AuxIndex);
      }
    }
  }
  else {
    return;
  }

  for (value of AuxIndexTable) {
    stackedbar_data.push([AvailableNumericSeries[value]["country_code"], AvailableNumericSeries[value + 2][ActiveYear], AvailableNumericSeries[value + 1][ActiveYear]]);  
  }

  var options = {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    colors: ['#FF7800', '#00B200'],
    legend: { position: 'top', maxLines: 1 },
    titleTextStyle: { color: '#FFFFFF' },
    hAxis: { 
        showTextEvery: 1,
        slantedText: true,
        slantedTextAngle: 90,
        textStyle: { color: '#FFFFFF' }, 
        titleTextStyle: { color: '#FFFFFF' }
    },
    vAxis: {
        textStyle: { color: '#FFFFFF' },
        titleTextStyle: { color: '#FFFFFF' }
    },
    legend: {
        textStyle: { color: '#FFFFFF' }
    },    
    bar: { groupWidth: '75%' },
    isStacked: true,
  };
  
  var chart = new google.visualization.ColumnChart(document.getElementById('rc-upper-row'));
  chart.draw(google.visualization.arrayToDataTable(stackedbar_data), options);
}