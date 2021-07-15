import { GuidString } from "@bentley/bentleyjs-core";
import { Version } from "@bentley/imodelhub-client";
import { BriefcaseDb, ChangesetId, ChangesetIndex, ChangesetProps, RequestNewBriefcaseArg } from "@bentley/imodeljs-backend";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
export declare namespace IModelHubUtils {
    function getAuthorizedClientRequestContext(): Promise<AuthorizedClientRequestContext>;
    function setHubEnvironment(arg?: string): void;
    function queryIModelId(requestContext: AuthorizedClientRequestContext, contextId: GuidString, iModelName: string): Promise<GuidString | undefined>;
    /** Temporarily needed to convert from the now preferred ChangesetIndex to the legacy ChangesetId.
     * @note This function should be removed when full support for ChangesetIndex is in place.
     */
    function queryChangesetId(requestContext: AuthorizedClientRequestContext, iModelId: GuidString, changesetIndex: ChangesetIndex): Promise<ChangesetId>;
    /** Temporarily needed to convert from the legacy ChangesetId to the now preferred ChangeSetIndex.
     * @note This function should be removed when full support for ChangesetIndex is in place.
     */
    function queryChangesetIndex(requestContext: AuthorizedClientRequestContext, iModelId: GuidString, changesetId: ChangesetId): Promise<ChangesetIndex>;
    /** Call the specified function for each changeset of the specified iModel. */
    function forEachChangeset(requestContext: AuthorizedClientRequestContext, iModelId: GuidString, func: (c: ChangesetProps) => void): Promise<void>;
    /** Call the specified function for each (named) Version of the specified iModel. */
    function forEachNamedVersion(requestContext: AuthorizedClientRequestContext, iModelId: GuidString, func: (v: Version) => void): Promise<void>;
    function downloadAndOpenBriefcase(requestContext: AuthorizedClientRequestContext, briefcaseArg: RequestNewBriefcaseArg): Promise<BriefcaseDb>;
}
