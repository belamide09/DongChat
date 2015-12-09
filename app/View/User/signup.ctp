<style>
#img-profile {
  max-height: 400px;
}
</style>
<legend><?php echo __('Registration') ?></legend>
<?php $authSuccess = $this->Session->flash('auth'); ?>
<?php if($authSuccess): ?>
  <div class="alert alert-success">
    <?php echo $authSuccess; ?>
  </div>
<?php endif; ?>
<?php if ( isset($errors) ): ?>
<?php foreach($errors as $error): ?>
  <div class="alert alert-danger">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <?php echo __($error[0]); ?>
  </div>
<?php endforeach; ?>
<?php endif; ?>
<?php echo $this->Form->create('User',array('enctype'=>'multipart/form-data')); ?>
<table class="table table-bordered teacher-details">
  <tr>
    <td><?php echo __('Name') ?><span class="required">*</span></td>
    <td>
      <?php echo $this->Form->input('name', array(
        'type' => 'text',
        'name' => 'data[User][name]',
        'value' => isset($data['User']['name']) ? $data['User']['name'] : null,
        'label' => false,
        'class' => 'form-control',
        'maxlength' => 50,
        'placeholder' => __('Name'),
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
   <td><?php echo __('Profile Picture') ?><span class="required">*</span></td>     
   <td>
    <div class="media">
      <div class="media-middle">
        <img class="media-object custom-image" src="img/emptyprofile.jpg" alt="" style="" id="img-profile">
      </div>
    </div>
      <?php
        echo $this->Form->input('photo', array(
          'name' => 'data[User][photo]',
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

<script>
$(document).ready(function() {
  $(document).on("change", "#uploadFile",function(){
    var files = !!this.files ? this.files : [];
    imagePreview(files, "#img-profile");
  });
  function imagePreview(files, event) {
    if (!files.length || !window.FileReader) return;
    
    
    if (/^image/.test( files[0].type)){ 
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        imageName = files[0].name;
        reader.onloadend = function(){ 
            $(event).attr("src", this.result);
        }
    }
  }
});
</script>