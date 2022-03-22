module.exports = {
    render: _ => {

        console.log(_)

        const layer = _.workspace.locales[_.locale].layers[_.layer]

        const table = layer.table || Object.values(layer.tables).find(tab => !!tab);

        const fields = layer.infoj
            .filter(entry => !entry.query)
            .filter(entry => entry.type !== 'key')
            .filter(entry => entry.field)
            .map(entry => `(${entry.fieldfx || entry.field}) AS ${entry.field}`)

        return `
          SELECT
            ${layer.qID} as id,
            ${fields.join()}
          FROM ${table}
          ORDER BY ${layer.qID} DESC
          LIMIT 1`
    }
}