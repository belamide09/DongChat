<?php
App::uses('AppController', 'Controller');
class ChatMonitorController extends AppController {
	public $components = array(
		'Paginator'
	);
	public $uses = array(
		'ChatHistory'
	);
	public function beforeFilter() {
		parent::beforeFilter();
		$this->Auth->allow('index');
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
}