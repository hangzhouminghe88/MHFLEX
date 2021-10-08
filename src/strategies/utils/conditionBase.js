export function assert (realValue, oper, expectValue) {
  if (oper === '>') {
    return realValue > expectValue
  } else if (oper === '>=') {
    return realValue >= expectValue
  } else if (oper === '=') {
    return realValue === expectValue
  } else if (oper === '<=') {
    return realValue <= expectValue
  } else if (oper === '<') {
    return realValue < expectValue
  }
  return false
}

export function compileRules (rules) {
  let result = [];
  for (let rule of rules) {
    result.push(compileRule(rule))
  }
  return result
}

function compileRule (rule) {
  let result = {};
  for (let key in rule) {
    let rules = [];
    let conditions = key.split('&&');
    for (let conditionStr of conditions) {
      let params = conditionStr.match(/\(.*?\)/g);
      if (params.length === 1) {
        let name = conditionStr.replace(params[0], '');
        let str = params[0].replace('(', '').replace(')', '');
        let oper = str.replace(/[0-9]/g, '');
        let value = str.replace(/[^0-9]/g, '');
        let singleRule = {
          name: name.trim(),
          oper: oper,
          value: parseInt(value)
        };
        rules.push(singleRule)
      }
    }
    result = {
      name: key,
      output: rule[key],
      rules: rules
    }
  }
  return result
}



// WEBPACK FOOTER //
// ./src/strategies/utils/conditionBase.js
