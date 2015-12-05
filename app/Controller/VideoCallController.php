<?php
App::uses('AppController', 'Controller');
class VideoCallController extends AppController {
	public $uses = array(
		'OnairUser',
		'RoomMember'
	);
	private function isOnAir() {
		$onair = $this->OnairUser->findById($this->Auth->user('id'));
		return isset($onair['OnairUser']) ? true : false;
	}
	public function index() {
		if ( !$this->isOnAir() ) {
			$room = $this->RoomMember->findByUserId($this->Auth->user('id'));
			$my_name = $this->Auth->user('firstname').' '.$this->Auth->user('lastname');
			if ( !isset($room['RoomMember']) ) {
				return $this->redirect('/');
			}
			$this->set('my_id',$this->Auth->user('id'));
			$this->set(compact('my_name'));
			$this->set('room_id',$room['RoomMember']['room_id']);
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
			$id = $user['User']['id'];
			$name = $user['User']['firstname'].' '.$user['User']['lastname'];
			$response['id'] = $id;
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