export interface SnapshotDTO {
  cod_prj: string;
  cod_apl: string;
  user_sc_login: string;
  type: string;
  scope: string;
  content: string;
  hash: string;
  captured_at: string;
  metadata: {
    source: string;
    tab_id?: number;
    context_source?: string;
    endpoint?: string;
    [key: string]: any;
  };
}

export function createSnapshotPayload(
  context: any,
  type: string,
  scope: string,
  content: string,
  source: string,
  extraMetadata: Record<string, any> = {}
): SnapshotDTO {
  return {
    cod_prj: context.cod_prj || 'Unknown',
    cod_apl: context.cod_apl || 'Unknown',
    user_sc_login: context.user_sc_login || 'Unknown',
    type,
    scope,
    content,
    hash: '', // Usually filled by the dispatcher if needed for deduplication
    captured_at: new Date().toISOString(),
    metadata: {
      source,
      ...extraMetadata,
    },
  };
}
