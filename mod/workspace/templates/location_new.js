module.exports = _ => {

  // select array for insert statement
  const selects = []

  // The location ID must not be altered.
  if (Object.keys(_.body).some(key => key === _.layer.qID)) {

    throw new Error(`Layer ${_.layer}: You cannot update the ${key} field as it is a reserved parameter.`)
  }

  // keys array for insert statement
  const fields = Object.keys(_.body).map(key => {

    if (key === _.layer.geom) {

      // push geometry scaffolding into selects array.
      selects.push(`ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(%{${key}})), ${_.layer.srid})`)

      // push geojson string into params.
      _[key] = JSON.stringify(_.body[key])

      return key
    }

    // push %{key} into selects for substitution in query template.
    selects.push(`%{${key}}`)

    // push value into params.
    _[key] = _.body[key]

    return key
  })

  return `
    INSERT INTO ${_.table} (${fields.join(',')})
    SELECT ${selects.join(',')}
    RETURNING ${_.layer.qID}::varchar AS id;`
}