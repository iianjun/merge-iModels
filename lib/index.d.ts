import { Id64Array } from "@bentley/bentleyjs-core";
/** @module MergeModels */
/** Create a merged iModel File using *IModelTransformer*.
   
   * @param  sources The file paths of sources (containing source file name)
   * @param  outDir The file path that will ctontain the merged iModel.
   * * > Note: A *outDir* should NOT contain "/" at the end.
   * @param  outputFileName The file name of merged iModel
   * @returns A merged IModel File
   *
   * * > Note: combined files size should be less than 50MB.
   */
export declare const mergeMultipleModels: (sources: Id64Array, outDir: string, outPutFileName: string) => Promise<void>;
export declare const test: () => string;
