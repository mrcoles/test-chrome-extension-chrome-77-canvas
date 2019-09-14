# Chrome 77 Large Blank Canvas Issues

The popup.js file here copies the result of `chrome.tabs.capturVisibleTab(...)` numerous times across one large canvas and one small canvas and then opens them in a new about:blank tab as images. I am seeing it non-deterministically leading to a blank 2nd canvas.

Separately, I added /test.html (right-click the extension and select options), this creates just one large canvas by drawing rectangles on it. This breaks for me, yielding a blank result, somewhere between 16000px and 18000px tall. This scenario can also be run outside of a Chrome extension and gets the same result.

In both scenarios, I am drawing on an HTMLCanvasElement and then turning it into a Blob and then generating a URL for that blob.
