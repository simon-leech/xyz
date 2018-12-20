import _xyz from '../_xyz.mjs';
import setData from './setData.mjs';
import tab_content from './content.mjs';

export default layer => {
    
  layer.tableview.refresh = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_inline',
      title: 'Refresh'
    },
    eventListener: {
      event: 'click',
      funct: (e) => {
        console.log('Refresh data for ' + layer.name);
        layer.tableview.offset = 0; // set offset back to zero
        e.stopPropagation();
        setData(layer);
      }
    },
    appendTo: layer.tableview.section
  });

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      classList: 'material-icons',
      textContent: 'autorenew'
    },
    style: {
      fontSize: '14px'
    },
    appendTo: layer.tableview.refresh
  });
    
  _xyz.utils.createElement({
    tag: 'em',
    options: {
      textContent: 'Refresh'
    },
    appendTo: layer.tableview.refresh
  });
    
  _xyz.utils.createElement({
    tag: 'span',
    appendTo: layer.tableview.refresh
  });

  _xyz.utils.checkbox({
    label: 'Viewport only',
    appendTo: layer.tableview.section,
    checked: layer.tableview.viewport || false,
    onChange: e => {
      layer.tableview.viewport = e.target.checked;
      setData(layer);
    }
  });

  layer.tableview.note = _xyz.utils.createElement({
    tag: 'div',
    style: {
      fontSize: '12px',
      padding: '2px',
      marginTop: '5px'
    },
    appendTo: layer.tableview.section
  });

  layer.tableview.container = _xyz.utils.createElement({
    tag: 'div',
    appendTo: layer.tableview.section
  });

};