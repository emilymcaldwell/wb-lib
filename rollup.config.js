import filesize from "rollup-plugin-filesize";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const plugins = [
    typescript({
        compilerOptions: {
            declaration: false,
            declarationDir: undefined,
        },
    }),
    filesize({
        showMinifiedSize: false,
        showBrotliSize: true,
    }),
];

export default [
    {
        input: "src/index.rollup.ts",
        output: [
            {
                file: "dist/wb.js",
                format: "esm",
            },
            {
                file: "dist/wb.min.js",
                format: "esm",
                plugins: [terser()],
            },
        ],
        plugins,
    },
    // {
    //     input: "src/index.rollup.debug.ts",
    //     output: [
    //         {
    //             file: "dist/wb.debug.js",
    //             format: "esm",
    //         },
    //         {
    //             file: "dist/wb.debug.min.js",
    //             format: "esm",
    //             plugins: [terser()],
    //         },
    //     ],
    //     plugins,
    // },
];