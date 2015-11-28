<?php
App::uses('AppController', 'Controller');
class MainRoomController extends AppController {
	public $uses = array(
		'RoomMember',
		'OnlineUser'
	);

	public function index() {
		$room = $this->RoomMember->findByUserId($this->Auth->user('id'));
		if ( isset($room['RoomMember']) ) {
			return $this->redirect('/ChatRoom/'.$room['RoomMember']['room_id']);
		}
		$this->set('my_id',$this->Auth->user('id'));
	}
}