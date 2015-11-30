<?php
class OnairUser extends AppModel {
	public $belongsTo = array(
		'User' => array(
			'foreignKey' => 'id'
		)
	);
}