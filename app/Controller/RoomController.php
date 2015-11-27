<?php
App::uses('AppController', 'Controller');
class RoomController extends AppController {
	public $uses = array(
		'OnlineUser',
		'UsePeer'
	);
	public function index() {
	}
	public function addOnlineuser() {
		if ( $this->request->is('post') ) {
			$this->autoRender = false;
			$online 		= $this->OnlineUser->findById($this->Auth->user('id'));
			$onlineUser = array('OnlineUser' => array(
				'id' 								=> $this->Auth->user('id')
				)
			);
			if ( !isset($online['OnlineUser']) ) {
				$onlineUser['OnlineUser']['created_datetime'] = date('YmdHis');
				$onlineUser['OnlineUser']['created_ip']				= $this->request->clientIp();
			}
			$usePeer = array(
				'UsePeer' => array(
				'user_id' 					=> $this->Auth->user('id'),
				'peer_id' 					=> $this->request->data['peer'],
				'created_datetime' 	=> date('YmdHis'),
				'created_ip'				=> $this->request->clientIp()
				)
			);
			$this->OnlineUser->save($onlineUser);
			$this->UsePeer->save($usePeer);
		} else {
			$this->redirect('/');
		}
	}
}