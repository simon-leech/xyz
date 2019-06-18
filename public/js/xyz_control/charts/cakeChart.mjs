export default _xyz => entry => {

	const graph = _xyz.utils.createElement({
		tag: 'div',
		style: {
			position: 'relative'
		}
	});

	const canvas = _xyz.utils.createElement({
		tag: 'canvas',
		options: {
			height: entry.chart.height || undefined
		},
		appendTo: graph
	});

	const labels = entry.fields.map(field => field.label);

	const data = entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value));

	const displayValues = entry.fields.map(field => field.displayValue);

	let datasets = [];

	if(entry.chart.excludeNull) data.map(item => {if(!item) labels.splice(data.indexOf(item), 1) });

	datasets[0] = {
      label: entry.label,
      backgroundColor: entry.chart.backgroundColor || '#cf9',
      borderColor: entry.chart.borderColor || '#079e00',
      data: entry.chart.excludeNull ? data.filter(item => {return item != null}) : data
    };

    new _xyz.Chart(canvas, {
    	type: entry.chart.type,
    	data: {
    		labels: labels,
    		datasets: datasets  		
    	},
    	options: {
    		cutoutPercentage: entry.chart.cutoutPercentage || 50,
    		title: {
    			display: entry.chart.title || true,
    			position: 'bottom',
    			text: entry.label
    		},
    		responsive: true,
    		legend: {
    			display: entry.chart.legend
    		},
    		scales: {
    			yAxes: [],
    			xAxes: []
    		},
    		tooltips: {
    			mode: 'index',
    			xAlign: entry.chart.xAlign || null,
    			yAlign: entry.chart.yAlign || null,
    			callbacks: {
    				title: () => ''
    			}
    		}
    	}
    });

    return graph;

}