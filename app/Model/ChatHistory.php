<?php
class ChatHistory extends AppModel {
	public $belongsTo = array(
		'Sender' => array(
			'fields' => array(
				'Sender.id',
				'Sender.firstname',
				'Sender.middlename',
				'Sender.lastname'
			),
			'className' => 'User',
			'foreignKey' => false,
			'conditions' => array(
				'ChatHistory.sender_id = Sender.id'
			)
		),
		'Recipient' => array(
			'fields' => array(
				'Recipient.id',
				'Recipient.firstname',
				'Recipient.middlename',
				'Recipient.lastname'
			),
			'className' => 'User',
			'foreignKey' => false,
			'conditions' => array(
				'ChatHistory.recipient_id = Recipient.id'
			)
		)
	);
}