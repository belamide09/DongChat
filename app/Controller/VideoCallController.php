<?php
App::uses('AppController', 'Controller');
class VideoCallController extends AppController {
	public $uses = array(
		'OnairUser',
		'Room',
		'User'
	);
	private function isOnAir() {
		$onair = $this->OnairUser->findById($this->Auth->user('id'));
		return isset($onair['OnairUser']) ? true : false;
	}
	private function getRoom() {
		$conditions = array(
			'OR' => array(
				'Room.user_1' => $this->Auth->user('id'),
				'Room.user_2' => $this->Auth->user('id')
			)
		);
		$data = $this->Room->find('first',array(
			'conditions' => $conditions
			));
		return $data;
	}
	public function index() {
		$my_id = $this->Auth->user('id');
		$room  	= $this->getRoom();
		if ( !isset($room['Room'])) {
			$this->autoRender = false;
			return $this->redirect('/');
		} else {
			$partner_id 	= $room['Room']['user_1'] == 	$my_id ? $room['Room']['user_2'] : $room['Room']['user_1'];
			$partner_type = $room['Room']['user_1'] == 	$my_id ? 'user_1' : 'user_2';
			$partner_name = "";
			$disabled_video = $this->Session->read('disabled_video');
			$disabled_video = $disabled_video ? 1 : 0;
			if ( !empty($partner_id) ) {
				$partner = $this->User->findById($partner_id);
				$partner_name = $partner['User']['name'];
			}
			$this->set(compact('partner_id'));
			$this->set(compact('partner_type'));
			$this->set(compact('partner_name'));
		}
		$room_id = $room['Room']['id'];
		$my_name = $this->Auth->user('name');
		$this->set(compact('my_id'));
		$this->set(compact('my_name'));
		$this->set(compact('room_id'));
		$this->set(compact('disabled_video'));
	}
	public function disableVideo() {
		if ( $this->request->is('post') ) {
			$this->autoRender = false;
			$disabled = $this->request->data['disabled'];
			$this->Session->write('disabled_video', $disabled);
		} else {
			return $this->redirect('/');
		}
	}
	public function getName() {
		if ( $this->request->is('post') ) {
			$this->autoRender = false;
			$peer = $this->request->data['peer'];
			$user = $this->OnairUser->findByPeer($peer);
			$id = $user['User']['id'];
			$name = $user['User']['name'];
			$response['id'] = $id;
			$response['name'] = $name;
			echo json_encode($response);
		} else {
			return $this->redirect('/');
		}
	}
	public function getPartnerPeer() {
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