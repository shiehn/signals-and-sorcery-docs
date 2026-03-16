/**
 * Plugin SDK Type Definitions
 *
 * These are the canonical type definitions for the Signals & Sorcery Plugin SDK.
 * They mirror the types in the host app's src/shared/types/plugin-sdk.types.ts.
 *
 * IMPORTANT: Keep these in sync with the host app's type definitions.
 */

import type { ComponentType } from 'react';

// ============================================================================
// Core Plugin Interface
// ============================================================================

export type GeneratorType = 'midi' | 'audio' | 'sample' | 'hybrid';

export interface GeneratorPlugin {
  readonly id: string;
  readonly displayName: string;
  readonly version: string;
  readonly description: string;
  readonly icon?: string;
  readonly generatorType: GeneratorType;
  readonly minHostVersion?: string;

  activate(host: PluginHost): Promise<void>;
  deactivate(): Promise<void>;
  getUIComponent(): ComponentType<PluginUIProps>;
  getSettingsSchema(): PluginSettingsSchema | null;
  onSceneChanged?(sceneId: string | null): Promise<void>;
  onContextChanged?(context: MusicalContext): void;
}

// ============================================================================
// Plugin UI Props
// ============================================================================

export interface PluginUIProps {
  host: PluginHost;
  activeSceneId: string | null;
  isAuthenticated: boolean;
  isConnected: boolean;
  deckId?: 'left' | 'right';
}

// ============================================================================
// PluginHost API
// ============================================================================

export interface PluginHost {
  createTrack(options: CreateTrackOptions): Promise<PluginTrackHandle>;
  deleteTrack(trackId: string): Promise<void>;
  getPluginTracks(): Promise<PluginTrackHandle[]>;
  getTrackInfo(trackId: string): Promise<PluginTrackInfo>;
  setTrackMute(trackId: string, muted: boolean): Promise<void>;
  setTrackVolume(trackId: string, volume: number): Promise<void>;
  setTrackPan(trackId: string, pan: number): Promise<void>;
  setTrackSolo(trackId: string, solo: boolean): Promise<void>;
  setTrackName(trackId: string, name: string): Promise<void>;

  getTrackFxState(trackId: string): Promise<PluginTrackFxDetailState>;
  toggleTrackFx(trackId: string, category: string, enabled: boolean): Promise<void>;
  setTrackFxPreset(trackId: string, category: string, presetIndex: number): Promise<{ dryWet?: number }>;
  setTrackFxDryWet(trackId: string, category: string, value: number): Promise<void>;

  onTrackStateChange(listener: TrackStateChangeListener): UnsubscribeFn;

  writeMidiClip(trackId: string, clip: MidiClipData): Promise<MidiWriteResult>;
  clearMidi(trackId: string): Promise<void>;
  postProcessMidi(notes: PluginMidiNote[], options: PostProcessOptions): Promise<PluginMidiNote[]>;

  writeAudioClip(trackId: string, filePath: string, position?: number): Promise<void>;

  loadSynthPlugin(trackId: string, pluginName: string): Promise<number>;
  setPluginState(trackId: string, pluginIndex: number, stateBase64: string): Promise<void>;
  getPluginState(trackId: string, pluginIndex: number): Promise<string>;
  getTrackPlugins(trackId: string): Promise<PluginSynthInfo[]>;
  removePlugin(trackId: string, pluginIndex: number): Promise<void>;
  isPluginAvailable(pluginName: string): Promise<boolean>;

  getGenerationContext(excludeTrackId?: string): Promise<PluginGenerationContext>;
  getMusicalContext(): Promise<MusicalContext>;
  getActiveSceneId(): string | null;
  getSceneList(): Promise<PluginSceneInfo[]>;

  onTransportEvent(listener: TransportEventListener): UnsubscribeFn;
  onDeckBoundary(listener: DeckBoundaryListener): UnsubscribeFn;
  onSceneChange(listener: SceneChangeListener): UnsubscribeFn;
  getTransportState(): Promise<PluginTransportState>;

  generateWithLLM(request: LLMGenerationRequest): Promise<LLMGenerationResult>;
  isLLMAvailable(): Promise<boolean>;

  getPresetCategories(pluginName: string): Promise<string[]>;
  getRandomPreset(category: string): Promise<PluginPresetData | null>;
  getPresetByName(category: string, name: string): Promise<PluginPresetData | null>;
  classifyPresetCategory(description: string): Promise<string>;

  getDataDirectory(): string;
  settings: PluginSettingsStore;

