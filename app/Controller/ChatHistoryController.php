<?php
App::uses('AppController', 'Controller');
class ChatHistoryController extends AppController {
	public $components = array(
		'Paginator'
	);
	public function beforeFilter() {
		parent::beforeFilter();
		$this->Auth->allow('index');
	}
	public function index() {
	 	$this->Paginator->settings = array(
      'order' => array('ChatHistory.started' => 'DESC'),
      'limit'       => 10
    );
    $data = $this->paginate();
		$this->set(compact('data'));
	}
}