<?php
App::uses('AppController', 'Controller');
class ChatRoomController extends AppController {
	public $uses = array(
		'OnairUser',
		'RoomMember'
	);
	private function isOnAir() {
		$onair = $this->OnairUser->findById($this->Auth->user('id'));
		return isset($onair['OnairUser']) ? true : false;
	}
	public function index($id) {
		if ( !$this->isOnAir() ) {
			$room = $this->RoomMember->findByUserId($this->Auth->user('id'));
			$my_name = $this->Auth->user('firstname').' '.$this->Auth->user('lastname');
			if ( !isset($room['RoomMember']) ) {
				return $this->redirect('/');
			} else if ( $room['RoomMember']['room_id'] !== $id ) {
				return $this->redirect('/');
			}
			$this->set('my_id',$this->Auth->user('id'));
			$this->set(compact('my_name'));
			$this->set('room_id',$id);
		} else {
			echo "<big>Please login and logout</big>";
			die();
		}
	}
}