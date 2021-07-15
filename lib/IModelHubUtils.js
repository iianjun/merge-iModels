"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
// cspell:words buddi urlps
Object.defineProperty(exports, "__esModule", { value: true });
exports.IModelHubUtils = void 0;
const bentleyjs_core_1 = require("@bentley/bentleyjs-core");
const ElectronBackend_1 = require("@bentley/electron-manager/lib/ElectronBackend");
const imodeljs_backend_1 = require("@bentley/imodeljs-backend");
const imodeljs_common_1 = require("@bentley/imodeljs-common");
const itwin_client_1 = require("@bentley/itwin-client");
var IModelHubUtils;
(function (IModelHubUtils) {
    async function getAuthorizedClientRequestContext() {
        const accessToken = await signIn();
        return new itwin_client_1.AuthorizedClientRequestContext(accessToken);
    }
    IModelHubUtils.getAuthorizedClientRequestContext = getAuthorizedClientRequestContext;
    async function signIn() {
        const client = new ElectronBackend_1.ElectronAuthorizationBackend();
        await client.initialize({
            clientId: "imodeljs-electron-test",
            redirectUri: "http://localhost:3000/signin-callback",
            scope: "openid email profile organization imodelhub context-registry-service:read-only reality-data:read product-settings-service projectwise-share urlps-third-party imodel-extension-service-api offline_access",
        });
        return new Promise((resolve, reject) => {
            imodeljs_backend_1.NativeHost.onUserStateChanged.addListener((token) => {
                if (token !== undefined) {
                    resolve(token);
                }
                else {
                    reject(new Error("Failed to sign in"));
                }
            });
            client.signIn().catch((error) => reject(error));
        });
    }
    function setHubEnvironment(arg) {
        let value = "0";
        if ("qa" === arg) {
            value = "102";
        }
        else if ("dev" === arg) {
            value = "103";
        }
        bentleyjs_core_1.Config.App.set("imjs_buddi_resolve_url_using_region", value);
    }
    IModelHubUtils.setHubEnvironment = setHubEnvironment;
    async function queryIModelId(requestContext, contextId, iModelName) {
        return imodeljs_backend_1.IModelHost.hubAccess.queryIModelByName({ requestContext, contextId, iModelName });
    }
    IModelHubUtils.queryIModelId = queryIModelId;
    /** Temporarily needed to convert from the now preferred ChangesetIndex to the legacy ChangesetId.
     * @note This function should be removed when full support for ChangesetIndex is in place.
     */
    async function queryChangesetId(requestContext, iModelId, changesetIndex) {
        return (await imodeljs_backend_1.IModelHost.hubAccess.queryChangeset({ requestContext, iModelId, changeset: { index: changesetIndex } })).id;
    }
    IModelHubUtils.queryChangesetId = queryChangesetId;
    /** Temporarily needed to convert from the legacy ChangesetId to the now preferred ChangeSetIndex.
     * @note This function should be removed when full support for ChangesetIndex is in place.
     */
    async function queryChangesetIndex(requestContext, iModelId, changesetId) {
        return (await imodeljs_backend_1.IModelHost.hubAccess.queryChangeset({ requestContext, iModelId, changeset: { id: changesetId } })).index;
    }
    IModelHubUtils.queryChangesetIndex = queryChangesetIndex;
    /** Call the specified function for each changeset of the specified iModel. */
    async function forEachChangeset(requestContext, iModelId, func) {
        const changesets = await imodeljs_backend_1.IModelHost.hubAccess.queryChangesets({ requestContext, iModelId });
        for (const changeset of changesets) {
            func(changeset);
        }
    }
    IModelHubUtils.forEachChangeset = forEachChangeset;
    /** Call the specified function for each (named) Version of the specified iModel. */
    async function forEachNamedVersion(requestContext, iModelId, func) {
        const namedVersions = await imodeljs_backend_1.IModelHubBackend.iModelClient.versions.get(requestContext, iModelId);
        for (const namedVersion of namedVersions) {
            func(namedVersion);
        }
    }
    IModelHubUtils.forEachNamedVersion = forEachNamedVersion;
    async function downloadAndOpenBriefcase(requestContext, briefcaseArg) {
        const briefcaseProps = await imodeljs_backend_1.BriefcaseManager.downloadBriefcase(requestContext, briefcaseArg);
        return imodeljs_backend_1.BriefcaseDb.open(requestContext, {
            fileName: briefcaseProps.fileName,
            readonly: briefcaseArg.briefcaseId ? briefcaseArg.briefcaseId === imodeljs_common_1.BriefcaseIdValue.Unassigned : false,
        });
    }
    IModelHubUtils.downloadAndOpenBriefcase = downloadAndOpenBriefcase;
})(IModelHubUtils = exports.IModelHubUtils || (exports.IModelHubUtils = {}));
