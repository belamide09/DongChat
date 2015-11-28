<?php
App::uses('AppController', 'Controller');
class ChatRoomController extends AppController {
	public $uses = array(
		'RoomMember'
	);
	public function index($id) {
		$room = $this->RoomMember->findByUserId($this->Auth->user('id'));
		if ( !isset($room['RoomMember']) ) {
			return $this->redirect('/');
		} else if ( $room['RoomMember']['room_id'] !== $id ) {
			return $this->redirect('/');
		}
		$this->set('my_id',$this->Auth->user('id'));
		$this->set('room_id',$id);
	}
	public function getChatRoomMembers() {

	}
}