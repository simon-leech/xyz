mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_zoom_to_extent: 'Zoom to filtered layer extent',
    layer_visibility: 'Toggle visibility',
    zoom_to: 'Zoom to',
  },
  de: {
    layer_zoom_to_extent: 'Zoom zum Ausmaß des gefilterten Datensatzes',
    layer_visibility: 'Umschalten der Ansicht',
    zoom_to: 'Heranzoomen',
  },
  zn: {
    layer_zoom_to_extent: '缩放至筛选图层的相应范围',
    layer_visibility: '可见性切换',
    zoom_to: '缩放至',
  },
  zn_tw: {
    layer_zoom_to_extent: '縮放至篩選圖層的相應範圍',
    layer_visibility: '可見性切換',
    zoom_to: '縮放至',
  },
  pl: {
    layer_zoom_to_extent: 'Przybliż do odfiltrowanej wastwy',
    layer_visibility: 'Zmodyfikuj widzialność',
    zoom_to: 'Przybliż do',
  },
  fr: {
    layer_zoom_to_extent: 'Zoom sur la couche filtrée',
    layer_visibility: 'Modifier la visibilité',
    zoom_to: 'Zoom sur',
  },
  ja: {
    layer_zoom_to_extent: 'フィルターされたレイヤー範囲をズームに',
    layer_visibility: '表示切替',
    zoom_to: 'ズームへ',
  },
  es: {
    layer_zoom_to_extent: 'Zoom a capa filtrada',
    layer_visibility: 'Alternar visibilidad',
    zoom_to: 'Acercar a',
  },
  tr: {
    layer_zoom_to_extent: 'Filtrelenmis katman kapsamina yaklas',
    layer_visibility: 'Gorunurlugu degistir',
    zoom_to: 'Yaklas',
  },
  it: {
    layer_zoom_to_extent: 'Zoom sul layer',
    layer_visibility: 'Attiva/Disattiva visibilità',
    zoom_to: 'Zoom a',
  }
})

export default (layer) => {

  if (layer.view === null) {

    // Do not create a layer view.
    return layer;
  }

  layer.view = mapp.utils.html.node`<div class="layer-view">`

  // Create content from layer view panels and plugins
  const content = Object.keys(layer)
    .map(key => mapp.ui.layers.panels[key] && mapp.ui.layers.panels[key](layer))
    .filter(panel => typeof panel !== 'undefined')

  // Set default order for panel if not explicit in layer config.
  layer.panelOrder = layer.panelOrder || ['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta']

  content.sort((a, b) => {

    // Sort according to data-id in panelOrder array.
    return layer.panelOrder.findIndex(chk => chk === a.dataset?.id)
      < layer.panelOrder.findIndex(chk => chk === b.dataset?.id)
      ? 1 : -1;
  })

  if (layer.drawer !== null) {

    const zoomToExtent = layer.filter.zoomToExtent && mapp.utils.html`
      <button
        data-id=zoomToExtent
        title=${mapp.dictionary.layer_zoom_to_extent}
        class="mask-icon fullscreen"
        onclick=${async e => {

        // response indicates whether locations were found.
        let response = await layer.zoomToExtent()

        // disable button if no locations were found.
        e.target.disabled = !response
      }}>` || ``

    // Create toggleDisplay button for header.
    const toggleDisplay = mapp.utils.html.node`
      <button
        data-id=display-toggle
        title=${mapp.dictionary.layer_visibility}
        class="${`mask-icon toggle ${layer.display && 'on' || 'off'}`}"
        onclick=${e => layer.display ? layer.hide() : layer.show()}>`

    // Add on callback for toggle button.
    layer.showCallbacks.push(() => {
      toggleDisplay.classList.add('on')
    })

    // Remove on callback for toggle button.
    layer.hideCallbacks.push(() => {
      toggleDisplay.classList.remove('on')
    })

    const header = mapp.utils.html`
      <h2>${layer.name || layer.key}</h2>
      ${zoomToExtent}
      ${toggleDisplay}
      <div class="mask-icon expander"></div>`

    // Create layer drawer node.
    layer.drawer = mapp.ui.elements.drawer({
      data_id: `layer-drawer`,
      class: `layer-view raised ${layer.classList || ''} ${content.length ? '' : 'empty'}`,
      header: header,
      content: content
    })

    // Render layer.drawer into layer.view
    mapp.utils.render(layer.view, layer.drawer)

  } else {

    // Append elements directly to layer.view
    content.forEach(el => layer.view.append(el))
  }

  // Create a div for the magnifying glass icon
  const zoomButton = mapp.utils.html.node`<button class="mask-icon search" title="${mapp.dictionary.zoom_to}" data-id="zoom-to">`
  
  // Add an event listener to the magnifying glass icon to show the zoom level button when clicked
  zoomButton.addEventListener('click', () => {

    // Zoom to the extent of the layer if table provided. 
    if (layer.tableCurrent() !== null) {
      layer.zoomToExtent();
      layer.show();
    };

    // Zoom to the zoom level if tables object. 
    for (const key in layer.tables) {
      if (layer.tables[key] !== null) {
        layer.mapview.Map.getView().setZoom(key);
        layer.show();
      }
    }
  });

  // Add the zoom Button before the layer toggle.
  layer.view.querySelector('[data-id=display-toggle]').before(zoomButton)

  // The layer view drawer should be disabled if layer.tables are not available for the current zoom level.
  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {

    if (!layer.tables) return;

    if (layer.tableCurrent() === null) {

      // The layer should be set to display false, as it is not available at the current zoom level.
      layer.display = false;
      // Collapse drawer and disable layer.view.
      layer.view.querySelector('[data-id=layer-drawer]').classList.remove('expanded')

      // Remove the active state from the layer view toggle button.
      layer.view.querySelector('[data-id=display-toggle]').classList.remove('on')
      // Set the layer toggle button to disabled.
      layer.view.querySelector('[data-id=display-toggle]').classList.add('disabled')

    } else {
      // Set the layer toggle button to enabled.
      layer.view.querySelector('[data-id=display-toggle]').classList.remove('disabled')
    }

  })

  return layer
}