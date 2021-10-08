import getters from '../getters'

describe('store/Volume/getters', () => {
  test('get.uuidIsString', () => {
    let data = getters.get({
      '1': {
        uuid: '1'
      }
    })('1')
    expect(data).toEqual([{
      uuid: '1'
    }])
  })

  test('get.uuidIsArray', () => {
    let data = getters.get({
      '1': {
        uuid: '1'
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1'
    }])
  })

  test('get.hasVmInstanceUuid.hasVmTable.hasVm.VmStateIsNotDestroyed', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuid: '2'
      }
    }, {
    }, {
      db: {
        vm: {
          '2': {
            name: 'vm',
            state: 'Ready'
          }
        }
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuid: '2',
      vmInstanceName: 'vm'
    }])
  })

  test('get.hasVmInstanceUuid.hasVmTable.hasVm.VmStateIsDestroyed', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuid: '2'
      }
    }, {
    }, {
      db: {
        vm: {
          '2': {
            name: 'vm',
            state: 'Destroyed'
          }
        }
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuid: '2'
    }])
  })

  test('get.hasVmInstanceUuid.hasVmTable.noVm', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuid: '2'
      }
    }, {
    }, {
      db: {
        vm: {
        }
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuid: '2'
    }])
  })

  test('get.hasVmInstanceUuid.noVmTable', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuid: '2'
      }
    }, {
    }, {
      db: {
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuid: '2'
    }])
  })

  test('get.hasVmInstanceUuidList.hasVmTable.hasVm.VmStateIsNotDestroyed', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuidList: ['2']
      }
    }, {
    }, {
      db: {
        vm: {
          '2': {
            name: 'vm',
            state: 'Ready'
          }
        }
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuidList: ['2'],
      vmInstanceName: 'vm'
    }])
  })

  test('get.hasVmInstanceUuidList.hasVmTable.hasVm.VmStateIsDestroyed', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuidList: ['2']
      }
    }, {
    }, {
      db: {
        vm: {
          '2': {
            name: 'vm',
            state: 'Destroyed'
          }
        }
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuidList: ['2']
    }])
  })

  test('get.hasVmInstanceUuidList.hasVmTable.noVm', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuidList: ['2']
      }
    }, {
    }, {
      db: {
        vm: {
        }
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuidList: ['2']
    }])
  })

  test('get.hasVmInstanceUuidList.noVmTable', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuidList: ['2']
      }
    }, {
    }, {
      db: {
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuidList: ['2']
    }])
  })

  test('get.vmInstanceUuidListIsEmpty', () => {
    let data = getters.get({
      '1': {
        uuid: '1',
        vmInstanceUuidList: []
      }
    }, {
    }, {
      db: {
      }
    })(['1'])
    expect(data).toEqual([{
      uuid: '1',
      vmInstanceUuidList: []
    }])
  })
})



// WEBPACK FOOTER //
// ./src/store/modules/volume/__test__/getters.spec.js