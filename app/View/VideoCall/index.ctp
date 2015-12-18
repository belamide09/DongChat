<script>
var room_id = "<?php echo $room_id?>";
var partner_type = "<?php echo $partner_type?>";
var partner_id = "<?php echo $partner_id?>";
var partner_name = "<?php echo $partner_name?>";
var my_id = "<?php echo $my_id?>";
var my_name = "<?php echo $my_name?>";
var disabled_video = <?php echo $disabled_video?>;
</script>
<?php echo $this->Html->script('peer.min')?>
<?php echo $this->Html->css('video_call')?>
<?php echo $this->Html->script('video_call')?>
<?php echo $this->Html->script('video_call_node')?>
<div id="header">
	<a class="btn btn-sm btn-leave disable" rel="modal" href="#dialog_logout">LEAVE</a>
	<div id="remaining-time-container">
		<span class="cnt_time" id="remaining-time">--:--</span>
		<a href="#" class="btn btn-default btn-xs btn-start-chat <?php echo empty($partner_id) ? 'disabled' : 'onn'?>" title="Start chat" <?php if (empty($partner_id)) echo ' disabled'?>>
			<div></div>
		</a>
	</div>
</div>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<center> <video id="my-webcam" muted="true" autoplay></video> </center>
			</div>
			<div id="buttons">
				<a href="#" class="btn btn-default btn-xs btn-disable-video <?php echo $disabled_video ? 'off' : 'onn'?>" disable-video="<?php echo $disabled_video?>">
					<div></div>
				</a>
				<a href="#" class="btn btn-default btn-xs btn-sound-control off">
					<div></div>
				</a>
				<a href="#" class="btn btn-default btn-xs btn-resolution-control onn" title="Video resolution">
					<div></div>
				</a>
				<ul id="resolution-list" style="display:none;">
					<li data-value="140">140</li>
					<li data-value="240">240</li>
					<li data-value="360" class="selected">360</li>
					<li data-value="640">640</li>
				</ul>
			</div>
		</div>
		<div id="partner-webcam-container">
			<center> <video id="partner-webcam" height="100%" width="100%" autoplay></video> </center>
		</div>
		<div id="chatbox-container">
			<div id="conversations">
				<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>
			</div>
			<div id="chatbox-input">
				<input type="submit" value="Send" class="btn btn-primary" id="send">
				<input type="text" class="form-control" id="txt-message">
			</div>
		</div>
	</div>
</div>