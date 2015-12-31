<?php
App::uses('AppController', 'Controller');
class ChatMonitorController extends AppController {
	public $components = array(
		'Paginator'
	);
	public $uses = array(
		'ChatHistory',
		'OnairUser'
	);
	public function beforeFilter() {
		parent::beforeFilter();
		$this->Auth->allow();
	}
	public function index() {
		$conditions = array(
			'ChatHistory.end' => null,
			'OR' => array(
				'ChatHistory.sender_id IN (Select id from onair_users as OnairUser where chat_hash = ChatHistory.chat_hash)',
				'ChatHistory.recipient_id IN (Select id from onair_users as OnairUser where chat_hash = ChatHistory.chat_hash)'
			)
		);
		$this->Paginator->settings = array(
			'conditions' => $conditions,
      'order' => array('ChatHistory.started' => 'DESC'),
      'limit'       => 10
    );
    $data = $this->paginate();
		$this->set(compact('data'));
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
	public function getChatPeer() {
		if ( $this->request->is('post') ) {
			$this->autoRender = false;
			$chat_hash = $this->request->data['chat_hash'];
			$chat = $this->ChatHistory->findByChatHash($chat_hash);
			$sender = $this->OnairUser->findById($chat['Sender']['id']);
			$recipient = $this->OnairUser->findById($chat['Recipient']['id']);
			$response['sender_peer'] = isset($sender['OnairUser']) ? $sender['OnairUser']['peer'] : '';
			$response['recipient_peer'] = isset($recipient['OnairUser']) ? $recipient['OnairUser']['peer'] : '';
			echo json_encode($response);
		} else {
			return $this->redirect('/');
		}
	}
}