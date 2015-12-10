<?php
App::uses('AppController', 'Controller');
class MainRoomController extends AppController {
	public function index() {
		$my_name = $this->Auth->user('name');
		$this->set(compact('my_name'));
		$this->set('my_id',$this->Auth->user('id'));
	}
}