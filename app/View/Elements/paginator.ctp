<?php

$pagination = $this->params['paging'];
$model		 	= array_keys($pagination);
$pages			= $pagination[$model[0]]['pageCount'];

?>
<?php $paginator = $this->paginator; ?>

<?php if ($pages > 1): ?>

<center>
  
  <div class="pagination" style="font-size:10px;">
    <?php
    	echo $this->Paginator->first('<<' . __('First'), array('tag' => 'li'), null, array('class' => 'disabled', 'tag'=>'li', 'disabledTag' => 'a'));
      echo $this->Paginator->prev('<' . __('Prev'), array('tag' => 'li'), null, array('class' => 'disabled', 'tag'=>'li', 'disabledTag' => 'a'));
      echo $this->Paginator->numbers(array(
        'tag' => 'li',
        'modulus' => 10,
        'separator' => '',
        'currentTag' => 'a',
        'currentClass' => 'active'
      ));
      echo $this->Paginator->next(__('Next') . '>',array('tag' => 'li'), null, array('class' => 'disabled', 'tag'=>'li', 'disabledTag' => 'a'));
      echo $this->Paginator->last(__('Last') . '>>', array('tag' => 'li'), null, array('class' => 'disabled', 'tag'=>'li', 'disabledTag' => 'a'));
    ?>
    <br>
    <?php echo $this->Paginator->counter(array('format' => __('{:count} '.__('Item').' ({:page} / {:pages})')));?>    
  </div>
</center>
<?php else: ?>
    <br>
<?php endif; ?>