export type TaskType =
  | "reading_single"
  | "listening_single"
  | "speaking_listen_repeat"
  | "speaking_interview"
  | "writing_build_sentence"
  | "writing_email"
  | "writing_academic_discussion";

export type Section = "Reading" | "Listening" | "Speaking" | "Writing";

export interface UserProfile {
  tenantId: string;
  userId: string;
  profileId: string;
  targetScore: number;
  examDate: string;
  currentLevel: string;
  dailyAvailableTime: number; // in minutes
  languagePreference: string;
  devicePreference: string;
  createdAt: string;
  updatedAt: string;
}

export interface SprintPlan {
  planId: string;
  profileId: string;
  generatedAt: string;
  planVersion: string;
  targetScore: number;
  examDate: string;
  currentDate: string;
  currentProgress: number; // 0-100
  strategySummary: string;
  currentPhase: string;
  recommendedTasks: RecommendedTask[];
  completedTasks: string[]; // itemIds or sessionIds
  skippedTasks: string[];
  revisedTasks: string[];
  adjustmentHistory: AdjustmentRecord[];
  sourceContextSummary: string;
}

export interface RecommendedTask {
  taskId: string;
  taskType: TaskType;
  section: Section;
  rationale: string;
  estimatedDuration: number; // in minutes
}

export interface AdjustmentRecord {
  date: string;
  reason: string;
  previousPhase: string;
  newPhase: string;
}

export interface TrainingSession {
  sessionId: string;
  profileId: string;
  planId: string;
  section: Section;
  taskType: TaskType;
  startedAt: string;
  endedAt?: string;
  status: "active" | "completed" | "paused" | "abandoned";
  currentItemId?: string;
  itemOrder: string[]; // list of itemIds
  sessionGoal: string;
  aiCoachRationale: string;
  nextStep?: string;
  deviceStateSnapshot?: DeviceState;
}

export interface PracticeItem {
  itemId: string;
  sessionId?: string;
  section: Section;
  taskType: TaskType;
  difficulty: number; // 1-5
  prompt: string;
  textContent?: string;
  audioContentRef?: string;
  standardTranscript?: string;
  options?: string[];
  correctAnswer?: string;
  expectedResponseType: "text" | "audio" | "selection";
  ruleSetVersion: string;
  scoringSchemaVersion: string;
  isPreloaded: boolean;
  isDegraded: boolean;
  degradedReason?: string;
  createdAt: string;
}

export interface UserResponse {
  responseId: string;
  itemId: string;
  sessionId: string;
  profileId: string;
  textAnswer?: string;
  selectedOption?: string;
  rawRecordingRef?: string;
  noteContent?: string;
  localTranscriptForDisplay?: string;
  startedAt: string;
  submittedAt?: string;
  duration: number; // in seconds
  replayCount: number;
  transcriptViewed: boolean;
  rerecordCount: number;
  cancelledRecordingCount: number;
  status: "draft" | "submitted" | "failed";
}

export interface ScoringResult {
  scoringId: string;
  responseId: string;
  itemId: string;
  score: number;
  deductedDimensions: DeductedDimension[];
  weaknessDetails: string[];
  strengths: string[];
  evidenceMap: Record<string, string>; // dimension -> evidence
  nextStep: string;
  scoringSchemaVersion: string;
  ruleSetVersion: string;
  generatedAt: string;
  needsRescore: boolean;
  requestId: string;
}

export interface DeductedDimension {
  dimension: string;
  deduction: number;
  evidence: string;
  suggestion: string;
}

export interface RequestRecord {
  requestId: string;
  requestType: "coach" | "generation" | "scoring" | "preload";
  profileId: string;
  sessionId?: string;
  itemId?: string;
  idempotencyKey: string;
  status: "pending" | "succeeded" | "failed" | "retrying";
  priority: number; // 1 (high) to 5 (low)
  isBatch: boolean;
  inflightGroupKey: string;
  retryCount: number;
  errorType?: string;
  createdAt: string;
  updatedAt: string;
  resultRef?: string;
}

export interface DeviceState {
  profileId: string;
  deviceId: string;
  playbackAvailable: boolean;
  recordingPermissionState: "granted" | "denied" | "prompt";
  recordingAvailable: boolean;
  lastCheckedAt: string;
  needsUserAction: boolean;
  failureReason?: string;
}

export type RequestStatus =
  | "idle"
  | "loading"
  | "saving"
  | "saved"
  | "error"
  | "queued"
  | "inflight"
  | "succeeded"
  | "failed_retryable"
  | "failed_non_retryable"
  | "rate_limited"
  | "recoverable";
