let colorList = [
  '#0088EF',
  '#16BBBF',
  '#F657E0',
  '#F2AE1B',
  '#A0BF16',
  '#6951FF',
  '#65CAFF',
  '#BDA2FF',
  '#175BB4'
]

export function getColors (index) {
  return colorList[index % colorList.length]
}

export function formatPercentage (d) {
  let str = d.toString()
  if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) return d.toFixed(2) + '%'
  else return d + '%'
}

export function formateValue (unit) {
  let obj = {
    count: this.formatCount,
    percent: this.formatPercent,
    bytes: this.formatBytes,
    ops: this.formatOps,
    pps: this.formatPps
  }
  return obj[unit]
}

export function formatCount (value) {
  let str = value.toString()
  if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) value = value.toFixed(2)
  if (value > 1000) {
    let _value = value / 1000
    let _valueStr = _value + ''
    _value = (_valueStr.indexOf('.') > -1 && _valueStr.split('.')[1].length > 2) ? _value.toFixed(2) : _value
    return _value + 'K'
  } else return value
}

export function formatPercent (value) {
  let str = value.toString()
  if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) return value.toFixed(2) + '%'
  else return value + '%'
}

export function formatBytes (value) {
  if (value < 1.0) value = 0
  return this.bytesToSize(value) + '/s'
}

export function formatOps (value) {
  let str = value.toString()
  if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) value = value.toFixed(2)
  if (value > 1000) {
    let _value = value / 1000
    let _valueStr = _value + ''
    _value = (_valueStr.indexOf('.') > -1 && _valueStr.split('.')[1].length > 2) ? _value.toFixed(2) : _value
    return _value + 'K ops/s'
  } else return value + ' ops/s'
}

export function formatPps (value) {
  let str = value.toString()
  if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) value = value.toFixed(2)
  return value + ' pps'
}

export default {
  formateValue,
  formatCount,
  formatPercent,
  formatBytes,
  formatOps,
  formatPps,
  getColors
}
