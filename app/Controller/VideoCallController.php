<?php
App::uses('AppController', 'Controller');
class VideoCallController extends AppController {
	public function index($chat_hash = '') {
		if ( empty($chat_hash) ) {
			return $this->redirect('/');
		}
	}
}