import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, isAbsolute, sep } from 'node:path';
import { dataset } from '../src/lib/fixtures';
import { datasetSchema, getFreshnessMetadata } from '../src/server/data-provider';

const args = process.argv.slice(2);
const exportMode = args[0] === '--export';
const suppliedInput = exportMode ? undefined : args[0];
const suppliedOutput = args[1];
async function main() {
  if (!exportMode && !suppliedInput) {
    console.error(
      'Usage: npm run import:demo -- input.json [output.json]\n       npm run import:demo -- --export [output.json]',
    );
    process.exitCode = 1;
  } else {
    try {
      let input: unknown = dataset;
      if (suppliedInput) {
        const inputPath = resolve(suppliedInput);
        if ((await stat(inputPath)).size > 2 * 1024 * 1024) throw new Error('Input exceeds 2 MB.');
        input = JSON.parse(await readFile(inputPath, 'utf8'));
      }
      const validated = datasetSchema.parse(input);
      const output = resolve(
        suppliedOutput ?? (exportMode ? 'docs/demo-network.json' : 'data/demo-network.json'),
      );
      const workspaceRelative = relative(process.cwd(), output);
      if (
        isAbsolute(workspaceRelative) ||
        workspaceRelative === '..' ||
        workspaceRelative.startsWith(`..${sep}`)
      )
        throw new Error('Output must be inside the current workspace.');
      if (extname(output).toLowerCase() !== '.json')
        throw new Error('Output must have a .json extension.');
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, `${JSON.stringify(validated, null, 2)}\n`, { flag: 'wx' });
      const freshness = getFreshnessMetadata(validated);
      console.log(
        `Validated ${validated.nodes.length} nodes, ${validated.edges.length} roads and ${validated.incidents.length} simulated incidents.`,
      );
      console.log(
        `Saved ${workspaceRelative}. Freshness: ${freshness.state}. ${freshness.message}`,
      );
      console.log(
        'Local fixture artifact only. No database was contacted and the running application still uses src/lib/fixtures.ts.',
      );
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Fixture import failed.');
      process.exitCode = 1;
    }
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Fixture import failed.');
  process.exitCode = 1;
});
