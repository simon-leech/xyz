import 'leaflet-draw';

export default _xyz => (e, layer) => {

	if(!layer.edit || !layer.edit.polygon) return;

	_xyz.geom.contextmenu.close();

	_xyz.geom.contextmenu.create(e, {
		items: [{
			label: 'Edit me',
			onclick: editHandler
		},
		{
			label: 'Area',
			onlick: () => {}
		},
		{
			label: 'Perimeter',
			onclick: () => {}
		}]
	});


	function editHandler(){
		let xhr = new XMLHttpRequest();

		xhr.open('GET', 
        	_xyz.host + '/api/location/select/id?' + // this returns infoj which is not needed
        	_xyz.utils.paramString({
        		locale: _xyz.workspace.locale.key,
        		layer: layer.key,
        		table: layer.table,
        		id: e.layer.properties.id,
        		token: _xyz.token
        }));

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';

        xhr.onload = _e => {

        	if (_e.target.status !== 200) return;

        	_xyz.mapview.state = 'edit';

        	layer.edit.trail = _xyz.L.featureGroup()
        	.on('click', e => _xyz.geom.contextmenu.close())
        	.addTo(_xyz.map);

        	redrawTrail(_e.target.response.geomj);

        	_xyz.map.once('contextmenu', ev => {

        		_xyz.geom.contextmenu.close();

        		_xyz.geom.contextmenu.create(ev, {
        			items: [{
        				label: 'Save me',
        				onclick: _ev => {

        					_ev.stopPropagation();

        					layer.edit.trail.eachLayer(l => l.editing.disable());

        				    xhr = new XMLHttpRequest();

        					xhr.open('POST', _xyz.host + '/api/location/edit/mvt?' + _xyz.utils.paramString({
        						locale: _xyz.workspace.locale.key,
        						layer: layer.key,
        						table: layer.table,
        						id: e.layer.properties.id,
        						token: _xyz.token
        					}));

        					xhr.setRequestHeader('Content-Type', 'application/json');

        					xhr.onload = res => {
        						layer.edit.trail.clearLayers();
        						layer.show();
        					};

        					xhr.send(JSON.stringify(layer.edit.trail.toGeoJSON().features[0].geometry));

        					_xyz.geom.contextmenu.close();
        				}
        			},
        			{
        				label: 'Cancel me',
        				onclick: _ev => {

        					_ev.stopPropagation();
        					layer.show();
        					_xyz.geom.contextmenu.close();
        					layer.edit.trail.eachLayer(l => l.editing.disable());
        					layer.edit.trail.clearLayers();
        				}
        			}]
        		});

        	});

        }

        xhr.send();
	}

    _xyz.map.once('click', e => _xyz.geom.contextmenu.close());

    function redrawTrail(geojson){
    	let _points = _xyz.utils.turf.explode(geojson).features, points = [];

    	_points.map(feature => {
    		points.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
        });
    	
    	layer.edit.trail.clearLayers();

    	let poly = {
    		poly: {
    			allowIntersection: (layer.edit.polygon && typeof(layer.edit.polygon.allowIntersection) !== undefined ) ? layer.edit.polygon.allowIntersection : true
    		}
    	},

    	style = Object.assign({}, poly, _xyz.style.defaults.trail);

    	layer.edit.trail.addLayer(_xyz.L.polygon([points], style));

    	layer.edit.trail.eachLayer(l => {

    		l.editing.enable();

    		_xyz.map.on('draw:editvertex ', e => {

    			e.poly.intersects() ? e.poly.setStyle({color: '#DE3C4B'}) : e.poly.setStyle(style);

    		});

    	});

    }
}