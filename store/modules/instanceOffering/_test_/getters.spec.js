import getters from '../getters'

describe('store/InstanceOffering/getters', () => {
  test('getList', () => {
    let data = getters.getList({
      '1': {
        uuid: '1'
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1'
    }])
  })
})



// WEBPACK FOOTER //
// ./src/store/modules/instanceOffering/__test__/getters.spec.js