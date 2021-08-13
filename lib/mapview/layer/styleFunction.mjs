export default _xyz => layer => feature => {

  const properties = feature.getProperties()
  
  // Assign cluster style, to default style if size property indicates that location is a cluster.
  const style = properties.size && properties.size > 1 ?
    Object.assign({}, layer.style.default, layer.style.cluster) :
    Object.assign({}, layer.style.default)

  // The style must be cloned as icon if not otherwise defined to prevent circular reference
  style.icon = style.icon || style.marker || _xyz.utils.cloneDeep(style)

  const theme = layer.style.theme

  // Categorized theme
  if (theme && theme.type === 'categorized') {

    var catValue = properties.cat || properties[theme.field]

    var catStyle = theme.cat[catValue]?.style || theme.cat[catValue]

    if (catStyle) {

      // Assign icon style from the marker value or the clone the style object as icon if no marker or icon has been defined.
      catStyle.icon = catStyle.icon || catStyle.marker || _xyz.utils.cloneDeep(catStyle)

      _xyz.utils.merge(style, catStyle)
    }
  }

  // Graduated theme.
  if (theme && theme.type === 'graduated') {

    var catValue = parseFloat(properties.cat || properties[theme.field])

    if (catValue || catValue === 0) {

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        // Break iteration is cat value is below current cat array value.
        if (catValue < theme.cat_arr[i].value) break;
  
        // Set cat_style to current cat style after value check.
        var catStyle = theme.cat_arr[i].style || theme.cat_arr[i];
      }

      if (catStyle) {

        // Assign icon style from the marker value or the clone the style object as icon if no marker or icon has been defined.
        catStyle.icon = catStyle.icon || catStyle.marker || _xyz.utils.cloneDeep(catStyle)

        _xyz.utils.merge(style, catStyle)
      }
    }
  }


  // if (Array.isArray(style.icon.layers)) {
  //   _xyz.utils.merge(style.icon, style.icon.layers[0])
  // }

  // Set default scale if previously undefined
  // style.icon.scale = style.icon.scale || 1

  // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
  if (style.icon.clusterScale) {

    // The clusterScale will be added to the icon scale.
    style.icon.clusterScale = style.icon.logScale ?

      // A natural log will be applied to the cluster scaling.
      Math.log(style.icon.clusterScale) / Math.log(layer.max_size) * Math.log(properties.size) :

      // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
      style.icon.clusterScale / layer.max_size * properties.size
  }

  // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
  if (style.icon.zoomInScale) {

    style.icon.zoomInScale *= _xyz.mapview.getZoom()
  }

  // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
  if (style.icon.zoomOutScale) {

    style.icon.zoomOutScale /= _xyz.mapview.getZoom()
  }

  // Apply highlight style to features which are highlighted.
  if (layer.highlight === feature.get('id')){

    const highlightStyle = _xyz.utils.cloneDeep(layer.style.highlight)

    // The highlightStyle must be cloned as icon if not otherwise defined to prevent circular reference
    highlightStyle.icon = highlightStyle.icon || highlightStyle.marker || _xyz.utils.cloneDeep(highlightStyle)

    style.icon.highlightScale = highlightStyle.icon.scale || 1

    // Remove scales to prevent assignment of highlight scale to the icon's base scale
    delete highlightStyle.icon?.scale
    delete highlightStyle.scale

    _xyz.utils.merge(style, highlightStyle)
  }

  return _xyz.utils.style(style)
}