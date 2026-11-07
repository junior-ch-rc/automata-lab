// A missing transition empties the active set. Retain the last reachable
// states only as failure markers; they are not active configurations.
export function stateHighlights(result, frame) {
  const trace = result?.trace;
  if (!trace?.length) return { ids: [], rejected: false };
  const rejected = result.accepted === false && frame === trace.length - 1;
  const current = trace[frame]?.active || [];
  if (current.length || !rejected) return { ids: current, rejected };
  for (let i = frame - 1; i >= 0; i--) {
    if (trace[i].active?.length) return { ids: trace[i].active, rejected: true };
  }
  return { ids: [], rejected: true };
}
