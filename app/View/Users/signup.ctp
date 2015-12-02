<legend><?php echo __('Registration') ?></legend>
<?php $authSuccess = $this->Session->flash('auth'); ?>
<?php if($authSuccess): ?>
  <div class="alert alert-success">
    <?php echo $authSuccess; ?>
  </div>
<?php endif; ?>
<?php echo $this->Form->create('User'); ?>
<table class="table table-bordered teacher-details">
  <tr>
    <td><?php echo __('First name') ?><span class="required">*</span></td>
    <td>
      <?php echo $this->Form->input('firstname', array(
        'type' => 'text',
        'name' => 'data[User][firstname]',
        'value' => isset($data['User']['firstname']) ? $data['User']['firstname'] : null,
        'label' => false,
        'class' => 'form-control',
        'maxlength' => 50,
        'placeholder' => __('First name'),
        'required' => true
      )) ?>
    </td>
  </tr>
  <tr>
    <td><?php echo __('Middle name') ?><span class="required">*</span></td>
    <td>
      <?php echo $this->Form->input('middlename', array(
        'type' => 'text',
        'name' => 'data[User][middlename]',
        'value' => isset($data['User']['middlename']) ? $data['User']['middlename'] : null,
        'label' => false,
        'class' => 'form-control',
        'maxlength' => 50,
        'placeholder' => __('Middle name'),
        'required' => true
      )) ?>
    </td>
  </tr>
  <tr>
    <td><?php echo __('Last name') ?><span class="required">*</span></td>
    <td>
      <?php echo $this->Form->input('lastname', array(
        'type' => 'text',
        'name' => 'data[User][lastname]',
        'value' => isset($data['User']['lastname']) ? $data['User']['lastname'] : null,
        'label' => false,
        'div' => false,
        'class' => 'form-control',
        'maxlength' => 50,
        'placeholder' => __('Last name'),
        'required' => true
      )) ?>
    </td>
  </tr>
  <tr>
    <td><?php echo __('Email'); ?><span class="required">*</span></td>
    <td>
     <?php echo $this->Form->input('email', array(
        'type' => 'email',
        'name' => 'data[User][email]',
        'value' => isset($data['User']['email']) ? $data['Employee']['email'] : null,
        'label' => false,
        'div' => false,
        'class' =>'form-control',
        'placeholder'=> __('Enter email address'),
        'required' => true,
        'error' => false
      )) ?>
    </td>
  </tr>
  <tr>
    <td><?php echo __('Password') ?><span class="required">*</span></td>
    <td>
      <?php echo $this->Form->input('password', array(
        'type' => 'password',
        'name' => 'data[User][password]',
        'value' => isset($data['User']['password']) ? $data['User']['password'] : null,
        'label' => false,
        'div' => false,
        'maxlength' => 50,
        'class' => 'form-control',
        'placeholder' => __('Enter Password'),
        'required' => true,
        'error' => false
      )) ?>
    </td>
  </tr>
  </tr>
    <td><?php echo __('Gender') ?><span class="required">*</span></td>
    <td>
      <?php echo $this->Form->input('gender', array(
            'value' => isset($data['User']['gender']) ? $data['User']['gender'] : null,
            'type' => 'radio',
            'name' => 'data[User][gender]',
            'before' => '<label>&nbsp;',
            'separator' => '</label><label>&nbsp;',
            'after' => '</label>',
            'div' => false,
            'label' => false,
            'legend' => false,
            'options' => array(1 => __('Male'), 2 => __('Female')),
            'required' => true,
            'default' => 1
        )) ?>
    </td>
  </tr>
  <tr>
   <td><?php echo __('Profile Picture') ?><span class="required">*</span></td>     
   <td>
    <div class="media">
      <div class="media-middle">
        <img class="media-object custom-image" src="/img/emptyprofile.jpg" alt="" style="" id="img-profile">
      </div>
    </div>
      <?php
        echo $this->Form->input('photo', array(
          'name' => 'data[Profile][photo]',
          'type' => 'file',
          'accept' => 'image/*',
          'class' => 'file',
          'required' => true,
          'label' => false,
          'error' => false,
          'id' => 'uploadFile'
        ));
      ?>
    </div>
   </td>
  </tr>
  <tr>
    <td> </td>
    <td>
      <?php echo $this->Form->submit('Register',array('class'=>'btn btn-primary')); ?>
    </td>
  </tr>
</table>
<?php echo $this->Form->end(); ?>