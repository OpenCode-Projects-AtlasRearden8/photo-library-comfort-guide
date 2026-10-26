# Naming and Dating Scans

Old prints, slides, and documents have no clock inside them. When they become digital files, *you* are the clock — and if you name and date them well now, they will sort themselves correctly in every app, forever. This is the single highest-payoff chore in the whole project, because it converts a shoebox of mystery into a timeline your grandchildren can actually navigate.

## The naming pattern

One pattern, used consistently, beats a clever system abandoned everywhere:

```text
YYYY-MM-DD_subject_source
```

Three real examples:

```text
1987-06-14_family-beach-trip_store-scan
199X-00-01_grandpa-harold_00-date-unknown
1959-spring_school-photo_classroom-scan
```

Why each piece earns its place:

- **The date leads**, so files sort chronologically in every tool ever made, with zero special software.
- **The subject follows** in a few words, lowercase with dashes, because spacing and capitals get mangled across devices and platforms.
- **The source comes last** and never collides: which box, scanner, camera, or aunt this arrived from.

You do not need to rename photos you took yourself — phones already stamp those. This pattern is for scans, downloaded family relics, and anything whose birthday you know best.

## What about unknown dates?

Old photos often have no date anywhere. Handle it in layers:

| What you know | What to write | Example |
|---|---|---|
| Exact date | Full ISO date | `1987-06-14_` |
| Year only | Year, then season or month best-guess | `1959-spring_` or `1972-08_` |
| Decade only | Decade, then zeros | `199X-00-emigration-day_` |
| Nothing | Use the era's style and say so | `date-unknown_wedding-portrait_courier-scan` |

A guess is not a sin if it's labeled as one. Future-you can correct a guess; future-you cannot resurrect an ambiguous filename. If the photo may have come from a tiny window — your grandmother's apparent age, the car model in the background — add the reasoning to the file's description field in your photo app, where it travels with the image.

## Setting the real date in your photo app

Filenames are for storage; the photo app listens to dates too. After importing a scan:

1. Find the *adjust date* or *set date* option in your gallery or photo editor (most desktop and phone apps have one).
2. Use the exact date if you know it; otherwise use the first of the month, or January 1st for year-only guesses, consistently — a consistent rule beats an accurate one you can't keep.
3. Verify by searching: type the year and see if the photo shows up in the timeline where you expect.

Scans with a proper date will rise to the top of conversations ("this was June 1987!") instead of being orphaned in a folder called `new scans 072`.

## The scanning workflow, in small honest sessions

Scanning shoeboxes is a series of small wins, and the [low-energy path](00-start-here.md#a-note-on-energy-and-focus) applies more here than anywhere:

- **One batch at a time.** 25 photos, or one folder, or one decade. Stop while it still feels easy.
- **Prepare the path first.** Wipe dust off the glass every batch; dust becomes a permanent guest in the digital copy. Wash and fully dry hands; cotton gloves optional but careful handling never is.
- **Phone-scan apps are fine.** A flatbed scanner still produces the best results for fragile prints, but modern phone-scanning apps with edge detection and glare reduction are honestly good — especially for snapshots still glued into old album pages.
- **Name as you scan.** The moment a batch is done, name and date it before it joins the roll. An unnamed scan folder is just the shoebox again, but heavier.
- **Verify by count.** Count prints before, count files after. A missing file is a surprise you want *today*, not in a decade. (Your sibling project [backup-basics-handbook](glossary.md#backup-basics-handbook) calls this spot-checking, and it applies to every archive you make.)

## Should you scan the back of every photo?

Usually no. Only remind yourself of two exceptions:

- **There is writing on the back.** Names, dates, "from Harold" — that handwriting is data. Scan it once, then transcribe the words into the photo's description or filename while you stand there.
- **The back says where or when in the photo.** Stamps and photo-lab dates ("PROCESSED JUL 84") pin looser dates into place. Transcribe rather than archive the stamp itself.

One extra scan per handwritten back, named with `_back-` appended to the front-side filename, keeps the pair linked:

```text
1952-00-01_annas-birthday_store-scan
1952-00-01_annas-birthday_store-scan_back
```

Everything else on paper stays in its acid-free sleeve, labeled, in the archive box. Scanning is not the preservation step — [two-copies](05-cloud-or-drive.md#the-two-copies-rule) are.
