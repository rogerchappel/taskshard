export interface TaskItem {
  id: string;
  title: string;
  heading: string;
  headingLevel: number;
  description: string;
  checked: boolean;
  owner: string | null;
  dependsOn: string[];
  files: string[];
  verification: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  raw: string;
}

export interface TaskShard {
  id: string;
  title: string;
  description: string;
  tasks: TaskItem[];
  filesTouched: string[];
  dependsOnShards: string[];
  canRunInParallel: boolean;
  estimatedOrder: number;
  conflicts: Conflict[];
  agentPrompt: string;
}

export interface Conflict {
  type: 'file-overlap' | 'dependency-missing' | 'owner-conflict' | 'orphaned-dependency';
  shard1: string;
  shard2?: string;
  details: string;
  severity: 'error' | 'warning';
}

export interface OrchestrationResult {
  version: string;
  generatedAt: string;
  sourceFile: string;
  shards: TaskShard[];
  conflicts: Conflict[];
  mergeOrder: string[];
  summary: {
    totalTasks: number;
    totalShards: number;
    parallelizableShards: number;
    serialShards: number;
    conflictCount: number;
  };
}
