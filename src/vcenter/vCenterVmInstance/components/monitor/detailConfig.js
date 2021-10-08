export let config = {
  timeIntervalList: [
    {
      name: '15m',
      step: 9,
      index: 0,
      value: 15 * 60
    },
    {
      name: '1h',
      step: 36,
      index: 1,
      value: 60 * 60
    },
    {
      name: '6h',
      step: 216,
      index: 2,
      value: 6 * 60 * 60
    },
    {
      name: '1d',
      step: 864,
      index: 3,
      value: 24 * 60 * 60
    },
    {
      name: '2w',
      step: 12096,
      index: 4,
      value: 14 * 24 * 60 * 60
    },
    {
      name: '8w',
      step: 48384,
      index: 5,
      value: 56 * 24 * 60 * 60
    },
    {
      name: '1y',
      step: 315360,
      index: 6,
      value: 365 * 24 * 60 * 60
    }
  ],
  metricDataLength: 100
}
