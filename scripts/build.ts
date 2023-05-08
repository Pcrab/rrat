import { rimraf } from "rimraf";

import type { RollupOutput } from "rollup";
import { rollup } from "rollup";
import dts from "rollup-plugin-dts";
import { swc } from "rollup-plugin-swc3";
import { builtinModules } from "module";

import pkg from "../package.json";

const deps = Object.keys(
    (pkg as unknown as { dependencies?: object }).dependencies ?? {},
);
const peers = Object.keys(
    (pkg as unknown as { peerDependencies?: object }).peerDependencies ?? {},
);

const cjsOut = pkg.main;
const esmOut = pkg.module;
const typeOut = pkg.types;

const input = "./src/index.ts";
const external = [...deps, ...peers, ...builtinModules];

async function main(): Promise<void> {
    await rimraf("dist");

    async function build(): Promise<[RollupOutput, RollupOutput]> {
        const bundle = await rollup({
            input,
            external,
            plugins: [swc()],
        });
        return Promise.all([
            bundle.write({
                file: cjsOut,
                format: "cjs",
                interop: "auto",
            }),
            bundle.write({
                file: esmOut,
                format: "esm",
                interop: "auto",
            }),
        ]);
    }

    async function createDts(): Promise<RollupOutput> {
        const bundle = await rollup({
            input,
            external,
            plugins: [dts()],
        });
        return bundle.write({
            file: typeOut,
            format: "es",
        });
    }

    await Promise.all([build(), createDts()]);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
