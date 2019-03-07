export default (_xyz, layer) => {

  layer.focus = _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'aspect_ratio',
      className: 'material-icons cursor noselect btn_header',
      title: 'Zoom to layer extent'
    },
    appendTo: layer.header,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();

        // Request to get the extent of layer data.
        const xhr = new XMLHttpRequest();

        // Create filter from legend and current filter.
        const filter = Object.assign({}, layer.filter.legend, layer.filter.current);
    
        xhr.open('GET', _xyz.host + '/api/layer/extent?' + _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          filter: JSON.stringify(filter),
          token: _xyz.token
        }));

        xhr.onload = e => {
          if (e.target.status !== 200) return;

          // Show the layer on map.
          layer.show();

          // Split the bounds from response.
          let bounds = e.target.responseText.split(',');
        
          // Fly to the bounds.
          _xyz.map.flyToBounds([[
            parseFloat(bounds[1]), //south
            parseFloat(bounds[0])  //west
          ], [
            parseFloat(bounds[3]), //north
            parseFloat(bounds[2])  //east
          ]]);
        };

        xhr.send();
      }
    }
  });
  
};