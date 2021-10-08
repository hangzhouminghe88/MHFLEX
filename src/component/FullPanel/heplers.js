let genGetText = (text, self) => {
  return () => {
    return self.$t(text)
  }
}

let genGet = (name, self) => {
  return () => { return self[name] }
}

let genSet = (name, self) => {
  return (value) => { self[name] = value }
}

export default {
  genGetText,
  genGet,
  genSet
}
