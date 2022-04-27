mapp.utils.merge(mapp.dictionaries, {
  en: {
    location_clear_all: "Clear locations",
  },
  de: {
    location_clear_all: "Entferne Auswahl"
  },
  cn: {
    location_clear_all: "모든 위치 제거",
  },
  pl: {
    location_clear_all: "Wyczyść selekcje",
  },
  ko: {
    location_clear_all: "清除所有地点",
  },
  fr: {
    location_clear_all: "Desélectionner tous les lieux.",
  },
  ja: {
    location_clear_all: "全ロケーションをクリア",
  }
})

const list = [
  {
    symbol: 'A',
    colour: '#2E6F9E'
  },
  {
    symbol: 'B',
    colour: '#EC602D'
  },
  {
    symbol: 'C',
    colour: '#5B8C5A'
  },
  {
    symbol: 'D',
    colour: '#B84444'
  },
  {
    symbol: 'E',
    colour: '#514E7E'
  },
  {
    symbol: 'F',
    colour: '#E7C547'
  },
  {
    symbol: 'G',
    colour: '#368F8B'
  },
  {
    symbol: 'H',
    colour: '#841C47'
  },
  {
    symbol: 'I',
    colour: '#61A2D1'
  },
  {
    symbol: 'J',
    colour: '#37327F'
  }
]

export default params => {

  if (!params.mapview) return

  if (!params.target) return

  const listview = {
    node: params.target,
    mapview: params.mapview
  }

  listview.node.appendChild(mapp.utils.html.node`
    <button 
      class="tab-display bold primary-colour text-shadow"
      onclick=${e => {
        Object.values(listview.mapview.locations)
          .forEach(location => location.remove())
      }}>
      ${mapp.dictionary.location_clear_all}`)

  params.mapview.locations = new Proxy(params.mapview.locations, {
    set: function(target, key, location){

      const record = list.find(record => !record.hook)
      record.hook = location.hook
      location.record = record
      location.style = {
        strokeColor: record.colour,
        fillColor: record.colour,
        fillOpacity: 0.2,
      };

      location.Style = mapp.utils.style([
        {
          strokeColor: "#000",
          strokeOpacity: 0.1,
          strokeWidth: 8,
        },
        {
          strokeColor: "#000",
          strokeOpacity: 0.1,
          strokeWidth: 6,
        },
        {
          strokeColor: "#000",
          strokeOpacity: 0.1,
          strokeWidth: 4,
        },
        {
          strokeColor: location.style.strokeColor || "#000",
          strokeWidth: 2,
          fillColor: location.style.fillColor
          || location.style.strokeColor || "#fff",
          fillOpacity: location.style.fillOpacity || 0.2,
        }
      ]);

      location.pinStyle = mapp.utils.style({
        icon: {
          type: 'markerLetter',
          letter: record.symbol,
          color: location.style.strokeColor,
          scale: 3,
          anchor: [0.5, 1]
        }
      })

      Reflect.set(...arguments)
      mapp.ui.locations.view(location)

      //listview.node.appendChild(location.view)
      Object.values(listview.node.children).forEach(el => el.classList.remove('expanded'))
      listview.node.insertBefore(location.view, listview.node.firstChild.nextSibling)

      // Send event after the location view has been added to the DOM.
      location.view.dispatchEvent(new Event('addLocationView'))

      listview.node.closest('.tab').style.display = 'block'
      listview.node.closest('.tab').click()

      return true
    },
    deleteProperty: function (target, hook) {
      Reflect.deleteProperty(...arguments)

      const record = list.find(record => record.hook === hook)
      delete record.hook

      setTimeout(() => {

        //Lambs blood painted door, I shall pass
        if (listview.node.children.length > 1) return
    
        const tab = listview.node.closest('.tab')
        tab.style.display = 'none'
        tab.previousElementSibling.click()
    
      }, 300)

      return true
    },
  })

  return listview
}