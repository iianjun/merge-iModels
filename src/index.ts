import { Id64Array, Id64String } from "@bentley/bentleyjs-core";
import {
  BackendRequestContext,
  IModelHost,
  IModelHostConfiguration,
  IModelJsFs,
  IModelTransformer,
  SnapshotDb,
  Subject,
} from "@bentley/imodeljs-backend";
import { IModel } from "@bentley/imodeljs-common";
import { IModelHubUtils } from "./IModelHubUtils";

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
export const mergeMultipleModels = async (
  sources: Id64Array,
  outDir: string,
  outPutFileName: string
): Promise<void> => {
  if (sources.length < 2) {
    console.error("At least two sources must be provided");
    return;
  }
  if (outDir.charAt(outDir.length - 1) === "/") {
    console.error(`outDir should not contain "/" at the end`);
    return;
  }
  const fullOutpath = `${outDir}/${outPutFileName}`;
  try {
    await IModelHost.startup();
    //Logger if i want
    const requestContext = new BackendRequestContext();
    if (IModelJsFs.existsSync(fullOutpath)) {
      console.error("Same file name exists in the output directory");
      return;
    }
    const mergedDb = SnapshotDb.createEmpty(fullOutpath, {
      rootSubject: { name: "Merged IModel " },
    });

    let sourcesSubjectId: Id64Array = [];
    sources.forEach((_, index) => {
      const subjectId: Id64String = Subject.insert(
        mergedDb,
        IModel.rootSubjectId,
        `Source${index + 1}`
      );
      sourcesSubjectId.push(subjectId);
    });
    mergedDb.saveChanges("Create Subject Hierarchy");

    sources.forEach(async (source, index) => {
      try {
        const fileName = source;
        const sourceDb = SnapshotDb.openFile(fileName);
        const transformer = new IModelTransformer(sourceDb, mergedDb, {
          targetScopeElementId: sourcesSubjectId[index],
        });
        await transformer.processSchemas(requestContext);
        transformer.context.remapElement(
          IModel.rootSubjectId,
          sourcesSubjectId[index]
        );
        await transformer.processAll();
        transformer.dispose();
        mergedDb.saveChanges(`Imported Source${index}`);
        sourceDb.close();
      } catch (err) {
        console.error(
          `Problem occurred while transforming data from the source${index}`,
          err
        );
      }
    });
    mergedDb.close();
  } catch (err) {
    console.error(err);
  }
};
export const test = (): string => {
  return "hello";
};
