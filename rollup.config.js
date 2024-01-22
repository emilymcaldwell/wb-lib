import filesize from "rollup-plugin-filesize";
import license from "rollup-plugin-license";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const plugins = [
    typescript({
        compilerOptions: {
            declaration: false,
            declarationDir: undefined,
        },
    }),
    license({
        banner: {
            content: '/*! wb-lib | https://github.com/emilymcaldwell/wb-lib/blob/main/LICENSE */',
            commentStyle: 'none',
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