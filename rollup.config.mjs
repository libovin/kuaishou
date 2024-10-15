import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
// ---cut---
export default {
    input: 'src/main.ts',
    output: [{
        file: 'dist/kuaishou.js',
        format: 'iife',
        name: 'App',
        // sourcemap: true,
    },
    {
        file: 'dist/kuaishou.min.js',
        format: 'iife',
        plugins: [terser()],
    }],
    plugins: [
        resolve(), // 解析 Node 模块路径
        typescript(),
        commonjs(),
        babel({
            babelHelpers: "bundled",
            presets: [
                [
                    "@babel/preset-env",
                    // {
                    //     "targets": {
                    //         "rhino": "1",
                    //     },
                    //     "useBuiltIns": "usage",
                    //     "corejs": "3.38.1"
                    // }
                ],
            ]
        })

    ]
};
