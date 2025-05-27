[**Magic Button Messaging v1.2.0**](../README.md)

***

# Variable: ExtensionWebappContract

> `const` **ExtensionWebappContract**: `object`

## Type declaration

### events

> `readonly` **events**: `object`

#### events.datasetChanged

> `readonly` **datasetChanged**: `ZodObject`\<\{ `changedEntities`: `ZodArray`\<`ZodEnum`\<\[`"tools"`, `"rules"`, `"mappings"`, `"consent"`\]\>, `"many"`\>; `timestamp`: `ZodNumber`; `version`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `changedEntities`: (`"tools"` \| `"rules"` \| `"mappings"` \| `"consent"`)[]; `timestamp`: `number`; `version`: `string`; \}, \{ `changedEntities`: (`"tools"` \| `"rules"` \| `"mappings"` \| `"consent"`)[]; `timestamp`: `number`; `version`: `string`; \}\> = `DatasetChangedEventSchema`

#### events.extensionUpdated

> `readonly` **extensionUpdated**: `ZodObject`\<\{ `errors`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `success`: `ZodBoolean`; `version`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `errors?`: `string`[]; `success`: `boolean`; `version`: `string`; \}, \{ `errors?`: `string`[]; `success`: `boolean`; `version`: `string`; \}\>

### requests

> `readonly` **requests**: `object`

#### requests.exportDataset

> `readonly` **exportDataset**: `object`

#### requests.exportDataset.request

