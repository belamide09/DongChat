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
			if ( !isset($room['RoomMember']) ) {
				return $this->redirect('/');
			} else if ( $room['RoomMember']['room_id'] !== $id ) {
				return $this->redirect('/');
			}
			$this->set('my_id',$this->Auth->user('id'));
			$this->set('room_id',$id);
		} else {
			echo "<big>Please login and logout</big>";
			die();
		}
	}
	public function getName() {
		if ( $this->request->is('post') ) {
			$this->autoRender = false;
			$peer = $this->request->data['peer'];
			$user = $this->OnairUser->findByPeer($peer);
			$name = $user['User']['firstname'].' '.$user['User']['lastname'];
			$response['name'] = $name;
			echo json_encode($response);
		} else {
			return $this->redirect('/');
		}
	}
	public function getPeer() {
		if ( $this->request->is('post') ) {
			$this->autoRender = false;
			$user = $this->OnairUser->findById($this->request->data['user_id']);
			$response['peer'] = $user['OnairUser']['peer'];
			echo json_encode($response);
		} else {
			return $this->redirect('/');
		}
	}
}