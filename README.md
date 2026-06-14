# Ableton Live Extensions

Custom extensions for **Ableton Live 12** built with the official [Ableton Extensions SDK](https://www.ableton.com/extensions) (Beta).

---

## Extensions

| Extension | Install | Source |
| --- | --- | --- |
| [Cue Templates](#cue-templates) | [⬇ cue-templates.ablx](cue-templates/cue-templates.ablx) | [⬇ cue-templates-source.zip](cue-templates/cue-templates-source.zip) |
| [Snare Roll Builder](#snare-roll-builder) | [⬇ snare-roll-builder.ablx](snare-roll-builder/snare-roll-builder.ablx) | [⬇ snare-roll-builder-source.zip](snare-roll-builder/snare-roll-builder-source.zip) |

---

### Cue Templates

> Drop pre-built cue marker sets into your arrangement in one click — choose from 6 built-in genre templates or create and manage your own.

Based on [xmllint/ableton-cue-templates](https://github.com/xmllint/ableton-cue-templates), extended with custom genre template management, persistent storage, and a redesigned UI.

| | |
| --- | --- |
| **Version** | 0.1.0 |
| **Requires** | Ableton Live 12.2+ |
| **Platform** | macOS / Windows |

Features:

- 6 built-in genre templates (House, Techno, Drum & Bass, Hip Hop, Ambient, Pop)
- Custom genre templates — create, edit, and reorder your own section layouts
- Import sections from existing cue points in your arrangement
- Drag-and-drop section reorder
- Persists custom templates across Live restarts

**[⬇ Download cue-templates.ablx](cue-templates/cue-templates.ablx)** · **[⬇ Source + .ablx (ZIP)](cue-templates/cue-templates-source.zip)**

> Full development history: [shatakaan/ableton-extensions](https://github.com/shatakaan/ableton-extensions)

---

### Snare Roll Builder

> Generate genre-specific snare rolls directly into a MIDI clip — right-click any clip slot and choose your genre.

| | |
| --- | --- |
| **Version** | 0.1.0 |
| **Requires** | Ableton Live 12.2+ |
| **Platform** | macOS / Windows |

Features:

- 8 genre presets: House / Tech House, Techno, Drum & Bass, Trap, Hip-Hop, Hard House, Hard Techno, Hard Dance
- Full parameter control: roll length (1/2/4 bars), start/end subdivision (8th/16th/32nd), acceleration (linear/exponential/step)
- Velocity ramp with linear or exponential curve, humanize with adjustable amount
- Pitch rise across the roll, configurable MIDI note
- Target: existing MIDI clip or new clip in slot

**[⬇ Download snare-roll-builder.ablx](snare-roll-builder/snare-roll-builder.ablx)** · **[⬇ Source + .ablx (ZIP)](snare-roll-builder/snare-roll-builder-source.zip)**

> Full development history: [shatakaan/ableton-extensions](https://github.com/shatakaan/ableton-extensions)

---

## Installation

1. Download the `.ablx` file for the extension you want.
2. Open **Ableton Live 12** → **Preferences** → **Extensions**.
3. Drag the `.ablx` file into the Extensions panel, or click **Install Extension**.
4. Restart Live.

The extension will appear in the Extensions sidebar.

---

## Build from Source

Each extension folder contains a standard TypeScript project:

```bash
cd cue-templates
npm install
npm run build       # compiles src/extension.ts → dist/extension.js
```

To package as `.ablx`:

```bash
zip cue-templates.ablx manifest.json dist/extension.js
```

---

## Design System

All extensions follow the **Electric Dark** design system defined in [`design/DESIGN.md`](design/DESIGN.md) — high-contrast dark UI optimized for studio environments.

---

## License

MIT
