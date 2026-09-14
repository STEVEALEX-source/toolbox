# Toolbox

A small browser toolbox for everyday tasks.

Toolbox keeps useful utilities in one place without requiring an account, installation, or a backend. Tasks, notes, habits, and theme preferences are saved locally in the browser.

## Features

| Tool | Purpose |
| --- | --- |
| Focus Timer | Work with five, fifteen, twenty five, and fifty minute presets |
| Tasks | Create, complete, delete, and clear tasks |
| Notes | Write notes that save automatically and download as text |
| Passwords | Generate configurable passwords with a strength indicator |
| Converter | Convert length, weight, temperature, data, and time |
| Customs Duty | Estimate duty, tax, and landed cost |
| Color Picker | Copy HEX, RGB, and HSL values |
| Calculator | Perform basic arithmetic with decimals and backspace |
| Random Picker | Choose one option from a newline separated list |
| Habit Check | Track a habit across the last seven days |

## Interface

The interface uses a soft pastel palette, handwritten typography, paper inspired surfaces, and a lightweight 3D canvas background.

The background includes floating wireframe objects, depth movement, pointer parallax, and click particle bursts. The foreground stays focused on the tools and remains usable while the scene moves behind it.

Dark mode uses a separate charcoal and slate palette with muted pastel accents for comfortable night use.

## Navigation

The page includes breadcrumb navigation with live section status.

Tools can be opened directly with a URL parameter.

```text
?tool=calculator
?tool=habits
?tool=picker
```

Browser back and forward navigation restores the correct modal state.

## Accessibility

Tool cards, tool icons, and card arrows support mouse and keyboard interaction.

Modal dialogs move focus into the active tool and return focus to the original card after closing.

The Escape key closes an open modal.

Theme state is exposed through an accessible pressed state.

Reduced motion preferences disable the most intense animations and hide the 3D canvas scene.

## Local storage

The following values are stored in the browser through local storage.

| Value | Storage key |
| --- | --- |
| Tasks | `tasks` |
| Notes | `notes` |
| Habit data | `toolbox habit` |
| Theme preference | `theme` |

No server is required for the current frontend version.

## Running locally

1. Download or clone the repository.
2. Open `index.html` in a browser.
3. For a local server, run the following command from the project directory.

```bash
python3 -m http.server 8000
```

4. Visit `http://localhost:8000` in your browser.

## Project files

| File | Description |
| --- | --- |
| `index.html` | Main page structure and tool cards |
| `style.css` | Layout, pastel themes, responsive rules, modal styles, and 3D presentation |
| `script.js` | Tool behavior, storage, navigation, animation, and canvas scene |
| `404.html` | Custom not found page |

## Deployment

This is a static frontend and can be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any server that serves HTML, CSS, and JavaScript files.

Set `index.html` as the main entry page. Configure `404.html` as the not found page when the hosting provider supports custom error documents.

## Planned cloud mode

The anonymous local mode is the default.

Supabase is the planned backend for a future authenticated mode. That mode will add account sign in, cloud synchronization, user owned records, row level security, and migration from local storage.

Cloud mode is not enabled until a Supabase project URL, public anon key, database schema, and security policies are configured.

## Disclaimer

The customs duty tool provides a rough estimate using simplified example rates. It is not official tax or customs advice. Verify current charges with the relevant customs authority or carrier.

## License

Add the license that matches your intended use before publishing the repository.

## Author

Built as a small experiment in useful browser tools, hand drawn interface design, and interactive canvas graphics.
