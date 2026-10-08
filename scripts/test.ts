import {execFile, execSync} from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import {loadJsonFile, logger, IProjectConfig} from "./utils";

function main() {
  const config: IProjectConfig = loadJsonFile("config.json");
  const filename = path.resolve(config.outputFolder, config.mapFolder);

  if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
    logger.error(`Map archive "${filename}" does not exist. Run "npm run build" first.`);
    process.exitCode = 1;
    return;
  }

  logger.info(`Launching map "${filename.replace(/\\/g, "/")}"...`);

  if(config.winePath) {
    const wineFilename = `"Z:${filename}"`
    const prefix = config.winePrefix ? `WINEPREFIX=${config.winePrefix}` : ''
    execSync(`${prefix} ${config.winePath} "${config.gameExecutable}" ${["-loadfile", wineFilename, ...config.launchArgs].join(' ')}`, { stdio: 'ignore' });
  } else {
    execFile(config.gameExecutable, ["-loadfile", filename, ...config.launchArgs], (err) => {
      if (err) {
        logger.error(err.code === 'ENOENT'
          ? `No such file or directory "${config.gameExecutable}". Make sure gameExecutable is configured properly in config.json.`
          : `Failed to launch map "${filename}": ${err.message}`);
        process.exitCode = 1;
      }
    });
  }
}

main();
