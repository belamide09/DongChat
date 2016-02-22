<?php
App::uses('AppController', 'Controller');
class MainRoomController extends AppController {
	private function hasCurrentRoom() {
		$conditions = array(
			'OR' => array(
				'Room.user_1' => $this->Auth->user('id'),
				'Room.user_2' => $this->Auth->user('id')
			)
		);
		$room = ClassRegistry::init('Room')->find('first',array(
			'conditions' => $conditions
			)
		);
		return isset($room['Room']) ? true : false;
	}
	public function index() {
		if ( $this->hasCurrentRoom() ) {
			$this->autoRender = false;
			return $this->redirect('https://dongchat.local/DongChat/VideoCall');
		}
		$my_name = $this->Auth->user('name');
		$this->set(compact('my_name'));
		$this->set('my_id',$this->Auth->user('id'));
	}
}