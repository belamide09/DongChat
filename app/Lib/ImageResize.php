<?php

class ImageResize {
	
	public $imgsrc = null;
	public $tmpsrc = null;
	public $tmp = null;
	public $type = null;
	public $mode = 0;
	
	/**
	 * Process resize image according to its dimesion
	 * @param unknown $src = file source
	 * @param unknown $width = set width of the image ex:(250)
	 * @param unknown $height = set height  of the image ex:(250)
	 * @return string temp name of the image
	 */
	public function resize($src = null, $width = 0, $height = 0, $path = null){
		$file = $src;
		$tmppath = $path;
		if (!file_exists($tmppath)) {
			mkdir($tmppath, 0777, true);
		}
		if (empty($file['tmp_name'])) {
			return '';
		}
		/* Get original image x y*/
		list($w, $h) = getimagesize($file['tmp_name']);
		if (empty($w) || empty($h)) {
			return false;
		}
		
		$newWidth = $width;
		$rate = ($newWidth / $w);
		$newHeight = $rate * $h;
	
		$this->type = $file['type'];
		$ext = $this->getExtenstionType($file['tmp_name']); //extension .gif , .jpeg and png
	
		$this->tmp = imagecreatetruecolor($newWidth, $newHeight);
		$color  = imagecolorallocate ($this->tmp, 255, 255, 255);
	
		/* new file name */
		$this->imgsrc = $tmppath.'img'.date('Ymdis').'.'.$ext;
		$this->imgsrc = $tmppath.basename(tempnam($this->imgsrc, 'img'), '.tmp').'.'.$ext;
		switch ($ext) {
			case 'png' 	:
				imagealphablending($this->tmp, false);
				imagesavealpha($this->tmp,true);
				$transparent = imagecolorallocatealpha($this->tmp, 255, 255, 255, 127);
				imagefilledrectangle($this->tmp, 0, 0, $newWidth, $newHeight, $transparent);
				break;
			default:
				imagefill($this->tmp, 0, 0, $color);
		}
		$image = $this->createImageFrom($file['tmp_name'], $ext);
		imagecopyresampled($this->tmp, $image,0, 0,0, 0,$newWidth, $newHeight, $w, $h);
		$image = $this->imgsrc;
		$this->UploadProcess();
		return str_replace($tmppath, '', $this->imgsrc);
		

	}
	
	/**
	 * Proccess Image upload  ex:(gif , jpeg, png,)
	 * default upload direct file to folder
	 * @param unknown $ext
	 */
	public function UploadProcess(){
		switch ($this->type) {
			case 'image/jpeg':
				imagejpeg($this->tmp, $this->imgsrc, 90);
				break;
			case 'image/png':
				imagepng($this->tmp, $this->imgsrc, 0);
				break;
			case 'image/gif':
				imagegif($this->tmp, $this->imgsrc, 90);
				break;
			default:
				move_uploaded_file($this->tmp, $this->imgsrc);
				break;
		}
	}
	
	function getExtenstionType($file) {
		$ext = 'jpg';
		switch(exif_imagetype($file)) {
			case IMAGETYPE_GIF: $ext = 'gif'; break;
			case IMAGETYPE_JPEG: $ext = 'jpg'; break;
			case IMAGETYPE_PNG: $ext = 'png'; break;
		}
		return $ext;
	}
	
	function createImageFrom($src, $ext) {
		$img = '';
		switch($ext) {
			case 'png' 	:
			case 'PNG' 	:
				$img = imagecreatefrompng($src);
				break;
			case 'jpg' 	:
			case 'JPG' 	:
			case 'jpeg' :
			case 'JPEG' :
				$img = imagecreatefromjpeg($src);
				break;
			case 'gif' 	:
			case 'GIF'	:
				$img = imagecreatefromgif($src);
				break;
		}
		return $img;
	}
	
}