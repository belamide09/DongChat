<?php
App::uses('AppController', 'Controller');
class UsersController extends AppController {
  public $uses = array(
    'User',
    'OnlineUser'
  );
	public function beforeFilter() {
		parent::beforeFilter();
		$this->Auth->allow('signup');
	}
	public function login() {
		if($this->request->is('post')){
      $username = $this->request->data['User']['email'];
      $password = AuthComponent::password($this->request->data['User']['password']);
      $conditions = array(
        'email' => $username,
        'password' => $password
      );
      $data = $this->User->find('first',array('conditions'=>$conditions));
      if(isset($data['User'])){
        $user = $data['User'];
        $error = false;
        if($user['status'] == 0){
          $error = __('Your account is not yet activated');
        }
        if(!$error){
          if(isset($this->request->data['User']['rememberMe']) && $this->request->data['User']['rememberMe'] == 1){
            $cookieTime = Configure::read("cookieTime");
            $cookeData = array(
              'aal' => myTools::encode($this->request->data['User']['login_id']),
              'aap' => myTools::encode(AuthComponent::password($this->request->data['User']['password']))
            );
            $this->Cookie->write('adminRememberMe',$cookeData,true,$cookieTime);
          }
          $this->appendOnlineUser($user['id']);
          $this->Auth->login($user);
          
          //added referrer
          $referrerVal = $this->Session->read('referrer');
          /* destroy session variable: referrer */
          $this->Session->delete('referrer');
           
          return $this->redirect('' != $referrerVal ? $referrerVal : '/');
           
        }else{
          $this->Session->setFlash($error,'default',array(),'auth');
        }
      }else{
        $this->Session->setFlash(__('Login ID or password is incorrect'),'default',array(),'auth');
      }
    }
	}

	public function signup() {

	}

  public function logout() {
    $this->Auth->logout();
    return $this->redirect('/users/login');
  }

  public function appendOnlineUser($id) {
    $data = array('OnlineUser' =>array(
      'id'                => $id,
      'created_datetime'  => date('YmdHis'),
      'created_ip'        => $this->request->clientIp()
      )
    );
    $this->OnlineUser->save($data);
  }
}