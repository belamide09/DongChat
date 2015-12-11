<script> var my_id = "<?php echo $my_id; ?>"; </script>
<script> var my_name = "<?php echo $my_name; ?>"; </script>
<?php echo $this->Html->css('mainroom')?>
<?php echo $this->Html->script('peer')?>
<?php echo $this->Html->script('mainroom')?>
<?php echo $this->Html->script('mainroom_node')?>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="my-webcam-container">
			<video id="my-webcam" muted="true" autoplay></video>
		</div>
		<div id="side">
			<div id="rooms">
				<legend> <center> Room List </center> </legend>
				<div id="room-list">
				</div>
				<div class="create-room">
					<a href="/dongdong/VideoCall" class="btn btn-primary btn-xs btn-new-room"> Create </a>
				</div>
			</div>
		</div>
	</div>
</div>