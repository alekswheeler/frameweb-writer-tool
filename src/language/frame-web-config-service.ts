//Class to store and serve the FWT user config to the other services
// aleks: 04/02/2026
import fs from "fs";
import path from "path";

//#region Interfaces
interface ConfigData {
  types: string[];
}
//#endregion

export class ConfigService {
  //#region Constants
  private DEFAULT_CONFIG: ConfigData = {
    types: [],
  };
  private CONFIG_PATH = path.resolve(process.cwd(), "fwt.config.json");
  //#endregion

  //#region Attribute
  private config: ConfigData = this.DEFAULT_CONFIG;
  //#endregion

  //#region Event
  private watchConfig() {
    const path = this.CONFIG_PATH;
    const startFileWatcher = () => {
      fs.watchFile(path, { interval: 500 }, () => {
        this.loadConfig();
      });
    };

    if (fs.existsSync(path)) {
      startFileWatcher();
    } else {
      const dirWatcher = fs.watch(".", (event, filename) => {
        if (filename === path) {
          dirWatcher.close();
          startFileWatcher();
        }
      });
    }
  }

  //#endregion

  //#region Method
  private readJsonFile(filePath: string): ConfigData {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
  }

  private loadConfig() {
    try {
      const jsonData = this.readJsonFile(
        this.CONFIG_PATH,
      ) as Partial<ConfigData>;
      this.config = {
        ...this.DEFAULT_CONFIG,
        ...jsonData,
      };
      console.log("Config carregado com sucesso.", this.CONFIG_PATH);
    } catch (err) {
      console.log(
        "Config não encontrada ou inválida, usando default.",
        this.CONFIG_PATH,
      );
      this.config = this.DEFAULT_CONFIG;
    }
  }

  getTypes(): string[] {
    return this.config.types;
  }
  //#endregion

  //#region Constructor
  constructor() {
    this.loadConfig();
    this.watchConfig();
  }
  //#endregion
}
