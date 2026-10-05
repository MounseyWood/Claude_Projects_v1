# The Thread and the Loop: Canvas version

`the-thread-and-the-loop.html` is the whole app in one file (about 184 KB). It needs no internet connection, no Claude account and no other files, so it can be uploaded to Canvas and embedded in a page with an iframe.

## Add it to a Canvas page

1. **Upload the file.** In your course, open **Files** and upload `the-thread-and-the-loop.html`. Make sure students can open it: publish it, or set it to *Only available to students with link*.
2. **Copy its address.** Click the file to preview it, right-click **Download** and choose **Copy link address**. It looks like `https://<your-canvas>/courses/12345/files/67890/download?download_frd=1`. Delete everything from the `?` onwards.
3. **Embed it.** Edit the page, open the **HTML editor** (the `</>` button) and paste the code below, replacing `COURSE_ID` and `FILE_ID` with the numbers from your link.
4. **Check it as a student.** Save, then open **Student View** on a laptop, and the page in the Canvas Student app on a phone.

```html
<iframe src="/courses/COURSE_ID/files/FILE_ID/download"
  title="The Thread and the Loop: an interactive fibre lab"
  width="100%" height="760"
  style="width: 100%; height: 85vh; min-height: 640px; border: 0;"
  allow="fullscreen" allowfullscreen="allowfullscreen"></iframe>
<p><a href="/courses/COURSE_ID/files/FILE_ID/download" target="_blank" rel="noopener">Open the fibre lab in its own tab</a> (best on a phone).</p>
```

## What to expect

- **Laptop:** the app runs in the frame. A **Full screen** button at the top left fills the screen; press it again or Esc to leave.
- **Phone:** the frame works but is cramped. Where the phone does not allow full screen from a frame (iPhone, the Canvas app), the button reads **Open in new tab** instead. The link under the frame does the same job from the Canvas page itself.
- **Height:** if Canvas removes the `style` attribute, the frame falls back to 760 pixels tall. Keep it at 640 or more; each exhibit is at least 640 pixels tall.
- **Nothing is saved.** Discoveries and the care label last until the page is closed. At the end, **Reflect and copy** copies the care label and two reflection answers as plain text. If a browser blocks copying, the text is shown selected so students can copy it themselves.
- **Accessibility:** keep the `title` on the iframe. Every gesture has a keyboard equivalent, and the tutor notes and discovery drawer are plain text.

## Set it up for independent study

Canvas cannot see what students do inside the frame, so give it something it can see.

1. **A page with a short brief above the frame.** For example: *Work through the fibre lab on your own. It takes about 20 minutes and works best on a phone: use Full screen, or open it in its own tab. At the end, press Reflect and copy, then paste your care label and answers into the discussion below.*
2. **A discussion (or journal) straight after it** where students paste what they copied. That post is the evidence of engagement, and the labels make good reading for spotting misconceptions.
3. **Module requirements:** *view* the page, then *contribute to* the discussion.

## Updating it

The source is `../index.html`. After changing it, rebuild this file and upload it again, replacing the old one so the address stays the same:

```
python3 long-chain/tools/build_canvas.py
```

Matthew Mounsey-Wood FHEA MA (RCA) LCF Alumni
