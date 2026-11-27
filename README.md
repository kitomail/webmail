# kitomail webmail

Modified version of Bulwark Webmail 1.22.0 (https://github.com/bulwarkmail/webmail),
licensed under AGPL-3.0-only, as operated at https://mail.kitomail.com.

Changes against upstream 1.22.0:
- German informal locale ("du") as default `de`; the original formal German
  is available as "Deutsch (Sie)" (`de-formal`).
- Language picker: no grey hint beside "Deutsch (Du)" and "Deutsch (Sie)".
- Phone: a second tap on the ⋮ menu closes it.
- German wording: labels are called "Eigene Ordner", shared labels "Tags".
- Dates and times follow the interface language (`lib/utils.ts`).
- Files: the "New text file" entry is hidden.
- Calendar: default colour #9B59EE instead of blue.
- Safari: printing no longer waits for images (first Cmd+P printed blank).
- `kitomail/kitomail.css`: visual adjustments, injected by the reverse proxy
  (not part of the image).

Build:
  docker build --target runner -t kitomail/bulwark:1.22.0-du4 .

Original Bulwark README: [README.bulwark.md](README.bulwark.md)
