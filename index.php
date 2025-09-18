<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Formula Normalisasi Gambar Proporsional</title>
  <link rel="stylesheet" href="https://public.codepenassets.com/css/normalize-5.0.0.min.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <div class="controls">
    <input id="scale" type="range" min="0" max="1" step="0.001" value="0.5">
    <input id="scale-value" type="number" min="0" max="1" step="0.001" value="0.5">
    <label for="bg-color">Warna Latar:</label>
    <input id="bg-color" type="color" value="#ffffff">
    <button id="download">Unduh sebagai PNG</button>
  </div>

  <label for="file-upload" class="upload-button">
    <svg class="upload-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    Unggah Gambar
  </label>
  <input id="file-upload" type="file" accept="image/*" multiple style="display: none;">

  <ul class="media-images media-images--config-dynamic">
    <?php
$imagesDir = 'images/';
if (!is_dir($imagesDir)) {
  echo '<li class="no-images">Kesalahan: Folder gambar tidak ditemukan.</li>';
} else {
  $imageFiles = glob($imagesDir . '*.{png,jpg,jpeg,gif,svg}', GLOB_BRACE);
  
  sort($imageFiles, SORT_NATURAL | SORT_FLAG_CASE);

  if (empty($imageFiles)) {
    echo '<li class="no-images">Tidak ada gambar yang ditemukan di folder images.</li>';
  } else {
    foreach ($imageFiles as $file) {
      $filename = basename($file);
      $altText = htmlspecialchars(pathinfo($filename, PATHINFO_FILENAME), ENT_QUOTES, 'UTF-8');
      echo "<li class=\"media-images__item\" data-filepath=\"$filename\" draggable=\"true\">";
      echo "<img class=\"media-images__image\" src=\"$file?t=" . time() . "\" alt=\"$altText\" />";
      echo "<button class=\"delete-button\" title=\"Hapus gambar\">✕</button>";
      echo "</li>";
    }
  }
}
?>
  </ul>

  <script src="./script.js"></script>
</body>
</html>