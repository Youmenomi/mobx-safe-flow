//@ts-check

import { build } from 'rollup-simple-configer'
import pkg from './package.json'

const input = './src/index.ts'

export default [].concat(
  build(
    input,
    {
      file: pkg.main,
      format: 'cjs',
    },
    { external: ['mobx', 'safe-flow'] }
  ),
  build(
    input,
    {
      file: pkg.module,
      format: 'esm',
    },
    { external: ['mobx', 'safe-flow'] }
  ),
  build(
    input,
    {
      file: `dist/umd/${pkg.name}.umd.js`,
      format: 'umd',
      name: 'mobxSafeFlow',
      globals: {
        mobx: 'mobx',
      },
    },
    { withMin: true, external: ['mobx'] }
  )
)
