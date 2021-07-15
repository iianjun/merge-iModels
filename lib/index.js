"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.mergeMultipleModels = void 0;
const imodeljs_backend_1 = require("@bentley/imodeljs-backend");
const imodeljs_common_1 = require("@bentley/imodeljs-common");
const IModelHubUtils_1 = require("./IModelHubUtils");
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
const mergeMultipleModels = async (sources, outDir, outPutFileName) => {
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
        IModelHubUtils_1.IModelHubUtils.setHubEnvironment("prod");
        const config = new imodeljs_backend_1.IModelHostConfiguration();
        config.crashReportingConfig = undefined;
        await imodeljs_backend_1.IModelHost.startup(config);
        //Logger if i want
        const requestContext = new imodeljs_backend_1.BackendRequestContext();
        if (imodeljs_backend_1.IModelJsFs.existsSync(fullOutpath)) {
            console.error("Same file name exists in the output directory");
            return;
        }
        const mergedDb = imodeljs_backend_1.SnapshotDb.createEmpty(fullOutpath, {
            rootSubject: { name: "Merged IModel " },
        });
        let sourcesSubjectId = [];
        sources.forEach((_, index) => {
            const subjectId = imodeljs_backend_1.Subject.insert(mergedDb, imodeljs_common_1.IModel.rootSubjectId, `Source${index + 1}`);
            sourcesSubjectId.push(subjectId);
        });
        mergedDb.saveChanges("Create Subject Hierarchy");
        sources.forEach(async (source, index) => {
            try {
                const fileName = source;
                const sourceDb = imodeljs_backend_1.SnapshotDb.openFile(fileName);
                const transformer = new imodeljs_backend_1.IModelTransformer(sourceDb, mergedDb, {
                    targetScopeElementId: sourcesSubjectId[index],
                });
                await transformer.processSchemas(requestContext);
                transformer.context.remapElement(imodeljs_common_1.IModel.rootSubjectId, sourcesSubjectId[index]);
                await transformer.processAll();
                transformer.dispose();
                mergedDb.saveChanges(`Imported Source${index}`);
                sourceDb.close();
            }
            catch (err) {
                console.error(`Problem occurred while transforming data from the source${index}`, err);
            }
        });
        mergedDb.close();
    }
    catch (err) {
        console.error(err);
    }
};
exports.mergeMultipleModels = mergeMultipleModels;
const test = () => {
    return "hello";
};
exports.test = test;