> `readonly` **request**: `ZodObject`\<\{ `entities`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\[`"tools"`, `"rules"`, `"mappings"`, `"consent"`\]\>, `"many"`\>\>; `format`: `ZodEnum`\<\[`"json"`, `"yaml"`, `"csv"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `entities?`: (`"tools"` \| `"rules"` \| `"mappings"` \| `"consent"`)[]; `format`: `"json"` \| `"yaml"` \| `"csv"`; \}, \{ `entities?`: (`"tools"` \| `"rules"` \| `"mappings"` \| `"consent"`)[]; `format`: `"json"` \| `"yaml"` \| `"csv"`; \}\>

#### requests.exportDataset.response

> `readonly` **response**: `ZodObject`\<\{ `data`: `ZodString`; `filename`: `ZodString`; `mimeType`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `data`: `string`; `filename`: `string`; `mimeType`: `string`; \}, \{ `data`: `string`; `filename`: `string`; `mimeType`: `string`; \}\>

#### requests.getCompleteDataset

> `readonly` **getCompleteDataset**: `object`

#### requests.getCompleteDataset.request

> `readonly` **request**: `ZodObject`\<\{ \}, `"strip"`, `ZodTypeAny`, \{ \}, \{ \}\>

#### requests.getCompleteDataset.response

> `readonly` **response**: `ZodObject`\<\{ `consentSettings`: `ZodArray`\<`ZodObject`\<\{ `domain`: `ZodString`; `expiresAt`: `ZodOptional`\<`ZodString`\>; `granted`: `ZodBoolean`; `id`: `ZodString`; `level`: `ZodEnum`\<\[`"once"`, `"session"`, `"forever"`\]\>; `timestamp`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `domain`: `string`; `expiresAt?`: `string`; `granted`: `boolean`; `id`: `string`; `level`: `"once"` \| `"session"` \| `"forever"`; `timestamp`: `string`; \}, \{ `domain`: `string`; `expiresAt?`: `string`; `granted`: `boolean`; `id`: `string`; `level`: `"once"` \| `"session"` \| `"forever"`; `timestamp`: `string`; \}\>, `"many"`\>; `mappings`: `ZodArray`\<`ZodObject`\<\{ `category`: `ZodString`; `createdAt`: `ZodString`; `id`: `ZodString`; `priority`: `ZodNumber`; `ruleId`: `ZodString`; `toolId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `category`: `string`; `createdAt`: `string`; `id`: `string`; `priority`: `number`; `ruleId`: `string`; `toolId`: `string`; \}, \{ `category`: `string`; `createdAt`: `string`; `id`: `string`; `priority`: `number`; `ruleId`: `string`; `toolId`: `string`; \}\>, `"many"`\>; `rules`: `ZodArray`\<`ZodObject`\<\{ `conditions`: `ZodArray`\<`ZodObject`\<\{ `caseSensitive`: ...; `operator`: ...; `type`: ...; `value`: ...; \}, `"strip"`, `ZodTypeAny`, \{ `caseSensitive?`: ...; `operator`: ...; `type`: ...; `value`: ...; \}, \{ `caseSensitive?`: ...; `operator`: ...; `type`: ...; `value`: ...; \}\>, `"many"`\>; `createdAt`: `ZodString`; `description`: `ZodString`; `id`: `ZodString`; `isActive`: `ZodBoolean`; `name`: `ZodString`; `priority`: `ZodNumber`; `updatedAt`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `conditions`: `object`[]; `createdAt`: `string`; `description`: `string`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `priority`: `number`; `updatedAt`: `string`; \}, \{ `conditions`: `object`[]; `createdAt`: `string`; `description`: `string`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `priority`: `number`; `updatedAt`: `string`; \}\>, `"many"`\>; `timestamp`: `ZodNumber`; `tools`: `ZodArray`\<`ZodObject`\<\{ `canBeIframed`: `ZodBoolean`; `category`: `ZodString`; `description`: `ZodString`; `enabled`: `ZodBoolean`; `iconUrl`: `ZodString`; `id`: `ZodString`; `metadata`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodAny`\>\>; `priority`: `ZodNumber`; `requiresLogin`: `ZodBoolean`; `requiresVPN`: `ZodBoolean`; `title`: `ZodString`; `url`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `canBeIframed`: `boolean`; `category`: `string`; `description`: `string`; `enabled`: `boolean`; `iconUrl`: `string`; `id`: `string`; `metadata?`: `Record`\<`string`, `any`\>; `priority`: `number`; `requiresLogin`: `boolean`; `requiresVPN`: `boolean`; `title`: `string`; `url`: `string`; \}, \{ `canBeIframed`: `boolean`; `category`: `string`; `description`: `string`; `enabled`: `boolean`; `iconUrl`: `string`; `id`: `string`; `metadata?`: `Record`\<`string`, `any`\>; `priority`: `number`; `requiresLogin`: `boolean`; `requiresVPN`: `boolean`; `title`: `string`; `url`: `string`; \}\>, `"many"`\>; `version`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `consentSettings`: `object`[]; `mappings`: `object`[]; `rules`: `object`[]; `timestamp`: `number`; `tools`: `object`[]; `version`: `string`; \}, \{ `consentSettings`: `object`[]; `mappings`: `object`[]; `rules`: `object`[]; `timestamp`: `number`; `tools`: `object`[]; `version`: `string`; \}\> = `ExtensionDatasetSchema`

#### requests.getDatasetVersion

> `readonly` **getDatasetVersion**: `object`

#### requests.getDatasetVersion.request

> `readonly` **request**: `ZodObject`\<\{ \}, `"strip"`, `ZodTypeAny`, \{ \}, \{ \}\>

#### requests.getDatasetVersion.response

> `readonly` **response**: `ZodObject`\<\{ `timestamp`: `ZodNumber`; `version`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `timestamp`: `number`; `version`: `string`; \}, \{ `timestamp`: `number`; `version`: `string`; \}\>

#### requests.importDataset

> `readonly` **importDataset**: `object`

#### requests.importDataset.request

> `readonly` **request**: `ZodObject`\<\{ `data`: `ZodString`; `format`: `ZodEnum`\<\[`"json"`, `"yaml"`, `"csv"`\]\>; `mergeStrategy`: `ZodEnum`\<\[`"replace"`, `"merge"`, `"append"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `data`: `string`; `format`: `"json"` \| `"yaml"` \| `"csv"`; `mergeStrategy`: `"merge"` \| `"replace"` \| `"append"`; \}, \{ `data`: `string`; `format`: `"json"` \| `"yaml"` \| `"csv"`; `mergeStrategy`: `"merge"` \| `"replace"` \| `"append"`; \}\>

#### requests.importDataset.response

> `readonly` **response**: `ZodObject`\<\{ `errors`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `imported`: `ZodObject`\<\{ `consent`: `ZodNumber`; `mappings`: `ZodNumber`; `rules`: `ZodNumber`; `tools`: `ZodNumber`; \}, `"strip"`, `ZodTypeAny`, \{ `consent`: `number`; `mappings`: `number`; `rules`: `number`; `tools`: `number`; \}, \{ `consent`: `number`; `mappings`: `number`; `rules`: `number`; `tools`: `number`; \}\>; `success`: `ZodBoolean`; \}, `"strip"`, `ZodTypeAny`, \{ `errors?`: `string`[]; `imported`: \{ `consent`: `number`; `mappings`: `number`; `rules`: `number`; `tools`: `number`; \}; `success`: `boolean`; \}, \{ `errors?`: `string`[]; `imported`: \{ `consent`: `number`; `mappings`: `number`; `rules`: `number`; `tools`: `number`; \}; `success`: `boolean`; \}\>

#### requests.previewChanges

> `readonly` **previewChanges**: `object`

#### requests.previewChanges.request

> `readonly` **request**: `ZodObject`\<\{ `baseVersion`: `ZodString`; `changes`: `ZodArray`\<`ZodObject`\<\{ `entity`: `ZodEnum`\<\[`"tool"`, `"rule"`, `"mapping"`, `"consent"`\]\>; `entityId`: `ZodString`; `id`: `ZodString`; `newData`: `ZodOptional`\<`ZodAny`\>; `previousData`: `ZodOptional`\<`ZodAny`\>; `timestamp`: `ZodNumber`; `type`: `ZodEnum`\<\[`"create"`, `"update"`, `"delete"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `entity`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; `entityId`: `string`; `id`: `string`; `newData?`: `any`; `previousData?`: `any`; `timestamp`: `number`; `type`: `"create"` \| `"update"` \| `"delete"`; \}, \{ `entity`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; `entityId`: `string`; `id`: `string`; `newData?`: `any`; `previousData?`: `any`; `timestamp`: `number`; `type`: `"create"` \| `"update"` \| `"delete"`; \}\>, `"many"`\>; `description`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `baseVersion`: `string`; `changes`: `object`[]; `description?`: `string`; \}, \{ `baseVersion`: `string`; `changes`: `object`[]; `description?`: `string`; \}\> = `BatchUpdateSchema`

#### requests.previewChanges.response

> `readonly` **response**: `ZodObject`\<\{ `conflicts`: `ZodArray`\<`ZodObject`\<\{ `conflict`: `ZodString`; `entityId`: `ZodString`; `entityType`: `ZodEnum`\<\[`"tool"`, `"rule"`, `"mapping"`, `"consent"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `conflict`: `string`; `entityId`: `string`; `entityType`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; \}, \{ `conflict`: `string`; `entityId`: `string`; `entityType`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; \}\>, `"many"`\>; `invalidChanges`: `ZodArray`\<`ZodObject`\<\{ `changeId`: `ZodString`; `error`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `changeId`: `string`; `error`: `string`; \}, \{ `changeId`: `string`; `error`: `string`; \}\>, `"many"`\>; `validChanges`: `ZodNumber`; \}, `"strip"`, `ZodTypeAny`, \{ `conflicts`: `object`[]; `invalidChanges`: `object`[]; `validChanges`: `number`; \}, \{ `conflicts`: `object`[]; `invalidChanges`: `object`[]; `validChanges`: `number`; \}\>

#### requests.updateDataset

> `readonly` **updateDataset**: `object`

#### requests.updateDataset.request

> `readonly` **request**: `ZodObject`\<\{ `baseVersion`: `ZodString`; `changes`: `ZodArray`\<`ZodObject`\<\{ `entity`: `ZodEnum`\<\[`"tool"`, `"rule"`, `"mapping"`, `"consent"`\]\>; `entityId`: `ZodString`; `id`: `ZodString`; `newData`: `ZodOptional`\<`ZodAny`\>; `previousData`: `ZodOptional`\<`ZodAny`\>; `timestamp`: `ZodNumber`; `type`: `ZodEnum`\<\[`"create"`, `"update"`, `"delete"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `entity`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; `entityId`: `string`; `id`: `string`; `newData?`: `any`; `previousData?`: `any`; `timestamp`: `number`; `type`: `"create"` \| `"update"` \| `"delete"`; \}, \{ `entity`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; `entityId`: `string`; `id`: `string`; `newData?`: `any`; `previousData?`: `any`; `timestamp`: `number`; `type`: `"create"` \| `"update"` \| `"delete"`; \}\>, `"many"`\>; `description`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `baseVersion`: `string`; `changes`: `object`[]; `description?`: `string`; \}, \{ `baseVersion`: `string`; `changes`: `object`[]; `description?`: `string`; \}\> = `BatchUpdateSchema`

#### requests.updateDataset.response

> `readonly` **response**: `ZodObject`\<\{ `appliedChanges`: `ZodArray`\<`ZodString`, `"many"`\>; `conflicts`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `conflict`: `ZodString`; `currentData`: `ZodAny`; `entityId`: `ZodString`; `entityType`: `ZodEnum`\<\[..., ..., ..., ...\]\>; `proposedData`: `ZodAny`; \}, `"strip"`, `ZodTypeAny`, \{ `conflict`: `string`; `currentData?`: `any`; `entityId`: `string`; `entityType`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; `proposedData?`: `any`; \}, \{ `conflict`: `string`; `currentData?`: `any`; `entityId`: `string`; `entityType`: `"tool"` \| `"rule"` \| `"mapping"` \| `"consent"`; `proposedData?`: `any`; \}\>, `"many"`\>\>; `newVersion`: `ZodString`; `rejectedChanges`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `changeId`: `ZodString`; `reason`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `changeId`: `string`; `reason`: `string`; \}, \{ `changeId`: `string`; `reason`: `string`; \}\>, `"many"`\>\>; `success`: `ZodBoolean`; \}, `"strip"`, `ZodTypeAny`, \{ `appliedChanges`: `string`[]; `conflicts?`: `object`[]; `newVersion`: `string`; `rejectedChanges?`: `object`[]; `success`: `boolean`; \}, \{ `appliedChanges`: `string`[]; `conflicts?`: `object`[]; `newVersion`: `string`; `rejectedChanges?`: `object`[]; `success`: `boolean`; \}\>
