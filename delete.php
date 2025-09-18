<?php
header('Content-Type: application/json');

$imagesDir = 'images/';
$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $filename = $data['filename'] ?? '';

  if (!$filename) {
    $response['message'] = 'Nama file tidak diberikan';
    error_log('Kesalahan hapus: Nama file tidak diberikan');
    echo json_encode($response);
    exit;
  }

  $filePath = $imagesDir . $filename;
  if (file_exists($filePath) && is_writable($filePath)) {
    if (unlink($filePath)) {
      $response['success'] = true;
      $response['message'] = 'File berhasil dihapus';
      error_log('File berhasil dihapus: ' . $filePath);
    } else {
      $response['message'] = 'Gagal menghapus file';
      error_log('Gagal menghapus file: ' . $filePath);
    }
  } else {
    $response['message'] = 'File tidak ditemukan atau tidak dapat ditulis';
    error_log('File tidak ditemukan atau tidak dapat ditulis: ' . $filePath);
  }
} else {
  $response['message'] = 'Metode permintaan tidak valid';
  error_log('Metode permintaan tidak valid untuk delete.php');
}

echo json_encode($response);