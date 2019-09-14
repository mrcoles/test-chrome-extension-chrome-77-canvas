const $ = id => document.getElementById(id);

const main = () => {
  let submitting = false;

  $("form").addEventListener(
    "submit",
    evt => {
      evt.preventDefault();
      if (submitting) {
        return;
      }
      submitting = true;

      $("indicator").style.display = "inline";
      window.setTimeout(() => {
        generate();
        $("indicator").style.display = "none";
        submitting = false;
      }, 10);
    },
    false
  );
};

const generate = () => {
  const bigCanvasHeight = $("canvas-height").value || 20000;

  const DIMS = [[2880, bigCanvasHeight]]; // , [2880, 4000]];

  const canvases = DIMS.map(([width, height]) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  });

  const imgWidth = 1440;
  const imgHeight = 700;

  const imgs = ["orange", "yellow"].map(color => {
    const canvas = document.createElement("canvas");
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  });

  canvases.forEach(canvas => {
    let i = 0;
    for (let x = 0; x < canvas.width; x += imgWidth) {
      let j = 0;
      for (let y = 0; y < canvas.height; y += imgHeight) {
        canvas.getContext("2d").drawImage(imgs[(i + j) % 2], x, y);
        j++;
      }
      i++;
    }
  });

  Promise.all(canvases.map(canvas => _toBlob(canvas)))
    .then(blobs => blobs.map(blob => URL.createObjectURL(blob)))
    .then(urls => {
      const headers = $("headers");
      headers.innerHTML = urls
        .map(
          (url, i) =>
            `<h3 class="col">canvas ${i + 1} (${DIMS[i][0]} x ${DIMS[i][1]}px)`
        )
        .join("");

      const content = $("content");
      content.innerHTML = urls
        .map(
          url =>
            `<div class="col"><img style="max-width: 100%; outline: 1px solid #000" src="${url}" /></div>`
        )
        .join("");
    })
    .catch(err => console.error(err));
};

// Helpers

const _toBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => resolve(blob), mimeType, quality);
  });

//

main();
