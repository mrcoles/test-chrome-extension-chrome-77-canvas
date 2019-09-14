const DIMS = [[2880, 28800], [2880, 4000]];

const canvases = DIMS.map(([width, height]) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
});

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  chrome.tabs.captureVisibleTab(
    null,
    { format: "png", quality: 100 },
    dataURI => {
      let err = chrome.runtime.lastError;
      if (err) {
        return _log(err.message);
      }

      _loadImg(dataURI)
        .then(img => {
          const { width, height } = img;

          canvases.forEach(canvas => {
            for (let x = 0; x < canvas.width; x += width) {
              for (let y = 0; y < canvas.height; y += height) {
                canvas.getContext("2d").drawImage(img, x, y);
              }
            }
          });

          return Promise.all(
            canvases.map(canvas => _toBlob(canvas, "image/png", 1))
          );
        })
        .then(blobs => blobs.map(blob => URL.createObjectURL(blob)))
        .then(urls => {
          const w = _newWindow();
          const body = w.document.body;

          const rowStyle =
            "display: flex; align-items: flex-start; padding: 0 20px; margin: 20px 0;";
          const colStyle =
            "box-sizing :border-box; width: 50%; padding: 0 20px;";

          body.innerHTML = `
  <div style="${rowStyle}">
    ${urls.map((url, i) => `<h3 style="${colStyle}">canvas ${i + 1}`).join("")}
  </div>
  <div style="${rowStyle}">
    ${urls
      .map(
        url =>
          `<div style="${colStyle}"><img style="max-width:100%; border: 1px solid #000" src=${url} /></div>`
      )
      .join("")}
  </div>`;
        });
    }
  );
});

// Helpers

const _newWindow = () => {
  let w = window.open("about:blank", "_blank");
  let html = w.document.documentElement;
  let body = w.document.body;

  html.style.margin = 0;
  html.style.padding = 0;
  body.style.margin = 0;
  body.style.padding = 0;

  return w;
};

const _log = msg => {
  let elt = document.createElement("p");
  elt.innerText = msg;
  elt.style.color = "red";
  document.getElementById("msgs").appendChild(elt);
};

const _loadImg = url =>
  new Promise((resolve, reject) => {
    let img = document.createElement("img");
    img.onload = () => resolve(img);
    img.onerror = e => {
      e.name = "LoadImageError";
      reject(e);
    };
    img.src = url;
  });

const _toBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => resolve(blob), mimeType, quality);
  });
