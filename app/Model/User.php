<?php
App::uses('ImageResize','lib');
App::uses('BlowfishPasswordHasher', 'Controller/Component/Auth');
class User extends AppModel {

	public function beforeSave($options = array()) {
    $imageRes = new ImageResize();
    $this->data['User']['status'] 	= 1;
    if ( isset($this->data['User']['photo']) ) {
      $data = $this->data['User']['photo'];
      $path = dirname(__FILE__).'/../../app/webroot/user_image/';
      $file = $imageRes->resize($data, 300, 220, $path);
      $this->data['User']['photo'] = $file;
    }
  }
}