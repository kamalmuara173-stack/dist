<?php
header('Content-Type: application/json');

$imagesDir = 'images/';
$response = ['success' => false, 'message' => ''];

if (!is_dir($imagesDir)) {
  if (!mkdir($imagesDir, 0755, true)) {
    $response['message'] = 'Gagal membuat folder images/';
    error_log('Gagal membuat folder: ' . $imagesDir);
    echo json_encode($response);
    exit;
  }
}

if (isset($_FILES['file-upload']) && $_FILES['file-upload']['error'] === UPLOAD_ERR_OK) {
  $file = $_FILES['file-upload'];
  $allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
  $maxFileSize = 5 * 1024 * 1024; // 5MB
  
  error_log('File diterima: ' . print_r($file, true));
  
  if (!in_array($file['type'], $allowedTypes)) {
    $response['message'] = 'Tipe file tidak valid. Hanya PNG, JPEG, GIF, dan SVG yang diizinkan.';
    error_log('Tipe file tidak valid: ' . $file['type']);
  } elseif ($file['size'] > $maxFileSize) {
    $response['message'] = 'Ukuran file terlalu besar. Maksimum 5MB.';
    error_log('Ukuran file terlalu besar: ' . $file['size']);
  } else {
    $originalName = basename($file['name']);
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    $filename = $originalName;
    $destination = $imagesDir . $filename;
    
    // Tangani konflik nama file
    $counter = 1;
    while (file_exists($destination)) {
      $filename = $baseName . '-' . $counter . '.' . $extension;
      $destination = $imagesDir . $filename;
      $counter++;
    }
    
    if (move_uploaded_file($file['tmp_name'], $destination)) {
      $response['success'] = true;
      $response['message'] = 'File berhasil diunggah';
      $response['filePath'] = $destination;
      $response['filename'] = $filename;
      $response['altText'] = htmlspecialchars($baseName, ENT_QUOTES, 'UTF-8');
    } else {
      $response['message'] = 'Gagal memindahkan file yang diunggah';
      error_log('Gagal memindahkan file ke: ' . $destination);
    }
  }
} else {
  $error = isset($_FILES['file-upload']) ? $_FILES['file-upload']['error'] : 'Tidak ada file';
  $response['message'] = 'Tidak ada file yang diunggah atau terjadi kesalahan: ' . $error;
  error_log('Kesalahan unggah: ' . $error);
}

echo json_encode($response);