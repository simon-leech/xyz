export default function (theme, feature) {

  const catValue = feature.properties.cat || feature.properties[theme.field]

  const catStyle = theme.cat[catValue]?.style || theme.cat[catValue]

  if (typeof catStyle === 'undefined') return;

  if (feature.geometryType === 'Point') {

    // Merge catStyle if icon style is not implicit.
    feature.style.icon = catStyle.icon || Object.assign(feature.style.icon, catStyle)
    return;
  }

  // Merge catStyle for vector features.
  mapp.utils.merge(feature.style, catStyle)
}