  getSceneData<T = unknown>(sceneId: string, key: string): Promise<T | null>;
  setSceneData(sceneId: string, key: string, value: unknown): Promise<void>;
  getAllSceneData(sceneId: string): Promise<Record<string, unknown>>;
  deleteSceneData(sceneId: string, key: string): Promise<void>;
  getProjectData<T = unknown>(key: string): Promise<T | null>;
  setProjectData(key: string, value: unknown): Promise<void>;

  showToast(type: 'info' | 'success' | 'warning' | 'error', title: string, message?: string): void;
  setProgress(trackId: string, progress: number): void;
  setStatusMessage(message: string | null): void;
  confirmAction(title: string, message: string): Promise<boolean>;

  showOpenDialog(options: PluginFileDialogOptions): Promise<string[] | null>;
  showSaveDialog(options: PluginFileDialogOptions): Promise<string | null>;
  downloadFile(url: string, filename: string, options?: PluginDownloadOptions): Promise<string>;
  importFile(sourcePath: string, destFilename: string): Promise<string>;

  httpRequest(options: PluginHttpRequestOptions): Promise<PluginHttpResponse>;

  storeSecret(key: string, value: string): Promise<void>;
  getSecret(key: string): Promise<string | null>;
  deleteSecret(key: string): Promise<void>;

  getSamples(filter?: PluginSampleFilter): Promise<PluginSampleInfo[]>;
  getSampleById(id: string): Promise<PluginSampleInfo | null>;
  importSamples(filePaths: string[]): Promise<PluginSampleImportResult>;
  createSampleTrack(sampleId: string, options?: { name?: string }): Promise<PluginTrackHandle>;
  deleteSampleTrack(trackId: string): Promise<void>;

  generateAudioTexture(request: PluginAudioTextureRequest): Promise<PluginAudioTextureResult>;
  auditionNote(trackId: string, pitch: number, velocity: number, durationMs: number): Promise<void>;

  getPluginPresets(category?: string): Promise<PluginPresetInfo[]>;
  savePluginPreset(options: SavePluginPresetOptions): Promise<PluginPresetInfo>;
  deletePluginPreset(id: string): Promise<void>;

  logMetric(name: string, durationMs: number, metadata?: Record<string, unknown>): void;
  startTimer(name: string): () => void;
}

// ============================================================================
// Track Types
// ============================================================================

export interface CreateTrackOptions {
  name?: string;
  role?: string;
  loadSynth?: boolean;
  synthName?: string;
  metadata?: Record<string, unknown>;
}

export interface PluginTrackHandle {
  id: string;
  name: string;
  dbId: string;
  role?: string;
}

export interface PluginTrackInfo extends PluginTrackHandle {
  muted: boolean;
  soloed: boolean;
  volume: number;
  pan: number;
  plugins: PluginSynthInfo[];
  hasMidi: boolean;
  hasAudio: boolean;
}

export interface PluginSynthInfo {
  index: number;
  name: string;
  type: string;
  enabled: boolean;
}

export interface PluginTrackRuntimeState {
  id: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
}

export type TrackStateChangeListener = (trackId: string, state: PluginTrackRuntimeState) => void;

// ============================================================================
// FX Types
// ============================================================================

export interface PluginFxCategoryDetailState {
  enabled: boolean;
  presetIndex: number;
  dryWet: number;
}

export type PluginTrackFxDetailState = Record<string, PluginFxCategoryDetailState>;

// ============================================================================
// MIDI Types
// ============================================================================

export interface MidiClipData {
  startTime: number;
  endTime: number;
  tempo: number;
  notes: PluginMidiNote[];
}

export interface PluginMidiNote {
  pitch: number;
  startBeat: number;
  durationBeats: number;
  velocity: number;
  channel?: number;
}

export interface MidiWriteResult {
  notesInserted: number;
  bars: number;
}

export interface PostProcessOptions {
  quantize?: boolean;
  quantizeGrid?: string;
  quantizeStrength?: number;
  swing?: number;
  humanize?: number;
  enforceScale?: boolean;
  clampRegister?: [number, number];
  removeOverlaps?: boolean;
}

// ============================================================================
// Context Types
// ============================================================================

export interface MusicalContext {
  key: string;
  mode: string;
  bpm: number;
  bars: number;
  genre: string | null;
  timeSignature: string;
  chordProgression: PluginChordTiming[];
}

export interface PluginChordTiming {
  symbol: string;
  startQn: number;
  endQn: number;
}

export interface PluginGenerationContext {
  chordProgression: {
    key: { tonic: string; mode: string };
    chordsWithTiming: PluginChordTiming[];
    genre: string | null;
  };
  concurrentTracks: PluginConcurrentTrackInfo[];
}

export interface PluginConcurrentTrackInfo {
  trackId: string;
  role: string | undefined;
  presetCategory: string | null;
  notesByChord: PluginChordSegment[];
}

