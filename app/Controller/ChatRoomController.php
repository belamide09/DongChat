<?php
App::uses('AppController', 'Controller');
class ChatRoomController extends AppController {
	public $uses = array(
		'OnairUser',
		'Room',
		'RoomMember'
	);
	private function isOnAir() {
		$onair = $this->OnairUser->findById($this->Auth->user('id'));
		return isset($onair['OnairUser']) ? true : false;
	}
	public function index($id) {
		if ( !$this->isOnAir() ) {
			$room = $this->RoomMember->findByUserId($this->Auth->user('id'));
			if ( !isset($room['RoomMember']) ) {
				return $this->redirect('/');
			} else if ( $room['RoomMember']['room_id'] !== $id ) {
				return $this->redirect('/');
			}
			$host = $this->isHost($room['RoomMember']['room_id']);
			$this->set('my_id',$this->Auth->user('id'));
			$this->set('room_id',$id);
			$this->set(compact('host'));
		} else {
			echo "<big>Please login and logout</big>";
			die();
		}
	}
	private function isHost($room) {
		$conditions = array(
			'id' 		=> $room,
			'host' 	=> $this->Auth->user('id')
		);
		$room = $this->Room->find('first',array(
			'conditions' => $conditions
			)
		);
		return isset($room['Room']) ? true : false;
	}
}