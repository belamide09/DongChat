<style>
.table-bordered>tbody>tr>td {
	vertical-align: middle;
}
#table-history {
	width: 1000px;
	margin: 0px auto;
}
.notification {
	width: 1000px;
	margin: 10px auto;
	display: none;
}
thead {
	background: #ddd;
}
th,td {
	text-align: center;
}
#chat-video {
	width: 1130px;
	left: 50px;
	height: 550px;
	position: fixed;
	background: #ddd;
	display: none;
}
#chat-video .video-container {
	width: 540px;
	display: inline-block;
}
#chat-video .video-container video {
	width: 500px;
	height: 500px;
	background: #000;
	margin-top: 20px;
}
.btn-close-video {
	float: right;
	margin: 5px;
}
</style>

<div id="chat-video">
	<button class="btn btn-danger btn-sm btn-close-video">X</button>
	<div id="sender" class="video-container">
		<center> <video id="user_1_video" autoplay></video> </center>
	</div>
	<div id="recipient" class="video-container">
		<center> <video id="user_2_video" autoplay></video> </center>
	</div>
</div>

<center> <h2> Chat Monitor </h2> </center>
<div class="notification"> 
	<div class="alert alert-success">
	  New chat has been created, <a href="">Refresh</a> to view it.
	</div>
</div>
<table class="table table-bordered" id="table-history">
	<thead>
		<tr>
			<th> # </th>
			<th> Chathash </th>
			<th> Started </td>
			<th> Sender </th>
			<th> Recipient </th>
			<th> Action </th>
		</tr>
	</thead>
	<tbody>
<?php if ($data):?>
	<?php foreach($data as $row):?>
		<?php $chat_id = $row['ChatHistory']['id']?>
		<?php $chat_hash = $row['ChatHistory']['chat_hash']?>
		<?php $sender_id = $row['ChatHistory']['sender_id']?>
		<?php $recipient_id = $row['ChatHistory']['recipient_id']?>
		<tr class="<?php echo $chat_hash?>">
			<td> <?php echo $row['ChatHistory']['id']?> </td>
			<td> <?php echo $row['ChatHistory']['chat_hash']?></td>
			<td> <?php echo $row['ChatHistory']['started']?> </td>
			<td> 
				<?php echo $row['Sender']['name']?>
				<?php echo $this->Form->input('resolution',array(
						'options' => array(
							140 => 140,
							240 => 240,
							360 => 360,
							480 => 640
						),
						'onchange' => 'ChangeResolution('.$row['Sender']['id'].','.$row['Recipient']['id'].',$(this).val())'
					))?>
			</td>
			<td>
				<?php echo $row['Recipient']['name']?>
				<?php echo $this->Form->input('resolution',array(
						'options' => array(
							140 => 140,
							240 => 240,
							360 => 360,
							480 => 640
						),
						'onchange' => 'ChangeResolution('.$row['Recipient']['id'].','.$row['Sender']['id'].',$(this).val())'
					))?>
			</td>
			<td>
				<a href="#" class="btn btn-default btn-view-video" chat-hash="<?php echo $row['ChatHistory']['chat_hash']?>">
					<i class="fa fa-video-camera"></i>
				</a>
				<a href="#" class="btn btn-default btn-kill" chat-id="<?php echo $chat_id?>" 
					 sender-id="<?php echo $sender_id?>" recipient-id="<?php echo $recipient_id?>" 
					 chat-hash="<?php echo $chat_hash?>">
					<i class="fa fa-stop"></i>
				</a>
			</td>
		</tr>
	<?php endforeach; ?>
<?php else: ?>
		<tr>
			<td colspan="6"> No Active Chat Found... </td>
		</tr>
<?php endif; ?>
	</tbody>
</table>

<?php echo $this->element('paginator'); ?>
<script>
var socket = io.connect(location.origin+':4000');
$(document).ready(function() {
	var peer;
	var sender_peer = '';
	var sender_stream = null;
	var recipient_peer = '';
	var recipient_stream = null;
	init();
	// Initialize peer
	function init() {
	  peer = new Peer({
	    host: location.origin.split('//')[1],
	    port: '4500',
	    path: '/',
	    debug: 2
	  });
	  peer.on('call', function(call) {
		  call.answer(window.localStream);
			call.on('stream', function(stream) {
				if ( call.peer == sender_peer ) {
					$('#sender video').prop('src', URL.createObjectURL(stream));
					sender_stream = stream;
				}
				if ( call.peer == recipient_peer) {
					$('#recipient video').prop('src', URL.createObjectURL(stream));
					recipient_stream = stream;
				}
			});
	  });
	}

  $(".btn-view-video").click(function(e) {
  	e.preventDefault();
  	$("#chat-video").show();
  	var chat_hash = $(this).attr('chat-hash');
  	var url = 'ChatMonitor/getChatPeer';
  	$.post(url,{chat_hash:chat_hash},function(data) {
  		sender_peer = data['sender_peer'];
  		recipient_peer = data['recipient_peer'];
  		socket.emit('get_video_stream',{chat_hash:chat_hash,peer:peer.id});
  	},'JSON');
  })

	$(".btn-close-video").click(function() {
		$("#chat-video").hide();
		if ( sender_stream != null ) {
			sender_stream.close();
			sender_stream = null;
		}
		if ( recipient_stream != null ) {
			recipient_stream.close();
			recipient_stream = null;
		}
	})

	socket.emit('get_remaining_time_arr');
	$(".btn-kill").click(function() {
		var confirmation = confirm('Are you sure you want to kill this chat?');
		if ( confirmation == true ) {
			var chat_id = $(this).attr('chat-id');
			var chat_hash = $(this).attr('chat-hash');
			var sender_id = $(this).attr('sender-id');
			var recipient_id = $(this).attr('recipient-id');
			socket.emit('kill_chat',{chat_id:chat_id,chat_hash:chat_hash,sender_id:sender_id,recipient_id:recipient_id});
		}
		return false;
	})
	socket.on('notify_new_chat',function(){ 
		$(".notification").fadeIn(1000);
	});
	socket.on('remove_chat',function(data) {
		$("."+data['chat_hash']).fadeOut();
	})
})

function ChangeResolution(user_id,partner_id,resolution) {
	var url = 'ChatMonitor/getPeer';
	$.post(url,{user_id:user_id},function(data) { 
		var data = {
	    partner_id: partner_id,
	    peer: data['peer'],
	    resolution: resolution,
	    bit_rate: ''
	  }
	  socket.emit('change_video_quality',data);
	},'JSON');
}

</script>