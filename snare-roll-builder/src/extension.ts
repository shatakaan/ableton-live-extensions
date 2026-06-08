import {
  initialize,
  type ActivationContext,
  type Handle,
  ClipSlot,
  MidiClip,
} from "@ableton-extensions/sdk";
import { generateNotes, type RollConfig } from "./generator.js";
import panelTemplate from "./panel.html";

function flog(msg: string): void { console.log(msg); }

interface GenrePreset {
  id: string;
  label: string;
  defaults: Omit<RollConfig, 'targetMode'>;
}

const PRESETS: GenrePreset[] = [
  { id: 'house',      label: 'House / Tech House', defaults: { midiNote:38, rollLength:2, startSubdivision:'16th', endSubdivision:'32nd', acceleration:'linear',      velocityStart:40, velocityEnd:127, velocityCurve:'linear',      pitchRise:0, humanize:true, humanizeAmount:0.15 } },
  { id: 'techno',     label: 'Techno',             defaults: { midiNote:38, rollLength:4, startSubdivision:'16th', endSubdivision:'16th', acceleration:'linear',      velocityStart:20, velocityEnd:127, velocityCurve:'linear',      pitchRise:2, humanize:true, humanizeAmount:0.05 } },
  { id: 'dnb',        label: 'Drum & Bass',        defaults: { midiNote:38, rollLength:1, startSubdivision:'32nd', endSubdivision:'32nd', acceleration:'exponential', velocityStart:50, velocityEnd:127, velocityCurve:'linear',      pitchRise:0, humanize:true, humanizeAmount:0.20 } },
  { id: 'trap',       label: 'Trap',               defaults: { midiNote:38, rollLength:1, startSubdivision:'16th', endSubdivision:'32nd', acceleration:'exponential', velocityStart:30, velocityEnd:127, velocityCurve:'exponential', pitchRise:0, humanize:true, humanizeAmount:0.25 } },
  { id: 'hiphop',     label: 'Hip-Hop',            defaults: { midiNote:38, rollLength:2, startSubdivision:'16th', endSubdivision:'16th', acceleration:'linear',      velocityStart:60, velocityEnd:127, velocityCurve:'linear',      pitchRise:0, humanize:true, humanizeAmount:0.30 } },
  { id: 'hardhouse',  label: 'Hard House',         defaults: { midiNote:38, rollLength:2, startSubdivision:'16th', endSubdivision:'32nd', acceleration:'exponential', velocityStart:40, velocityEnd:127, velocityCurve:'exponential', pitchRise:5, humanize:true, humanizeAmount:0.05 } },
  { id: 'hardtechno', label: 'Hard Techno',        defaults: { midiNote:38, rollLength:2, startSubdivision:'16th', endSubdivision:'32nd', acceleration:'exponential', velocityStart:30, velocityEnd:127, velocityCurve:'exponential', pitchRise:3, humanize:true, humanizeAmount:0.05 } },
  { id: 'harddance',  label: 'Hard Dance',         defaults: { midiNote:38, rollLength:1, startSubdivision:'16th', endSubdivision:'32nd', acceleration:'exponential', velocityStart:50, velocityEnd:127, velocityCurve:'exponential', pitchRise:0, humanize:true, humanizeAmount:0.10 } },
];

type Status = { ok: boolean; text: string };

function buildPanelUrl(status?: Status): string {
  const statusHtml = status
    ? `<div class="status-${status.ok ? 'ok' : 'err'}">${status.text}</div>`
    : '';
  const html = panelTemplate
    .replace('__PRESETS_JSON__', JSON.stringify(PRESETS))
    .replace('__STATUS_HTML__', statusHtml);
  return `data:text/html,${encodeURIComponent(html)}`;
}

export function activate(activation: ActivationContext) {
  flog('[SnareRoll] activate() called');

  setTimeout(async () => {
    try {
      const context = initialize(activation, '1.0.0');
      const CMD = 'snareRoll.open';

      await context.ui.registerContextMenuAction('ClipSlot', 'Snare Roll einfügen…', CMD);
      flog('[SnareRoll] Context menu registered');

      context.commands.registerCommand(CMD, (...args: unknown[]) =>
        void (async () => {
          const handle = args[0] as Handle;
          const slot = context.getObjectFromHandle(handle, ClipSlot);
          flog('[SnareRoll] CMD fired on ClipSlot');

          let status: Status | undefined = undefined;

          while (true) {
            const raw = await context.ui.showModalDialog(buildPanelUrl(status), 420, 660);
            if (!raw) { flog('[SnareRoll] Cancelled'); return; }

            let msg: { action: 'generate' | 'cancel'; config?: Omit<RollConfig, 'targetMode'>; targetMode?: 'selected' | 'new' };
            try {
              msg = JSON.parse(raw) as typeof msg;
            } catch {
              status = { ok: false, text: 'Interner Fehler: ungültiges JSON' };
              continue;
            }

            if (msg.action === 'cancel') { flog('[SnareRoll] User cancelled'); return; }

            if (msg.action === 'generate' && msg.config !== undefined && msg.targetMode !== undefined) {
              const fullConfig: RollConfig = { ...msg.config, targetMode: msg.targetMode };

              try {
                const totalBeats = fullConfig.rollLength * 4;
                let midiClip: MidiClip<'1.0.0'>;

                if (fullConfig.targetMode === 'new') {
                  midiClip = await slot.createMidiClip(totalBeats);
                  flog('[SnareRoll] New MIDI clip created');
                } else {
                  const existing = slot.clip;
                  if (existing === null) { status = { ok: false, text: 'Fehler: Kein Clip im Slot' }; continue; }
                  if (!(existing instanceof MidiClip)) { status = { ok: false, text: 'Fehler: Kein MIDI-Clip' }; continue; }
                  midiClip = existing;
                }

                const notes = generateNotes(fullConfig);
                midiClip.notes = notes;
                flog(`[SnareRoll] Wrote ${notes.length} notes`);
                status = { ok: true, text: `✓ ${notes.length} Noten generiert` };
              } catch (err) {
                status = { ok: false, text: `Fehler: ${String(err)}` };
                flog('[SnareRoll] Generate error: ' + String(err));
              }
            } else {
              status = { ok: false, text: 'Unbekannte Aktion' };
            }
          }
        })().catch((err) => flog('[SnareRoll] Command error: ' + String(err)))
      );

      flog('[SnareRoll] Ready');
    } catch (err) {
      flog('[SnareRoll] activate() crashed: ' + String(err));
    }
  }, 500);
}
