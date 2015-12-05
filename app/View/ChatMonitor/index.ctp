<style>
#table-history {
	width: 1000px;
	margin: 10px auto;
}
thead {
	background: #ddd;
}
th,td {
	text-align: center;
}
</style>
<center> <h1> Chat History </h1> </center>
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
	<?php foreach($data as $row):?>
		<tr>
			<td> <?php echo $row['ChatHistory']['id']?> </td>
			<td> <?php echo $row['ChatHistory']['chat_hash']?> </td>
			<td> <?php echo $row['ChatHistory']['started']?> </td>
			<td> <?php echo $row['Sender']['firstname'].' '.$row['Sender']['lastname']?> </td>
			<td> <?php echo $row['Recipient']['firstname'].' '.$row['Recipient']['lastname']?> </td>
			<td>
				<a href="#" class="btn btn-danger btn-xs">Kill <i class="fa fa-trash"></i></a>
			</td>
		</tr>
	<?php endforeach; ?>
	</tbody>
</table>
<?php echo $this->element('paginator'); ?>