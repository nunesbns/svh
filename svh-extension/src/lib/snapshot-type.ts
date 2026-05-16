/**
 * Maps a raw scope string captured from Scriptcase into the {type, scope}
 * pair expected by the SVH API.
 *
 * Scriptcase exposes three kinds of editable assets through the same
 * editor UI:
 *   - Application events  -> "onScriptInit", "onClick", "events/onLoad", …
 *   - Library files       -> "libs/utils.php"
 *   - PHP methods         -> "function methodName"
 *
 * Returns the normalized scope (e.g. just "methodName" without the
 * `function ` prefix) along with the corresponding API type.
 */
export type SnapshotType = 'app_event' | 'lib_file' | 'function';

const FUNCTION_PREFIX = /^function\s+/i;

export function resolveSnapshotType(rawScope: string | null | undefined): {
  type: SnapshotType;
  scope: string;
} {
  const scope = (rawScope ?? '').trim();

  if (FUNCTION_PREFIX.test(scope)) {
    return {
      type: 'function',
      scope: scope.replace(FUNCTION_PREFIX, '').trim(),
    };
  }

  if (scope.startsWith('libs/')) {
    return { type: 'lib_file', scope };
  }

  return { type: 'app_event', scope };
}
