/**
 * @signalsandsorcery/plugin-sdk
 *
 * TypeScript types and shared utilities for building Signals & Sorcery plugins.
 *
 * Plugin authors install this package for:
 * - Type definitions (GeneratorPlugin, PluginHost, PluginUIProps, etc.)
 * - Build configuration helpers (rollup externals)
 *
 * @example
 * ```ts
 * import type { GeneratorPlugin, PluginHost, PluginUIProps } from '@signalsandsorcery/plugin-sdk';
 *
 * class MyPlugin implements GeneratorPlugin {
 *   readonly id = '@my/plugin';
 *   // ...
 * }
 * ```
 */

// ============================================================================
// Re-export all types from the canonical type definitions
// ============================================================================

// Core Plugin Interface
export type {
  GeneratorType,
  GeneratorPlugin,
  PluginUIProps,
  PluginHost,
} from './types';

// Track Types
export type {
  CreateTrackOptions,
  PluginTrackHandle,
  PluginTrackInfo,
  PluginSynthInfo,
  PluginTrackRuntimeState,
  TrackStateChangeListener,
} from './types';

// FX Types
export type {
  PluginFxCategoryDetailState,
  PluginTrackFxDetailState,
} from './types';

// MIDI Types
export type {
  MidiClipData,
  PluginMidiNote,
  MidiWriteResult,
  PostProcessOptions,
} from './types';

// Context Types
export type {
  MusicalContext,
  PluginChordTiming,
  PluginGenerationContext,
  PluginConcurrentTrackInfo,
  PluginChordSegment,
} from './types';

// Transport Types
export type {
  TransportEvent,
  DeckBoundaryEvent,
  PluginTransportState,
  PluginSceneInfo,
  TransportEventListener,
  DeckBoundaryListener,
  SceneChangeListener,
  UnsubscribeFn,
} from './types';

// LLM Types
export type {
  LLMGenerationRequest,
  LLMGenerationResult,
} from './types';

// Settings Types
export type {
  PluginSettingsSchema,
  SettingDefinition,
  PluginSettingsStore,
} from './types';

// Preset Types
export type {
  PluginPresetData,
  PluginPresetInfo,
  SavePluginPresetOptions,
} from './types';

// Manifest Types
export type {
  PluginManifest,
  PluginCapabilities,
} from './types';

// Error Types
export type { PluginErrorCode } from './types';
export { PluginError } from './types';

// File System Types
export type {
  PluginFileDialogOptions,
  PluginDownloadOptions,
} from './types';

// Network Types
export type {
  PluginHttpRequestOptions,
  PluginHttpResponse,
} from './types';

// Sample Types
export type {
  PluginSampleFilter,
  PluginSampleInfo,
  PluginSampleImportResult,
} from './types';

// Audio Types
export type {
  PluginAudioTextureRequest,
  PluginAudioTextureResult,
} from './types';

// ============================================================================
// Build Helpers
// ============================================================================

/**
 * Rollup externals configuration for plugin UMD builds.
 * Use this in your rollup.config.js:
 *
 * ```js
 * import { rollupExternals, rollupGlobals } from '@signalsandsorcery/plugin-sdk';
 *
 * export default {
 *   external: rollupExternals,
 *   output: {
 *     format: 'umd',
 *     globals: rollupGlobals,
 *     name: 'SASPlugin_my_org__my_plugin',
 *   },
 * };
 * ```
 */
export const rollupExternals: string[] = ['react', 'react-dom'];

export const rollupGlobals: Record<string, string> = {
  react: 'React',
  'react-dom': 'ReactDOM',
};
