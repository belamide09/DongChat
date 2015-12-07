
  <div class="col-sm-6 pull-left">
    <?php echo $this->Form->create('User',array('class'=>'form-horizontal top')); ?>
    <?php $authFlash = $this->Session->flash('auth'); ?>
    <?php if($authFlash): ?>
      <div class="alert alert-warning">
        <?php echo $authFlash; ?>
      </div>
    <?php endif; ?>
    
    <div class="form-group">
      <label for="inputEmail3" class="col-sm-3 control-label"><?php echo __('Email') ?></label>
      <div class="col-sm-5">
        <?php echo $this->Form->text('email', array('label' => false, 'class'=>'form-control', 'placeholder'=>'Enter Email')) ?>
      </div>
    </div>
      <div class="form-group">
      <div class="col-sm-offset-3 col-sm-10">
        <button type="submit" class="btn btn-primary"><?php echo __('Sign In') ?></button>
        <?php echo $this->Html->link('Sign Up','/signup',array('class' => 'btn btn-success'))?>
      </div>
    </div>
  </form>
</div><!-- col1 -->

