import strategy from '../strategy'

describe('strategies/volume/strategy', () => {
  test('canAttach.isShareableFalse.noVmInstanceUuid', () => {
    let data = strategy.canAttach({
      type: 'Data',
      isShareable: false,
      state: 'Enabled',
      status: 'Ready'
    });
    expect(data).toEqual(true)
  });

  test('canAttach.isShareableTrue', () => {
    let data = strategy.canAttach({
      type: 'Data',
      isShareable: true,
      state: 'Enabled',
      status: 'Ready'
    });
    expect(data).toEqual(true)
  });

  test('canAttach.isShareableFalse.hasVmInstanceUuid.stateIsEnabled.statusIsReady', () => {
    let data = strategy.canAttach({
      type: 'Data',
      isShareable: false,
      vmInstanceUuid: '1',
      state: 'Enabled',
      status: 'Ready'
    });
    expect(data).toEqual(false)
  });

  test('canAttach.isShareableFalse.hasVmInstanceUuid.stateIsEnabled.statusIsNotInstantiated', () => {
    let data = strategy.canAttach({
      type: 'Data',
      isShareable: false,
      vmInstanceUuid: '1',
      state: 'Enabled',
      status: 'NotInstantiated'
    });
    expect(data).toEqual(false)
  });

  test('canAttach.isShareableFalse.noVmInstanceUuid.stateIsNotEnabled', () => {
    let data = strategy.canAttach({
      type: 'Data',
      isShareable: false,
      state: 'Disabled'
    });
    expect(data).toEqual(false)
  });

  test('canAttach.emptyArg', () => {
    let data = strategy.canAttach();
    expect(data).toEqual(false)
  });

  test('canAttach.typeIsRoot', () => {
    let data = strategy.canAttach({
      type: 'Root'
    });
    expect(data).toEqual(false)
  })
});



// WEBPACK FOOTER //
// ./src/strategies/volume/__test__/canAttach.spec.js
