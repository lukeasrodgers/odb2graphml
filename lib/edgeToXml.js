function edgeToXml(e) {
  return `<edge id="${e['@rid']}" label="${e['@class']}" source="${e['out']}" target="${e['in']}"><data key="label">${e['@class']}</data></edge>`;
}

module.exports = edgeToXml;
