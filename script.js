function resizeAllImages(factor) {
  const images = document.querySelectorAll(
    ".media-images.media-images--config-dynamic .media-images__image"
  );
  console.log('Jumlah gambar ditemukan:', images.length);
  images.forEach((image) => {
    if (image.complete && image.naturalWidth !== 0) {
      adjustImageWidth(image, factor);
    } else {
      image.addEventListener('load', () => {
        console.log('Gambar dimuat:', image.src);
        adjustImageWidth(image, factor);
      });
      image.addEventListener('error', () => {
        console.error('Gagal memuat gambar:', image.src);
        alert('Gagal memuat gambar: ' + image.src);
      });
    }
  });
}

function adjustImageWidth(image, factor) {
  const widthBase = 50;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  image.width = Math.pow(imageRatio, factor) * widthBase;
  image.dataset.scaleFactor = factor;
}

function downloadAsPng() {
  const ul = document.querySelector('.media-images.media-images--config-dynamic');
  const images = document.querySelectorAll('.media-images__image');
  if (images.length === 0) {
    alert('Tidak ada gambar untuk diunduh.');
    return;
  }

  const resolutionMultiplier = 2;
  const ulRect = ul.getBoundingClientRect();
  let maxX = 0;
  let maxY = 0;
  images.forEach((image) => {
    const rect = image.getBoundingClientRect();
    const right = rect.right - ulRect.left;
    const bottom = rect.bottom - ulRect.top;
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = maxX * resolutionMultiplier + 20;
  canvas.height = maxY * resolutionMultiplier + 20;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  images.forEach((image) => {
    const rect = image.getBoundingClientRect();
    const x = (rect.left - ulRect.left) * resolutionMultiplier;
    const y = (rect.top - ulRect.top) * resolutionMultiplier;
    const factor = parseFloat(image.dataset.scaleFactor) || 0.5;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const baseWidth = 50;
    const scaledWidth = Math.pow(imageRatio, factor) * baseWidth * resolutionMultiplier;
    const scaledHeight = scaledWidth / imageRatio;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  });

  const link = document.createElement('a');
  link.download = 'gambar-gabungan.png';
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

const slider = document.getElementById('scale');
const scaleValueInput = document.getElementById('scale-value');
const bgColorInput = document.getElementById('bg-color');
const downloadButton = document.getElementById('download');
const fileUpload = document.getElementById('file-upload');
const mediaList = document.querySelector('.media-images.media-images--config-dynamic');

// Inisialisasi tombol hapus dan drag and drop
function initializeDeleteAndDrag() {
  const items = document.querySelectorAll('.media-images__item');
  console.log('Inisialisasi tombol hapus dan drag:', items.length);
  items.forEach(item => {
    const deleteButton = item.querySelector('.delete-button');
    if (deleteButton) {
      deleteButton.removeEventListener('click', handleDelete);
      deleteButton.addEventListener('click', handleDelete);
    }

    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('dragenter', handleDragEnter);
    item.removeEventListener('drop', handleDrop);
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(event) {
  const item = event.target.closest('.media-images__item');
  event.dataTransfer.setData('text/plain', item.dataset.filepath);
  item.classList.add('dragging');
  console.log('Drag dimulai untuk:', item.dataset.filepath);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDragEnter(event) {
  event.preventDefault();
  const item = event.target.closest('.media-images__item');
  if (item) {
    item.classList.add('drag-over');
  }
}

function handleDrop(event) {
  event.preventDefault();
  const draggedFilepath = event.dataTransfer.getData('text/plain');
  const draggedItem = document.querySelector(`.media-images__item[data-filepath="${draggedFilepath}"]`);
  const targetItem = event.target.closest('.media-images__item');

  if (draggedItem && targetItem && draggedItem !== targetItem) {
    const items = Array.from(mediaList.querySelectorAll('.media-images__item'));
    const draggedIndex = items.indexOf(draggedItem);
    const targetIndex = items.indexOf(targetItem);

    if (draggedIndex < targetIndex) {
      targetItem.after(draggedItem);
    } else {
      targetItem.before(draggedItem);
    }
    console.log(`Gambar ${draggedFilepath} dipindahkan ke posisi setelah/before ${targetItem.dataset.filepath}`);
    items.forEach(item => item.classList.remove('drag-over', 'dragging'));
    initializeDeleteAndDrag();
  }
}

function handleDelete(event) {
  const li = event.target.closest('.media-images__item');
  const filepath = li.dataset.filepath;
  console.log('Mengirim permintaan hapus untuk:', filepath);
  fetch('delete.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: filepath })
  })
  .then(response => {
    console.log('Status respons hapus untuk', filepath, ':', response.status, response.statusText);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Data respons hapus untuk', filepath, ':', data);
    if (data.success) {
      li.remove();
      console.log('Gambar dihapus dari DOM:', filepath);
      const images = mediaList.querySelectorAll('.media-images__image');
      if (images.length === 0) {
        const noImagesLi = document.createElement('li');
        noImagesLi.className = 'no-images';
        noImagesLi.textContent = 'Tidak ada gambar yang ditemukan di folder images.';
        mediaList.appendChild(noImagesLi);
      }
    } else {
      alert(data.message);
      console.error('Gagal menghapus:', data.message);
    }
  })
  .catch(error => {
    console.error('Kesalahan saat menghapus', filepath, ':', error);
    alert('Gagal menghapus gambar: ' + error.message);
    li.remove();
    const images = mediaList.querySelectorAll('.media-images__image');
    if (images.length === 0) {
      const noImagesLi = document.createElement('li');
      noImagesLi.className = 'no-images';
      noImagesLi.textContent = 'Tidak ada gambar yang ditemukan di folder images.';
      mediaList.appendChild(noImagesLi);
    }
  });
}

// Sinkronkan slider dan input teks
slider.addEventListener('input', (event) => {
  const value = event.target.valueAsNumber;
  scaleValueInput.value = value.toFixed(3);
  resizeAllImages(value);
  console.log('Skala diubah dari slider:', value);
});

scaleValueInput.addEventListener('input', (event) => {
  let value = parseFloat(event.target.value);
  if (isNaN(value) || value < 0 || value > 1) {
    value = Math.max(0, Math.min(1, value || 0));
    event.target.value = value.toFixed(3);
  }
  slider.value = value;
  resizeAllImages(value);
  console.log('Skala diubah dari input teks:', value);
});

scaleValueInput.addEventListener('change', (event) => {
  let value = parseFloat(event.target.value);
  if (isNaN(value) || value < 0 || value > 1) {
    value = Math.max(0, Math.min(1, value || 0));
    event.target.value = value.toFixed(3);
  }
  slider.value = value;
  resizeAllImages(value);
  console.log('Skala dikonfirmasi dari input teks:', value);
});

bgColorInput.addEventListener('input', (event) => {
  document.body.style.backgroundColor = event.target.value;
  console.log('Warna latar diubah menjadi:', event.target.value);
});

downloadButton.addEventListener('click', downloadAsPng);

fileUpload.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  console.log('File dipilih:', files.map(f => f.name));
  if (files.length === 0 || !files.every(file => file.type.startsWith('image/'))) {
    alert('Silakan pilih file gambar yang valid.');
    return;
  }

  const noImagesMsg = mediaList.querySelector('.no-images');
  if (noImagesMsg) {
    noImagesMsg.remove();
  }

  files.forEach(file => {
    const formData = new FormData();
    formData.append('file-upload', file);
    console.log('Mengirim file ke upload.php:', file.name);
    fetch('upload.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      console.log('Status respons untuk', file.name, ':', response.status, response.statusText);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Data respons untuk', file.name, ':', data);
      if (data.success) {
        const li = document.createElement('li');
        li.className = 'media-images__item';
        li.dataset.filepath = data.filename;
        li.setAttribute('draggable', 'true');
        const img = document.createElement('img');
        img.className = 'media-images__image';
        img.src = data.filePath + '?t=' + new Date().getTime();
        img.alt = data.altText;
        img.addEventListener('load', () => {
          console.log('Gambar baru dimuat:', img.src);
          resizeAllImages(slider.valueAsNumber);
        });
        img.addEventListener('error', () => {
          console.error('Gagal memuat gambar baru:', img.src);
          alert('Gagal memuat gambar: ' + img.src);
          const reader = new FileReader();
          reader.onload = function(e) {
            img.src = e.target.result;
            console.log('Menggunakan pratinjau client-side untuk:', file.name);
            resizeAllImages(slider.valueAsNumber);
          };
          reader.readAsDataURL(file);
        });
        li.appendChild(img);
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.title = 'Hapus gambar';
        deleteButton.textContent = '✕';
        deleteButton.addEventListener('click', handleDelete);
        li.appendChild(deleteButton);
        mediaList.appendChild(li);
        console.log('Gambar ditambahkan ke DOM:', img.src, 'dengan data-filepath:', li.dataset.filepath);
        initializeDeleteAndDrag();
      } else {
        alert(data.message);
        console.error('Gagal mengunggah:', file.name, data.message);
      }
    })
    .catch(error => {
      console.error('Kesalahan saat mengunggah:', file.name, error);
      alert('Terjadi kesalahan saat mengunggah file ' + file.name + ': ' + error.message);
      const reader = new FileReader();
      reader.onload = function(e) {
        const li = document.createElement('li');
        li.className = 'media-images__item';
        li.setAttribute('draggable', 'true');
        const img = document.createElement('img');
        img.className = 'media-images__image';
        img.src = e.target.result;
        img.alt = file.name;
        li.appendChild(img);
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.title = 'Hapus gambar';
        deleteButton.textContent = '✕';
        deleteButton.addEventListener('click', () => {
          li.remove();
          console.log('Gambar client-side dihapus:', file.name);
          const images = mediaList.querySelectorAll('.media-images__image');
          if (images.length === 0) {
            const noImagesLi = document.createElement('li');
            noImagesLi.className = 'no-images';
            noImagesLi.textContent = 'Tidak ada gambar yang ditemukan di folder images.';
            mediaList.appendChild(noImagesLi);
          }
        });
        li.appendChild(deleteButton);
        mediaList.appendChild(li);
        console.log('Pratinjau client-side ditambahkan:', file.name);
        initializeDeleteAndDrag();
        resizeAllImages(slider.valueAsNumber);
      };
      reader.readAsDataURL(file);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  resizeAllImages(slider.valueAsNumber);
  scaleValueInput.value = slider.valueAsNumber.toFixed(3);
  initializeDeleteAndDrag();
});