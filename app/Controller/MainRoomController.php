<?php
App::uses('AppController', 'Controller');
class MainRoomController extends AppController {
	public $uses = array(
		'RoomMember',
		'OnlineUser'
	);

	public function index() {
		$room = $this->RoomMember->findByUserId($this->Auth->user('id'));
		$my_name = $this->Auth->user('firstname').' '.$this->Auth->user('lastname');
		$my_name = ucwords($my_name);
		if ( isset($room['RoomMember']) ) {
			return $this->redirect('/ChatRoom');
		}
		$this->set(compact('my_name'));
		$this->set('my_id',$this->Auth->user('id'));
	}
}