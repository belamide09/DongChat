<?php
App::uses('AppController', 'Controller');
App::uses('BlowfishPasswordHasher', 'Controller/Component/Auth');
class UserController extends AppController {
  public $uses = array(
    'User'
  );
	public function beforeFilter() {
		parent::beforeFilter();
		$this->Auth->allow('signup');
	}
	public function login() {
		if($this->request->is('post')){
      $username = $this->request->data['User']['email'];
      $conditions = array(
        'email' => $username
      );
      $data = $this->User->find('first',array('conditions'=>$conditions));
      if(isset($data['User'])){
        $user = $data['User'];
        $error = false;
        if($user['status'] == 0){
          $error = __('Your account is not yet activated');
        }
        if(!$error){
          $this->Auth->login($user);
          $this->redirect('/');
        }else{
          $this->Session->setFlash($error,'default',array(),'auth');
        }
      }else{
        $this->Session->setFlash(__('Incorrect Login ID'),'default',array(),'auth');
      }
    }
	}

	public function signup() {
    if ( $this->request->is('post') ) {
      if ( $this->User->save($this->request->data) ) {
        $this->Session->setFlash(__('You have successfully registered'),'default',array(),'auth');
        return $this->redirect('/signup');
      }
    }
	}

  public function logout() {
    $this->Auth->logout();
    return $this->redirect('/login');
  }

}