export interface PluginChordSegment {
  chord: string;
  chordRangeQn: [number, number];
  notes: PluginMidiNote[];
}

// ============================================================================
// Transport Types
// ============================================================================

export interface TransportEvent {
  type: 'play' | 'stop' | 'pause' | 'bpmChange' | 'positionChange';
  bpm?: number;
  position?: number;
  isPlaying?: boolean;
}

export interface DeckBoundaryEvent {
  deckId: string;
  bar: number;
  beat: number;
  loopCount: number;
}

export interface PluginTransportState {
  isPlaying: boolean;
  isPaused: boolean;
  bpm: number;
  position: number;
  timeSignature: string;
}

export interface PluginSceneInfo {
  id: string;
  name: string;
  isMuted: boolean;
}

export type TransportEventListener = (event: TransportEvent) => void;
export type DeckBoundaryListener = (event: DeckBoundaryEvent) => void;
export type SceneChangeListener = (sceneId: string | null) => void;
export type UnsubscribeFn = () => void;

// ============================================================================
// LLM Types
// ============================================================================

export interface LLMGenerationRequest {
  system: string;
  user: string;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface LLMGenerationResult {
  content: string;
  tokensUsed: number;
  model: string;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface PluginSettingsSchema {
  type: 'object';
  properties: Record<string, SettingDefinition>;
}

export interface SettingDefinition {
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description?: string;
  default?: unknown;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
}

export interface PluginSettingsStore {
  get<T>(key: string, defaultValue: T): T;
  set(key: string, value: unknown): void;
  getAll(): Record<string, unknown>;
  onChange(listener: (key: string, value: unknown) => void): UnsubscribeFn;
}

// ============================================================================
// Preset Types
// ============================================================================

export interface PluginPresetData {
  name: string;
  category: string;
  state: string;
}

export interface PluginPresetInfo {
  id: string;
  name: string;
  category: string | null;
  isBuiltIn: boolean;
  data: Record<string, unknown>;
}

export interface SavePluginPresetOptions {
  name: string;
  category?: string;
  data: Record<string, unknown>;
}

// ============================================================================
// Manifest Types
// ============================================================================

export interface PluginManifest {
  id: string;
  displayName: string;
  version: string;
  description: string;
  generatorType: GeneratorType;
  main: string;
  renderer?: string;
  icon?: string;
  author?: string;
  license?: string;
  minHostVersion?: string;
  capabilities?: PluginCapabilities;
  settings?: Record<string, SettingDefinition>;
  builtIn?: boolean;
}

export interface PluginCapabilities {
  requiresLLM?: boolean;
  requiresSurgeXT?: boolean;
  requiresNetwork?: boolean;
  network?: { allowedHosts?: string[] };
  fileDialog?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export type PluginErrorCode =
  | 'NOT_OWNED'
  | 'TRACK_NOT_FOUND'
  | 'TRACK_LIMIT_EXCEEDED'
  | 'NO_ACTIVE_SCENE'
  | 'ENGINE_ERROR'
  | 'INVALID_MIDI'
  | 'FILE_NOT_FOUND'
  | 'INVALID_FORMAT'
  | 'PLUGIN_NOT_FOUND'
  | 'LLM_BUDGET_EXCEEDED'
  | 'LLM_UNAVAILABLE'
  | 'NOT_AUTHENTICATED'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'INCOMPATIBLE'
  | 'CAPABILITY_DENIED'
  | 'SECRET_NOT_FOUND';

export class PluginError extends Error {
  public readonly code: PluginErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: PluginErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'PluginError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// File System Types
// ============================================================================

export interface PluginFileDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  multiSelections?: boolean;
  directories?: boolean;
}

export interface PluginDownloadOptions {
  headers?: Record<string, string>;
  overwrite?: boolean;
}

// ============================================================================
// Network Types
// ============================================================================

export interface PluginHttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  timeoutMs?: number;
}

export interface PluginHttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

// ============================================================================
// Sample Types
// ============================================================================

export interface PluginSampleFilter {
  bpm?: number;
  key?: { tonic: string; mode?: string };
  category?: string;
  searchQuery?: string;
}

export interface PluginSampleInfo {
  id: string;
  filename: string;
  filePath: string;
  category: string | null;
  bpm: number | null;
  keyTonic: string | null;
  keyMode: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  tags: string[] | null;
}

export interface PluginSampleImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// ============================================================================
// Audio Generation Types
// ============================================================================

export interface PluginAudioTextureRequest {
  prompt: string;
  durationSeconds?: number;
  bpm?: number;
}

export interface PluginAudioTextureResult {
  filePath: string;
  durationSeconds: number;
}
