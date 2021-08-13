import Chroma from 'chroma-js'

import cloneDeep from 'lodash/cloneDeep.js'

const memoizedStyles = new Map()

export function style(params) {

  const styleStr = JSON.stringify(params)

  if (memoizedStyles.has(styleStr)) return memoizedStyles.get(styleStr)

  if (Array.isArray(params.icon?.layers)) {

    params = params.icon.layers.map(layer => {

      let paramsClone = cloneDeep(params)
      Object.assign(paramsClone.icon, layer)

      return paramsClone
    })
  }

  const olStyle = Array.isArray(params)
    && params.map(getOlStyle)
    || getOlStyle(params)

  memoizedStyles.set(styleStr, olStyle)
  
  return olStyle
}

function getOlStyle (params) {

  params.fill = params.fillColor && new ol.style.Fill({
    color: Chroma(params.fillColor)
      .alpha(params.fillOpacity === 0 ? 0 : parseFloat(params.fillOpacity || 1))
      .rgba()
  })

  params.stroke = params.strokeColor && new ol.style.Stroke({
    color: Chroma(params.strokeColor)
      .alpha(parseFloat(params.strokeOpacity || 1))
      .rgba(),
    width: parseFloat(params.strokeWidth || 1)
  })

  params.image = icon(params)

  // params.text = params.label && new ol.style.Text({
  //   font: '12px sans-serif',
  //   text: params.label,
  //   stroke: new ol.style.Stroke({
  //     color: '#000',
  //     width: 1
  //   }),
  //   fill: new ol.style.Fill({
  //     color: '#000'
  //   })
  // })

  return new ol.style.Style(params)
}

import svg_symbols from './svg_symbols.mjs'

const memoizedIcons = new Map()

function icon(params) {

  const icon = params.icon || params.marker

  if (!icon) return;

  // Calculate scale for icon render
  let scale = icon.scale || 1
  scale += icon.clusterScale || 0
  scale *= icon.zoomInScale || 1
  scale *= icon.zoomOutScale || 1
  scale *= icon.highlightScale || 1

  // Remove scales for memoization
  delete icon.scale
  delete icon.clusterScale
  delete icon.zoomInScale
  delete icon.zoomOutScale
  delete icon.highlightScale

  // Stringify icon for memoization
  const iconStr = JSON.stringify(icon)

  // Check memoization
  if (memoizedIcons.has(iconStr)) {
    
    icon.url = memoizedIcons.get(iconStr)

  } else {

    // Create icon url from svg_symbols method if not defined as url or svg source
    icon.url = icon.url || icon.svg || svg_symbols(icon)

    memoizedIcons.set(iconStr, icon.url)
  }

  return new ol.style.Icon({
    src: icon.url,
    scale: scale,
    anchor: icon.anchor || [0.5, 0.5],
  })

}