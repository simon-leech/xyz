
/**
## ui/locations/entries/vector_layer

The vector_layer entry module exports a default [location] entry method to process infoj `type:vector_layer` entries.

@module /ui/locations/entries/vector_layer
*/

/**
mapp.ui.locations.entries.vector_layer(entry)

The method processes a vector_layer entry and returns a panel node to the location view.
The vector_layer entry generates a checkbox to control the display of a vector layer on the map.
@example
```json
{
      "key": "nearest_to",
      "label": "Nearest to",
      "type": "vector_layer",
      "format": "wkt",
      "srid": "4326",
      "zIndex": 94,
      "query": "nearest_to",
      "queryparams": {
        "id": true,
        "reduce": true
      },
      "style": {
        "default": {
          "icon": {
            "type": "triangle"
          }
        }
      }
    }
``` 
@function vector_layer
@param {Object} entry

@property {string} entry.query The query for the generation of the data to be displayed.
@property {string} entry.format The format for the entry.
@property {string} entry.theme The theme for the entry.
@property {string} [entry.key] The unique identifier for the entry.
@property {string} [entry.label] The label for the entry.
@property {string} [entry.host] The host for the entry.
@property {string} [entry.zIndex] The z-index for the entry.
@property {string} [entry.display] The display flag for the entry.
*/
export default function vector_layer(entry) {

  // Assign mapview to entry to provide shortened lookup.
  entry.mapview ??= entry.location.layer.mapview

  if (!entry.mapview) {

    console.warn(`vector_layer entry requires a mapview.`)
    return;
  }

  entry.zIndex ??= Object.keys(entry.mapview.layers).length + 1

  entry.style ??= {}

  if (entry.style.default && !entry.style.default.icon) {
    // Should be default.icon 
    entry.style.default.icon ??= { 'icon': entry.style.default };
    console.warn(`${entry.label}: Default style should be default.icon.`)
  };

  if (entry.style.default.icon) {
    // Assign the location style to the default style.
    entry.style.default.icon = { ...entry.location?.style, ...entry.style.default.icon }
  }

  // Update entry.style config.
  mapp.layer.styleParser(entry)

  if (entry.style.themes) {

    // Assign the first theme from themes if undefined.
    entry.style.theme ??= entry.style.themes[Object.keys(entry.style.themes)[0]]
  }

  entry.elements = entry.api_elements || []

  entry.label ??= 'Vector Layer'

  // Create checkbox to control geometry display.
  entry.chkbox = mapp.ui.elements.chkbox({
    label: entry.label,
    data_id: `${entry.key}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => checked ? entry.show(entry) : hide(entry)
  })

  entry.show ??= show

  // Show geometry if entry is set to display.
  entry.display && entry.show(entry)

  // Create a node consistent of the chkbox and the style drawer.
  entry.panel = mapp.utils.html.node`<div>${entry.chkbox}${entry.elements}`

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(() => {

    // Remove layer from map when location is removed.
    entry.mapview.Map.removeLayer(entry.L)
  })

  // Return the node to the location view.
  return entry.panel
}

/**
@function show

@description
`entry.display` flag will be set to true.
The `entry.style.panel` element display style will be set to `block`, if it exists.
The geometry layer will be added to the map (if it does not already exist).
The entry.query will be used to generate a query string and fetch features.
The features will be set to the entry object.
The entry object will be updated with the features.
The entry object will be updated with the layer source.
The layer will be added to the map.

@param {entry} entry entry object.
@property {string} entry.format The type of layer.
@property {string} entry.key The unique identifier for the entry.
@property {string} entry.query The query for the generation of the data to be displayed.
@property {string} entry.host The host for the entry.
*/
async function show(entry) {

  entry.display = true;

  // the show event maybe triggered by an API, draw, or modify interaction.
  const chkbox = entry.location.view?.querySelector(`[data-id=${entry.key}-chkbox] input`)

  if (chkbox) chkbox.checked = true

  if (entry.mapview.Map.getLayers().getArray().includes(entry.L)) {

    // The layer has already been added to the map.
    return;
  }

  // Create query paramString from the entry object.
  const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

  // Get features from query.
  entry.features ??= await mapp.utils.xhr(`${entry.host || entry.mapview?.host || mapp.host}/api/query?${paramString}`)

  if (entry.features instanceof Error) {

    console.warn('Features query failed.')
    return;
  }

  if (!entry.features && entry.api instanceof Function) await entry.api(entry)

  if (!entry.features) {

    // Disable checkbox.
    entry.panel.querySelector('input').disabled = true

    // Hide style drawer if present.
    if (entry.style.panel) {
      entry.style.panel.style.display = 'none'
    }
    return;
  }

  // The layer already exists.
  if (entry.setSource) {

    entry.setSource(entry.features)
  } else {

    mapp.layer.formats[entry.format](entry)
  }

  try {

    entry.mapview.Map.addLayer(entry.L)

  } catch {
    // Will catch assertation error when layer is already added.
  }

  entry.style.panel?.remove()

  // Create a style panel as entry.style.panel and append to entry.node.
  entry.style.panel = mapp.ui.layers.panels.style(entry)
  entry.style.panel && entry.panel.append(entry.style.panel)
}

/**
@function hide

@description
`entry.display` flag will be set to false.
The `entry.style.panel` element display style will be set to `none`, if it exists.
The geometry layer will be removed from the map.

@param {Object} entry entry object.
*/
function hide(entry) {

  entry.display = false

  // Hide the style drawer.
  if (entry.style.panel) entry.style.panel.style.display = 'none'

  // Remove the geometry layer from map.
  entry.mapview.Map.removeLayer(entry.L)
}