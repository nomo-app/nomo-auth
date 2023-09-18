import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
//import  packageJson from "./package.json";
import json from '@rollup/plugin-json';

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/cjs/index.js", //packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: "dist/esm/index.js", //packageJson.module,
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json",
                exclude: ["**/*.stories.tsx", "**/*.test.ts", "**/*.testutil.ts", "./src/test/"]
            }),
            json(),
            terser()
        ],
    },
    {
        input: "dist/esm/types/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
        external: [/\.json$/],
    },
];
