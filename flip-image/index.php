<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<link rel="stylesheet" type="text/css" href="css/index.css" />
	</head>
	<body>
		<?php for($i = 1; $i < 4; $i++): ?>
			
			<?php $class = 'flip-horizontal' ?>


			<img src="img/<?php echo $i ?>.png">
			<img src="img/<?php echo $i ?>.png" class="<?php echo $class ?>">
			<br>
		<?php endfor; ?>
	</body>
</html>